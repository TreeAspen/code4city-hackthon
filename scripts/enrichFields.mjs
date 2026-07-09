// Backfill `borough` and `status` onto the tagged dataset from the source CSV.
// Runs in-place on 311_data_tagged.json, matching by Unique Key — the sample
// and its LLM tags are untouched.
//
// Usage: node scripts/enrichFields.mjs

import fs from 'node:fs';
import Papa from 'papaparse';

const CSV_PATH = './src/asset/311_Sanitation_FineTune_2025.csv';
const TAGGED_PATH = './src/asset/311_data_tagged.json';

const records = JSON.parse(fs.readFileSync(TAGGED_PATH, 'utf8'));
const wanted = new Set(records.map(r => String(r.id)));
console.log(`Backfilling borough/status for ${records.length} records...`);

const extra = new Map();
await new Promise((resolve, reject) => {
  Papa.parse(fs.createReadStream(CSV_PATH), {
    header: true,
    skipEmptyLines: true,
    step: (result) => {
      const id = String(result.data['Unique Key'] ?? '');
      if (!wanted.has(id) || extra.has(id)) return;
      const borough = (result.data['Borough'] ?? '').trim();
      extra.set(id, {
        // Source is ALL CAPS ("STATEN ISLAND"); Title Case every word.
        borough: borough.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase()),
        status: (result.data['Status'] ?? '').trim(),
      });
    },
    complete: resolve,
    error: reject,
  });
});

const out = records.map(r => ({ ...r, ...(extra.get(String(r.id)) ?? { borough: '', status: '' }) }));
fs.writeFileSync(TAGGED_PATH, JSON.stringify(out));

const withBorough = out.filter(r => r.borough).length;
const statuses = new Map();
for (const r of out) statuses.set(r.status, (statuses.get(r.status) ?? 0) + 1);
console.log(`✅ borough filled: ${withBorough}/${out.length}`);
console.log('status distribution:', Object.fromEntries(statuses));
