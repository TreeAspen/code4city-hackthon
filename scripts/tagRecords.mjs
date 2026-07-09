// Offline semantic enrichment (the "语义增强层 / LLM batch" from the pitch deck).
//
// Reads the 3000 pilot records in 311_data_preprocessed.json, re-joins them with
// the original CSV to recover descriptor / additional details / agency, then
// batch-tags every record with multi-facet tags from a controlled vocabulary
// using a FREE model. Output: src/asset/311_data_tagged.json — same 3000
// records (same ids, dates, coordinates), plus `descriptor`, `agency`, `tags`.
//
// Providers (no Claude / no paid API):
//   Ollama (default, fully local & free):
//     ollama pull llama3.1:8b
//     node scripts/tagRecords.mjs
//     (override model: OLLAMA_MODEL=qwen2.5:7b node scripts/tagRecords.mjs)
//   Gemini free tier (faster, ~8 min, needs free key from aistudio.google.com):
//     GEMINI_API_KEY=... node scripts/tagRecords.mjs
//
// Ollama runtime depends on hardware: ~150 batches × (5s GPU / 30-60s CPU).

import fs from 'node:fs';
import Papa from 'papaparse';

const CSV_PATH = './src/asset/311_Sanitation_FineTune_2025.csv';
const PILOT_PATH = './src/asset/311_data_preprocessed.json';
const OUT_PATH = './src/asset/311_data_tagged.json';

// ---------- Provider selection ----------

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PROVIDER = process.env.LLM_PROVIDER ?? (GEMINI_KEY ? 'gemini' : 'ollama');
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
// 3b default: this machine's RAM can't host the 8b model alongside a full app load
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';

// Gemini free tier is rate-limited (~15 RPM) → 1 worker + spacing.
// Ollama is local → small batches (short prompts/outputs) work best.
const BATCH_SIZE = Number(process.env.BATCH_SIZE ?? (PROVIDER === 'gemini' ? 40 : 20));
const CONCURRENCY = Number(process.env.CONCURRENCY ?? (PROVIDER === 'gemini' ? 1 : 2));
const GEMINI_GAP_MS = 4200;

if (PROVIDER === 'gemini' && !GEMINI_KEY) {
  console.error('LLM_PROVIDER=gemini but GEMINI_API_KEY is not set.');
  process.exit(1);
}
console.log(`Provider: ${PROVIDER} (${PROVIDER === 'gemini' ? GEMINI_MODEL : OLLAMA_MODEL}), batch=${BATCH_SIZE}, concurrency=${CONCURRENCY}`);

// Controlled multi-facet vocabulary. Cross-agency by design: one record can be
// e.g. Trash & Litter + Catch Basin + Standing Water (the catch-basin story).
const TAG_VOCABULARY = [
  'Trash & Litter',
  'Illegal Dumping',
  'Missed Collection',
  'Recycling',
  'Commercial Waste',
  'Litter Basket',
  'Street Sweeping',
  'Sewer Backup',
  'Sewage & Wastewater',
  'Industrial Waste',
  'Water Leak',
  'Flooding',
  'Standing Water',
  'Drainage',
  'Catch Basin',
  'Street Damage',
  'Sidewalk Damage',
  'Curb Damage',
  'Rodents',
  'Mosquitoes',
  'Dead Animal',
  'Unsanitary Condition',
  'Odor',
  'Tree Debris',
  'Overgrown Vegetation',
  'Abandoned Vehicle',
  'Obstruction',
  'Vacant Lot',
  'Water Quality',
];

// ---------- 1. Load pilot sample and re-join CSV details by Unique Key ----------

// FILL=1: re-tag only records that ended up with no tags in a previous run
// (e.g. batches lost to a server restart), merging into the existing output.
const FILL = process.env.FILL === '1';
const previous = FILL ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')) : null;
const pilotAll = JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
const pilot = FILL
  ? pilotAll.filter(r => {
      const prev = previous.find(p => String(p.id) === String(r.id));
      return !prev || prev.tags.length === 0;
    })
  : pilotAll;
if (FILL) console.log(`FILL mode: ${pilot.length} untagged records to retry.`);
const wantedIds = new Set(pilot.map(r => String(r.id)));
console.log(`Pilot sample: ${pilot.length} records. Joining CSV for descriptors...`);

const details = new Map(); // id -> { descriptor, extra, agency }
// Stream-parse: the CSV is 450MB and this machine is RAM-constrained —
// readFileSync + full-string parse OOMs while the Ollama model is loaded.
await new Promise((resolve, reject) => {
  Papa.parse(fs.createReadStream(CSV_PATH), {
    header: true,
    skipEmptyLines: true,
    step: (row) => {
      const id = String(row.data['Unique Key'] ?? '');
      if (!wantedIds.has(id) || details.has(id)) return;
      details.set(id, {
        descriptor: (row.data['Problem Detail (formerly Descriptor)'] ?? '').trim(),
        extra: (row.data['Additional Details'] ?? '').trim(),
        agency: (row.data['Agency'] ?? '').trim(),
      });
    },
    complete: resolve,
    error: reject,
  });
});
console.log(`Matched details for ${details.size}/${pilot.length} records.`);

