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

// ... 前面部分保持不变 ...
console.log('Parsing CSV...');
Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const mappedData = results.data
      .map(row => ({
        id: row['Unique Key'],
        createdDate: row['Created Date'] ? row['Created Date'].slice(0, 10) : '', 
        complaintType: row['Problem (formerly Complaint Type)'],
        communityBoard: formatCommunityBoard(row['Community Board']),
        latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
        longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
      }))
      .filter(d => d.latitude && d.longitude && d.complaintType) // 过滤掉无效数据
      .slice(0, 3000); // 🚨 这里的 3000 条足以支撑展示，且文件体积极小

    fs.writeFileSync(jsonOutputPath, JSON.stringify(mappedData));
    console.log(`✅ 预处理完成！文件已压缩至: ${jsonOutputPath}`);
  }
});