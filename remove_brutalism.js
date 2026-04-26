const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'app', 'components');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace shadow-[...] with soft shadow or nothing
  content = content.replace(/shadow-\[.*?\]/g, 'shadow-sm');
  
  // Replace hover:shadow-[...]
  content = content.replace(/hover:shadow-\[.*?\]/g, 'hover:shadow-md');
  
  // Replace hover:translate-x-[...] hover:translate-y-[...]
  content = content.replace(/hover:translate-x-\[[^\]]+\]/g, '');
  content = content.replace(/hover:translate-y-\[[^\]]+\]/g, '');
  
  // Replace border-2 border-black with border border-gray-200
  content = content.replace(/border-2 border-black/g, 'border border-gray-200 rounded-md');
  // Or border-black if border-2 is elsewhere
  content = content.replace(/border border-black/g, 'border border-gray-200 rounded-md');
  
  // Fix rounded-none
  content = content.replace(/rounded-none/g, 'rounded-md');

  // Fix buttons or other elements having border-b-2 border-black
  content = content.replace(/border-b-2 border-black/g, 'border-b border-gray-200');
  content = content.replace(/border-r-2 border-black/g, 'border-r border-gray-200');

  // Remove uppercase tracking-tight from normal texts?
  // User says: "整体的UI设计需要完全符合纽约311平台的视觉风格，采用高对比度的亮黄色（#FFE300）、纯黑边框背景以及粗体大写字母排版。" -> Oh wait, the user's PREVIOUS request was "采用高对比度的亮黄色（#FFE300）、纯黑边框背景以及粗体大写字母排版" but CURRENT request is "设计风格和asset设计参考，保持配色但不要用生硬的阴影和粗线条" (Keep color scheme but don't use harsh shadows and thick lines). 
  // It says "保持配色" (keep colors). It doesn't explicitly revoke uppercase. Let's leave uppercase.

  // Specific GIS string replacements
  content = content.replace(/GIS Workspace/g, 'Community Analytics');
  content = content.replace(/GIS Admin/g, 'User Profile');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(dir);
