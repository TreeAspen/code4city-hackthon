// scripts/preprocess.js
import fs from 'fs';
import Papa from 'papaparse';

// 读取你的原始 CSV
const csvFilePath = './src/asset/311_Sanitation_FineTune_2025.csv';
const jsonOutputPath = './src/asset/311_data_preprocessed.json';

const csvData = fs.readFileSync(csvFilePath, 'utf8');

// 社区编号转换函数
function formatCommunityBoard(cb) {
  if (!cb || cb === 'Unspecified') return '';
  const match = cb.match(/^(\d{2})\s+(.+)$/i);
  if (!match) return cb;
  const boroMap = { 'MANHATTAN': 'MN', 'BRONX': 'BX', 'BROOKLYN': 'BK', 'QUEENS': 'QN', 'STATEN ISLAND': 'SI' };
  return `${boroMap[match[2].toUpperCase().trim()] || 'XX'}-${match[1]}`;
}

console.log('Parsing CSV...');
Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
    complete: (results) => {
    const mappedData = results.data.map(row => ({
      id: row['Unique Key'],
      createdDate: row['Created Date'] ? row['Created Date'].slice(0, 10) : '', 
      complaintType: row['Problem (formerly Complaint Type)'],
      communityBoard: formatCommunityBoard(row['Community Board']),
      latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
      longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
    }))
    .filter(d => d.latitude && d.longitude)
    .slice(0, 3000); // 🚨 加上这一句！只保留 5000 条，把 JSON 从 111MB 压到 1MB 以内！

    fs.writeFileSync(jsonOutputPath, JSON.stringify(mappedData));
    console.log(`✅ Success! Compressed data written to ${jsonOutputPath}`);
  }
});