// Curated query → official-311-category mappings.
//
// These are the three sample questions the deployed (GitHub Pages) build is
// guaranteed to answer correctly without calling any model. The public site has
// no LLM: visitors can't reach the presenter's local Ollama, so the Extractor
// resolves these three exactly, and falls back to keyword matching otherwise.
//
// Every `types` entry must be an official 311 complaint type from buckets.ts —
// the semantic layer only ever *groups* official labels, it never invents them.

import { MainCategory, SubCategory } from './types';
import { BUCKETS, BUCKET_LETTERS } from './buckets';

const SUB_BY_NAME: Map<string, SubCategory> = new Map(
  BUCKET_LETTERS.flatMap(l => BUCKETS[l].subCategories.map(s => [s.name, s] as const)),
);
export const ALL_TYPE_NAMES = [...SUB_BY_NAME.keys()];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export interface CuratedGroup {
  title: string;
  types: string[];
}

// The demo query is first: it is the one the pitch narrates end-to-end.
export const CURATED_QUERIES: { query: string; chip: string; groups: CuratedGroup[] }[] = [
  {
    query: 'Show me everything that could clog catch basins before a storm',
    chip: 'Catch basins',
    groups: [
      {
        // Causes: debris that physically enters and blocks the drain.
        title: 'Debris Sources',
        types: [
          'Dirty Condition',
          'Illegal Dumping',
          'Missed Collection',
          'Street Sweeping Complaint',
          'Litter Basket Complaint',
          'Overgrown Tree/Branches',
          'Wood Pile Remaining',
        ],
      },
      {
        // The drain and sewer system itself.
        title: 'Drainage & Sewer',
        types: ['Sewer', 'Root/Sewer/Sidewalk Condition', 'Standing Water', 'Industrial Waste'],
      },
      {
        // Street-surface conditions that pool or divert stormwater.
        title: 'Street Surface & Flooding',
        types: ['Street Condition', 'Curb Condition', 'DEP Street Condition', 'Obstruction'],
      },
    ],
  },
  {
    query: 'Find illegal dumping hotspots',
    chip: 'Illegal dumping',
    groups: [
      {
        title: 'Dumping Reports',
        types: ['Illegal Dumping', 'Dumpster Complaint', 'Transfer Station Complaint'],
      },
      {
        title: 'Commercial & Residential Disposal',
        types: [
          'Commercial Disposal Complaint',
          'Residential Disposal Complaint',
          'Institution Disposal Complaint',
        ],
      },
      {
        title: 'Resulting Street Conditions',
        types: ['Dirty Condition', 'Lot Condition', 'Wood Pile Remaining'],
      },
    ],
  },
  {
    query: 'List all rat sightings and the conditions that attract them',
    chip: 'Rodents',
    groups: [
      {
        title: 'Rodent Reports',
        types: ['Rodent', 'Dead Animal'],
      },
      {
        title: 'Attracting Conditions',
        types: [
          'UNSANITARY CONDITION',
          'Dirty Condition',
          'Missed Collection',
          'Illegal Dumping',
          'Lot Condition',
        ],
      },
      {
        title: 'Related Hygiene Complaints',
        types: [
          'Unsanitary Pigeon Condition',
          'Unsanitary Animal Pvt Property',
          'Unsanitary Animal Facility',
        ],
      },
    ],
  },
];

const normalize = (q: string) => q.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');

// Turn curated groups into the board shape, with everything else in "Excluded".
export function buildCategoriesFromGroups(groups: CuratedGroup[]): MainCategory[] {
  const used = new Set<string>();
  const main: MainCategory[] = [];

  for (const group of groups) {
    const subs = group.types
      .filter(name => SUB_BY_NAME.has(name) && !used.has(name))
      .map(name => {
        used.add(name);
        return SUB_BY_NAME.get(name)!;
      });
    if (subs.length === 0) continue;
    main.push({
      id: `cat-${main.length}`,
      title: `${LETTERS[main.length] ?? '·'} · ${group.title}`,
      color: 'bg-white border-gray-200',
      subCategories: subs,
    });
  }

  if (main.length === 0) return [];

  main.push({
    id: 'excluded',
    title: 'Excluded (Irrelevant)',
    color: 'bg-gray-100 border-gray-200',
    subCategories: ALL_TYPE_NAMES.filter(n => !used.has(n)).map(n => SUB_BY_NAME.get(n)!),
  });

  return main;
}

// Exact (normalized) match against a curated sample question, else null.
export function curatedCategoriesFor(query: string): MainCategory[] | null {
  const q = normalize(query);
  const hit = CURATED_QUERIES.find(c => normalize(c.query) === q);
  return hit ? buildCategoriesFromGroups(hit.groups) : null;
}

export const DEFAULT_QUERY = CURATED_QUERIES[0].query;
