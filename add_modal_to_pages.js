/**
 * 为所有HTML页面添加模态框功能
 * 使用Node.js的fs模块修改文件
 */
const fs = require('fs');
const path = require('path');

// 基础目录
const baseDir = 'docs/diagrams/html';

// 递归查找所有HTML文件
function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findHtmlFiles(filePath, fileList);
    } else if (path.extname(file) === '.html') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 计算相对路径
function getRelativePath(filePath) {
  // 计算从HTML文件到html目录的相对路径
  const dirName = path.dirname(filePath);
  const relativePath = path.relative(dirName, baseDir);
  
  // 确保路径以/结尾
  return relativePath ? relativePath.replace(/\\/g, '/') + '/' : '';
}

// 修改HTML文件，添加模态框功能
function addModalToHtml(filePath) {
  console.log(`Processing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 如果已经包含modal.css，跳过
  if (content.includes('modal.css')) {
    console.log(`File ${filePath} already has modal.css, skipping...`);
    return;
  }
  
  // 计算相对路径
  const relativePath = getRelativePath(filePath);
  
  // 添加CSS引用
  content = content.replace(
    /<link rel="stylesheet" href="([^"]*?)css\/style\.css">/,
    `<link rel="stylesheet" href="$1css/style.css">\n  <link rel="stylesheet" href="${relativePath}css/modal.css">`
  );
  
  // 添加JavaScript引用
  content = content.replace(
    /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/highlight\.js[^>]*><\/script>/,
    `<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/lib/highlight.min.js"></script>\n  <script src="${relativePath}js/diagram-modal.js" defer></script>`
  );
  
  // 写回文件
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Added modal functionality to ${filePath}`);
}

// 主函数
function main() {
  const htmlFiles = findHtmlFiles(baseDir);
  console.log(`Found ${htmlFiles.length} HTML files.`);
  
  htmlFiles.forEach(file => {
    addModalToHtml(file);
  });
  
  console.log('All HTML files updated with modal functionality!');
}

// 执行主函数
main();
