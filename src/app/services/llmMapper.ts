// Semantic query → category mapping via a free LLM provider (see llmClient.ts).
//
// Two modes, sharing one core call:
//  - buildCategoriesWithLLM:    query → official complaint-type labels (always available)
//  - buildTagCategoriesWithLLM: query → per-record facet tags (available when the
//    dataset was enriched offline by scripts/tagRecords.mjs)
//
// Dashboard falls back to the regex mapper in buckets.ts on any error or when
// no provider is configured.

import { MainCategory, SubCategory } from '../types';
import { BUCKETS, BUCKET_LETTERS } from '../buckets';
import { callLLMJson, isLLMConfigured } from './llmClient';

export { isLLMConfigured };

// Canonical complaint types from the sanitation_set, keyed by exact name so
// dynamic categories reuse the same SubCategory objects (stable DnD ids).
const SUB_BY_NAME: Map<string, SubCategory> = new Map(
  BUCKET_LETTERS.flatMap(l => BUCKETS[l].subCategories.map(s => [s.name, s] as const)),
);
const ALL_TYPE_NAMES = [...SUB_BY_NAME.keys()];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Plain JSON schema (no additionalProperties — Gemini's responseSchema rejects it;
// unknown extra fields are harmless since we only read known ones).
// enum pins the model to the known vocabulary — no invented labels.
const makeSchema = (vocabulary: string[]) => ({
  type: 'object',
  properties: {
    categories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          items: { type: 'array', items: { type: 'string', enum: vocabulary } },
        },
        required: ['title', 'items'],
      },
    },
  },
  required: ['categories'],
});

const SHARED_RULES = `Rules:
- Include labels for the condition the query describes AND for its likely causes and downstream effects. Example: for a query about clogged catch basins, include the debris that causes clogs (trash, litter, tree debris, missed collection) as well as the resulting conditions (standing water, flooding, drainage).
- Be inclusive: it is better to include a plausibly relevant label than to omit it. Aim for 6-15 labels on broad queries; a narrow query may need only 1-3.
- Group the selected labels into 2-5 semantic categories with short Title Case names that reflect the query's intent.
- Each label may appear in at most one category.
- Match on meaning, not keywords: e.g. "drain blockages" covers sewer and standing-water labels; "rats" covers rodent and dead-animal labels.
- Leave genuinely irrelevant labels out; they become "Excluded".
- Use only labels from the provided list, spelled exactly as given.`;

const TYPE_PROMPT = `You map a data analyst's plain-English query about NYC 311 data to the official 311 complaint-type labels it semantically covers.

${SHARED_RULES}`;

// NB: don't mention how many tags each *record* carries — the model anchors on
// that number and under-selects. Talk only about selecting query-relevant tags.
const TAG_PROMPT = `You map a data analyst's plain-English query about NYC 311 data to semantic facet tags. Records are pre-tagged with these facets, so selecting a tag retrieves every record touching that facet — a trash-clogged catch basin is reachable through its trash, catch-basin, and standing-water facets alike.

${SHARED_RULES}`;

interface LLMGroup {
  title: string;
  items: string[];
}

async function mapQueryToGroups(
  query: string,
  vocabulary: string[],
  systemPrompt: string,
  vocabularyLabel: string,
): Promise<LLMGroup[]> {
  const text = await callLLMJson({
    system: systemPrompt,
    user: `${vocabularyLabel}:\n${vocabulary.join('\n')}\n\nAnalyst query: "${query}"`,
    schema: makeSchema(vocabulary),
  });
  const parsed = JSON.parse(text) as { categories?: LLMGroup[] };
  return parsed.categories ?? [];
}

// Assemble MainCategory[] from LLM groups: dedupe (first occurrence wins),
// letter-prefix titles, and an Excluded column holding the rest of the vocabulary.
function assembleCategories(
  groups: LLMGroup[],
  vocabulary: string[],
  toSub: (name: string) => SubCategory,
): MainCategory[] {
  const used = new Set<string>();
  const main: MainCategory[] = [];

  for (const group of groups) {
    const subs = (group.items ?? [])
      .filter(name => vocabulary.includes(name) && !used.has(name))
      .map(name => {
        used.add(name);
        return toSub(name);
      });
    if (subs.length === 0) continue;
    main.push({
      id: `llm-cat-${main.length}`,
      title: `${LETTERS[main.length] ?? '·'} · ${group.title}`,
      color: 'bg-white border-gray-200',
      subCategories: subs,
    });
  }

  if (main.length === 0) throw new Error('LLM returned no usable categories');

  main.push({
    id: 'excluded',
    title: 'Excluded (Irrelevant)',
    color: 'bg-gray-100 border-gray-200',
    subCategories: vocabulary.filter(n => !used.has(n)).map(toSub),
  });

  return main;
}

// Query → official complaint-type labels.
export async function buildCategoriesWithLLM(query: string): Promise<MainCategory[]> {
  const groups = await mapQueryToGroups(query, ALL_TYPE_NAMES, TYPE_PROMPT, 'Available 311 complaint types');
  return assembleCategories(groups, ALL_TYPE_NAMES, name => SUB_BY_NAME.get(name)!);
}

// Query → facet tags (record-level semantic matching). `tagVocabulary` is the
// set of tags actually present in the loaded dataset.
export async function buildTagCategoriesWithLLM(query: string, tagVocabulary: string[]): Promise<MainCategory[]> {
  const groups = await mapQueryToGroups(query, tagVocabulary, TAG_PROMPT, 'Available facet tags');
  return assembleCategories(groups, tagVocabulary, name => ({ id: `tag-${slug(name)}`, name }));
}
