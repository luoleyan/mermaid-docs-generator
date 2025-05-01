/**
 * 工具函数
 */

const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

/**
 * 提取Markdown文件的标题
 * @param {string} markdown Markdown内容
 * @returns {string|null} 提取的标题
 */
function extractTitle(markdown) {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : null;
}

/**
 * 创建文件结构对象
 * @param {Object} config 配置对象
 * @returns {Object} 文件结构对象
 */
async function createFileStructure(config) {
  return {
    categories: config.categories,
    files: []
  };
}

/**
 * 复制资源文件
 * @param {string} outputDir 输出目录
 * @param {Object} config 配置对象
 */
async function copyAssets(outputDir, config) {
  // 创建CSS目录
  const cssDir = path.join(outputDir, 'css');
  fs.ensureDirSync(cssDir);
  
  // 创建JS目录
  const jsDir = path.join(outputDir, 'js');
  fs.ensureDirSync(jsDir);
  
  // 复制基础样式
  fs.copyFileSync(
    path.join(__dirname, '../assets/css/style.css'),
    path.join(cssDir, 'style.css')
  );
  
  // 复制模态框样式
  if (config.interactive) {
    fs.copyFileSync(
      path.join(__dirname, '../assets/css/modal.css'),
      path.join(cssDir, 'modal.css')
    );
  }
  
  // 复制图表交互脚本
  if (config.interactive) {
    fs.copyFileSync(
      path.join(__dirname, '../assets/js/diagram-modal.js'),
      path.join(jsDir, 'diagram-modal.js')
    );
  }
  
  // 复制自定义样式（如果有）
  if (config.templates && config.templates.styles) {
    for (const style of config.templates.styles) {
      const stylePath = path.resolve(process.cwd(), style);
      if (fs.existsSync(stylePath)) {
        fs.copyFileSync(
          stylePath,
          path.join(cssDir, path.basename(style))
        );
      }
    }
  }
}

/**
 * 生成HTML页面
 * @param {Object} options 选项
 * @returns {string} 生成的HTML
 */
async function generateHtml(options) {
  const { title, content, config, category, fileStructure, relativePath } = options;
  
  // 获取模板
  let template = '';
  if (config.templates && config.templates.page) {
    const templatePath = path.resolve(process.cwd(), config.templates.page);
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    }
  }
  
  // 如果没有自定义模板，使用默认模板
  if (!template) {
    template = fs.readFileSync(path.join(__dirname, '../templates/page.html'), 'utf-8');
  }
  
  // 转换Markdown为HTML
  const contentHtml = marked(content);
  
  // 替换模板变量
  let html = template
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{content\}\}/g, contentHtml)
    .replace(/\{\{projectTitle\}\}/g, config.title);
  
  // 添加导航链接
  let navLinks = '';
  for (const cat of config.categories) {
    navLinks += `<li><a href="${relativePath ? relativePath + '/' : ''}${cat.id}.html">${cat.name}</a></li>\n`;
  }
  html = html.replace(/\{\{navLinks\}\}/g, navLinks);
  
  // 添加侧边栏链接（如果在分类页面）
  if (category) {
    let sidebarLinks = '';
    const categoryFiles = fileStructure.files.filter(file => file.category === category.id);
    for (const file of categoryFiles) {
      sidebarLinks += `<li><a href="${relativePath ? relativePath + '/' : ''}${file.path}">${file.title}</a></li>\n`;
    }
    html = html.replace(/\{\{sidebarLinks\}\}/g, sidebarLinks);
  } else {
    html = html.replace(/\{\{sidebarLinks\}\}/g, '');
  }
  
  // 添加CSS和JavaScript引用
  let cssLinks = `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/style.css">\n`;
  if (config.interactive) {
    cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/modal.css">\n`;
  }
  
  // 添加自定义样式
  if (config.templates && config.templates.styles) {
    for (const style of config.templates.styles) {
      cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/${path.basename(style)}">\n`;
    }
  }
  
  html = html.replace(/\{\{cssLinks\}\}/g, cssLinks);
  
  // 添加JavaScript引用
  let jsLinks = '';
  jsLinks += `<script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"></script>\n`;
  jsLinks += `<script src="https://cdn.jsdelivr.net/npm/marked@5.1.0/marked.min.js"></script>\n`;
  jsLinks += `<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/lib/highlight.min.js"></script>\n`;
  
  if (config.interactive) {
    jsLinks += `<script src="${relativePath ? relativePath + '/' : ''}js/diagram-modal.js" defer></script>\n`;
  }
  
  html = html.replace(/\{\{jsLinks\}\}/g, jsLinks);
  
  // 添加主题
  html = html.replace(/\{\{theme\}\}/g, config.theme);
  
  return html;
}

/**
 * 生成首页
 * @param {Object} options 选项
 * @returns {string} 生成的HTML
 */
