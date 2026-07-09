// scripts/preprocess.js
// Stratified monthly sample from the raw 311 CSV: the N most recent months in
// the data, PER_MONTH random records each (reservoir sampling — constant
// memory, streams the 450MB file).
//
// Usage:  node scripts/preprocess.js
//         PER_MONTH=1500 MONTHS=3 node scripts/preprocess.js

import fs from 'fs';
import Papa from 'papaparse';

const csvFilePath = './src/asset/311_Sanitation_FineTune_2025.csv';
const jsonOutputPath = './src/asset/311_data_preprocessed.json';

const PER_MONTH = Number(process.env.PER_MONTH ?? 1200);
const MONTHS = Number(process.env.MONTHS ?? 3);

// 社区编号转换函数
function formatCommunityBoard(cb) {
  if (!cb || cb === 'Unspecified') return '';
  const match = cb.match(/^(\d{2})\s+(.+)$/i);
  if (!match) return cb;
  const boroMap = { 'MANHATTAN': 'MN', 'BRONX': 'BX', 'BROOKLYN': 'BK', 'QUEENS': 'QN', 'STATEN ISLAND': 'SI' };
  return `${boroMap[match[2].toUpperCase().trim()] || 'XX'}-${match[1]}`;
}

console.log(`Sampling ${PER_MONTH}/month over the ${MONTHS} most recent months...`);

const buckets = new Map(); // 'YYYY-MM' -> { seen, rows[] } (reservoir, k = PER_MONTH)

await new Promise((resolve, reject) => {
  Papa.parse(fs.createReadStream(csvFilePath), {
    header: true,
    skipEmptyLines: true,
    step: (result) => {
      const row = result.data;
      // Normalize 'Created Date' to ISO YYYY-MM-DD. The CSV uses unpadded
      // slash dates ("2025/1/15 ..."); tolerate ISO too.
      const raw = (row['Created Date'] ?? '').trim();
      let date = '';
      const slash = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
      if (slash) date = `${slash[1]}-${slash[2].padStart(2, '0')}-${slash[3].padStart(2, '0')}`;
      else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) date = raw.slice(0, 10);
      const type = row['Problem (formerly Complaint Type)'];
      const lat = parseFloat(row['Latitude']);
      const lon = parseFloat(row['Longitude']);
      if (!date || !type || !Number.isFinite(lat) || !Number.isFinite(lon)) return;

      const month = date.slice(0, 7);
      let b = buckets.get(month);
      if (!b) { b = { seen: 0, rows: [] }; buckets.set(month, b); }
      b.seen += 1;

      const rec = {
        id: row['Unique Key'],
        createdDate: date,
        complaintType: type,
        communityBoard: formatCommunityBoard(row['Community Board']),
        latitude: lat,
        longitude: lon,
      };
      if (b.rows.length < PER_MONTH) b.rows.push(rec);
      else {
        const j = Math.floor(Math.random() * b.seen);
        if (j < PER_MONTH) b.rows[j] = rec;
      }
    },
    complete: resolve,
    error: reject,
  });
});

const recentMonths = [...buckets.keys()].sort().slice(-MONTHS);
const sampled = recentMonths.flatMap(m => buckets.get(m).rows);

console.log('Month coverage in CSV:');
for (const m of [...buckets.keys()].sort()) {
  const mark = recentMonths.includes(m) ? '  ← sampled' : '';
  console.log(`  ${m}: ${buckets.get(m).seen} rows${mark}`);
}

fs.writeFileSync(jsonOutputPath, JSON.stringify(sampled));
console.log(`✅ Wrote ${sampled.length} records (${recentMonths.join(', ')}) to ${jsonOutputPath}`);