// ---------- 2. Batch-tag with schema-constrained JSON output ----------

// Plain JSON schema (no additionalProperties — Gemini's responseSchema rejects it).
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    taggings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tags: { type: 'array', items: { type: 'string', enum: TAG_VOCABULARY } },
        },
        required: ['id', 'tags'],
      },
    },
  },
  required: ['taggings'],
};

const SYSTEM_PROMPT = `You tag NYC 311 service requests with semantic facet tags for a cross-agency analytics tool.

For each record you receive (id, complaint type, detail, notes), return 1-4 tags from the allowed vocabulary that describe every facet of the underlying problem — not just the filed category. Example: trash blocking a catch basin and causing pooling water is "Trash & Litter" + "Catch Basin" + "Standing Water" + "Drainage".

Rules:
- Tag the real-world condition described, using the detail/notes text when it adds information beyond the complaint type.
- Return a tagging for every input id, in any order.
- Prefer 2-3 tags when facets genuinely overlap; use 1 tag when the record is single-facet.
- Use only tags from the allowed vocabulary, spelled exactly as given.`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function callGemini(userText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });
  if (res.status === 429) {
    console.log('\nGemini rate limit hit — waiting 30s...');
    await sleep(30_000);
    throw new Error('429 rate limited');
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned no text');
  return text;
}

async function callOllama(userText) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: RESPONSE_SCHEMA, // grammar-constrained JSON output
      options: { temperature: 0, num_ctx: 4096, num_predict: 3000 },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.message?.content;
  if (!text) throw new Error('Ollama returned no content');
  return text;
}

async function tagBatch(records) {
  const lines = records.map(r => {
    const d = details.get(String(r.id)) ?? {};
    return JSON.stringify({
      id: String(r.id),
      type: r.complaintType,
      detail: d.descriptor || undefined,
      notes: d.extra ? d.extra.slice(0, 200) : undefined,
    });
  });
  const userText = `Allowed tags:\n${TAG_VOCABULARY.join(', ')}\n\nRecords:\n${lines.join('\n')}`;
  const text = PROVIDER === 'gemini' ? await callGemini(userText) : await callOllama(userText);
  return JSON.parse(text).taggings ?? [];
}

const batches = [];
for (let i = 0; i < pilot.length; i += BATCH_SIZE) batches.push(pilot.slice(i, i + BATCH_SIZE));
const totalBatches = batches.length;

const tagsById = new Map();
let done = 0;

async function worker() {
  while (batches.length > 0) {
    const batch = batches.shift();
    let taggings = null;
    for (let attempt = 0; attempt < 3 && !taggings; attempt++) {
      try {
        taggings = await tagBatch(batch);
      } catch (err) {
        if (attempt === 2) console.error(`\nBatch failed 3x, skipping ${batch.length} records: ${err.message}`);
        else await sleep(3000);
      }
    }
    for (const t of taggings ?? []) tagsById.set(String(t.id), t.tags ?? []);
    done += 1;
    process.stdout.write(`\rTagged batches: ${done}/${totalBatches}`);
    if (PROVIDER === 'gemini') await sleep(GEMINI_GAP_MS); // stay under free-tier RPM
  }
}

console.log(`Tagging ${pilot.length} records in ${totalBatches} batches...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log();

// ---------- 3. Write enriched output ----------

const freshById = new Map(pilot.map(r => [String(r.id), r]));
const base = FILL ? previous : pilot;
const enriched = base.map(r => {
  const fresh = freshById.get(String(r.id));
  if (FILL && !fresh) return r; // untouched record from the previous run
  const d = details.get(String(r.id)) ?? {};
  const rawTags = tagsById.get(String(r.id)) ?? [];
  return {
    ...r,
    descriptor: d.descriptor ?? r.descriptor ?? '',
    agency: d.agency ?? r.agency ?? '',
    // keep only vocabulary tags (belt & suspenders on top of schema enum)
    tags: rawTags.filter(t => TAG_VOCABULARY.includes(t)),
  };
});

const taggedCount = enriched.filter(r => r.tags.length > 0).length;
fs.writeFileSync(OUT_PATH, JSON.stringify(enriched));
console.log(`✅ Wrote ${OUT_PATH} — ${taggedCount}/${enriched.length} records tagged.`);

// Distribution summary for sanity checking
const dist = new Map();
for (const r of enriched) for (const t of r.tags) dist.set(t, (dist.get(t) ?? 0) + 1);
console.log('\nTag distribution:');
for (const [tag, n] of [...dist.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${tag}`);
}