async function generateIndexPage(options) {
  const { title, config, fileStructure, relativePath } = options;
  
  // 获取模板
  let template = '';
  if (config.templates && config.templates.index) {
    const templatePath = path.resolve(process.cwd(), config.templates.index);
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    }
  }
  
  // 如果没有自定义模板，使用默认模板
  if (!template) {
    template = fs.readFileSync(path.join(__dirname, '../templates/index.html'), 'utf-8');
  }
  
  // 替换模板变量
  let html = template
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{projectTitle\}\}/g, config.title);
  
  // 添加导航链接
  let navLinks = '';
  for (const cat of config.categories) {
    navLinks += `<li><a href="${relativePath ? relativePath + '/' : ''}${cat.id}.html">${cat.name}</a></li>\n`;
  }
  html = html.replace(/\{\{navLinks\}\}/g, navLinks);
  
  // 添加分类卡片
  let categoryCards = '';
  for (const cat of config.categories) {
    const categoryFiles = fileStructure.files.filter(file => file.category === cat.id);
    let fileList = '';
    for (const file of categoryFiles) {
      fileList += `<li>${file.title}</li>\n`;
    }
    
    categoryCards += `
      <div class="card">
        <h3 class="card-title">${cat.name}</h3>
        <div class="card-content">
          <ul>
            ${fileList}
          </ul>
        </div>
        <div class="card-footer">
          <a href="${relativePath ? relativePath + '/' : ''}${cat.id}.html" class="btn">查看详情</a>
        </div>
      </div>
    `;
  }
  html = html.replace(/\{\{categoryCards\}\}/g, categoryCards);
  
  // 添加CSS和JavaScript引用
  let cssLinks = `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/style.css">\n`;
  if (config.interactive) {
    cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/modal.css">\n`;
  }
  
  // 添加自定义样式
  if (config.templates && config.templates.styles) {
    for (const style of config.templates.styles) {
      cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/${path.basename(style)}">\n`;
    }
  }
  
  html = html.replace(/\{\{cssLinks\}\}/g, cssLinks);
  
  // 添加JavaScript引用
  let jsLinks = '';
  if (config.interactive) {
    jsLinks += `<script src="${relativePath ? relativePath + '/' : ''}js/diagram-modal.js" defer></script>\n`;
  }
  
  html = html.replace(/\{\{jsLinks\}\}/g, jsLinks);
  
  // 添加主题
  html = html.replace(/\{\{theme\}\}/g, config.theme);
  
  return html;
}

/**
 * 生成分类页面
 * @param {Object} options 选项
 * @returns {string} 生成的HTML
 */
async function generateCategoryPage(options) {
  const { title, category, config, fileStructure, relativePath } = options;
  
  // 获取模板
  let template = '';
  if (config.templates && config.templates.category) {
    const templatePath = path.resolve(process.cwd(), config.templates.category);
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    }
  }
  
  // 如果没有自定义模板，使用默认模板
  if (!template) {
    template = fs.readFileSync(path.join(__dirname, '../templates/category.html'), 'utf-8');
  }
  
  // 替换模板变量
  let html = template
    .replace(/\{\{title\}\}/g, title)
    .replace(/\{\{categoryName\}\}/g, category.name)
    .replace(/\{\{projectTitle\}\}/g, config.title);
  
  // 添加导航链接
  let navLinks = '';
  for (const cat of config.categories) {
    navLinks += `<li><a href="${relativePath ? relativePath + '/' : ''}${cat.id}.html">${cat.name}</a></li>\n`;
  }
  html = html.replace(/\{\{navLinks\}\}/g, navLinks);
  
  // 添加侧边栏链接
  let sidebarLinks = '';
  const categoryFiles = fileStructure.files.filter(file => file.category === category.id);
  for (const file of categoryFiles) {
    sidebarLinks += `<li><a href="${relativePath ? relativePath + '/' : ''}${file.path}">${file.title}</a></li>\n`;
  }
  html = html.replace(/\{\{sidebarLinks\}\}/g, sidebarLinks);
  
  // 添加文件卡片
  let fileCards = '';
  for (const file of categoryFiles) {
    fileCards += `
      <div class="card">
        <h3 class="card-title">${file.title}</h3>
        <div class="card-footer">
          <a href="${relativePath ? relativePath + '/' : ''}${file.path}" class="btn">查看详情</a>
        </div>
      </div>
    `;
  }
  html = html.replace(/\{\{fileCards\}\}/g, fileCards);
  
  // 添加CSS和JavaScript引用
  let cssLinks = `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/style.css">\n`;
  if (config.interactive) {
    cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/modal.css">\n`;
  }
  
  // 添加自定义样式
  if (config.templates && config.templates.styles) {
    for (const style of config.templates.styles) {
      cssLinks += `<link rel="stylesheet" href="${relativePath ? relativePath + '/' : ''}css/${path.basename(style)}">\n`;
    }
  }
  
  html = html.replace(/\{\{cssLinks\}\}/g, cssLinks);
  
  // 添加JavaScript引用
  let jsLinks = '';
  if (config.interactive) {
    jsLinks += `<script src="${relativePath ? relativePath + '/' : ''}js/diagram-modal.js" defer></script>\n`;
  }
  
  html = html.replace(/\{\{jsLinks\}\}/g, jsLinks);
  
  // 添加主题
  html = html.replace(/\{\{theme\}\}/g, config.theme);
  
  return html;
}

module.exports = {
  extractTitle,
  createFileStructure,
  copyAssets,
  generateHtml,
  generateIndexPage,
  generateCategoryPage
};
