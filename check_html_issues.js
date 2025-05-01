const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 获取所有HTML文件
async function getAllHtmlFiles(dir) {
  const files = await promisify(fs.readdir)(dir, { withFileTypes: true });
  
  const htmlFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const subDirFiles = await getAllHtmlFiles(fullPath);
      htmlFiles.push(...subDirFiles);
    } else if (file.name.endsWith('.html')) {
      htmlFiles.push(fullPath);
    }
  }
  
  return htmlFiles;
}

// 检查并修复HTML文件中的问题
async function checkAndFixHtmlFile(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    let originalContent = content;
    let fixed = false;
    
    // 检查是否有未闭合的script标签
    const scriptTagMatches = content.match(/<script[^>]*>/g) || [];
    const closingScriptTagMatches = content.match(/<\/script>/g) || [];
    
    if (scriptTagMatches.length > closingScriptTagMatches.length) {
      console.log(`[${filePath}] 发现未闭合的script标签`);
      
      // 查找未闭合的script标签
      const scriptRegex = /<script[^>]*>(?:(?!<\/script>).)*?(?=<\/head>|<body>)/gs;
      content = content.replace(scriptRegex, (match) => {
        if (!match.includes('</script>')) {
          return match + '\n  </script>';
        }
        return match;
      });
      
      fixed = true;
    }
    
    // 检查Mermaid图表中的pre和code标签
    if (content.includes('mermaid') && (content.includes('<pre><code>') || content.includes('</code></pre>'))) {
      console.log(`[${filePath}] 发现Mermaid图表中的pre和code标签`);
      
      // 修复Mermaid图表中的pre和code标签
      const mermaidRegex = /<div class="mermaid">([\s\S]*?)<\/div>/g;
      content = content.replace(mermaidRegex, (match, mermaidContent) => {
        // 移除pre和code标签
        let fixedMermaidContent = mermaidContent
          .replace(/<pre><code>/g, '')
          .replace(/<\/code><\/pre>/g, '')
          .replace(/<\/code><\/pre/g, '')
          .replace(/<pre><code/g, '')
          .replace(/<\/code></g, '<')
          .replace(/><code>/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        
        return `<div class="mermaid">${fixedMermaidContent}</div>`;
      });
      
      fixed = true;
    }
    
    // 检查是否有未闭合的标签
    const commonTags = ['div', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'];
    for (const tag of commonTags) {
      const openTagMatches = content.match(new RegExp(`<${tag}[^>]*>`, 'g')) || [];
      const closeTagMatches = content.match(new RegExp(`</${tag}>`, 'g')) || [];
      
      if (openTagMatches.length > closeTagMatches.length) {
        console.log(`[${filePath}] 发现未闭合的${tag}标签`);
      }
    }
    
    // 如果有修复，写入文件
    if (fixed) {
      await writeFileAsync(filePath, content, 'utf8');
      console.log(`[${filePath}] 已修复问题`);
      return true;
    } else {
      console.log(`[${filePath}] 未发现问题`);
      return false;
    }
  } catch (error) {
    console.error(`[${filePath}] 检查失败:`, error);
    return false;
  }
}

// 主函数
async function main() {
  try {
    const htmlDir = 'html';
    const htmlFiles = await getAllHtmlFiles(htmlDir);
    
    console.log(`找到 ${htmlFiles.length} 个HTML文件`);
    
    let fixedCount = 0;
    
    for (const file of htmlFiles) {
      const fixed = await checkAndFixHtmlFile(file);
      if (fixed) {
        fixedCount++;
      }
    }
    
    console.log(`检查完成，修复了 ${fixedCount} 个文件`);
  } catch (error) {
    console.error('执行失败:', error);
  }
}

main();
