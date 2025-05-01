/**
 * Mermaid文档生成器
 * 将Markdown文档转换为带有交互式Mermaid图表的HTML静态网页
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { marked } = require('marked');
const chalk = require('chalk');

// 导入工具函数
const { 
  generateHtml, 
  generateIndexPage, 
  generateCategoryPage,
  copyAssets,
  extractTitle,
  createFileStructure
} = require('./utils');

/**
 * 生成文档
 * @param {Object} config 配置对象
 */
async function generateDocs(config) {
  try {
    console.log(chalk.blue('开始生成文档...'));
    
    // 创建输出目录
    const outputDir = path.resolve(process.cwd(), config.output);
    fs.ensureDirSync(outputDir);
    console.log(chalk.green(`创建输出目录: ${outputDir}`));
    
    // 复制资源文件
    await copyAssets(outputDir, config);
    console.log(chalk.green('复制资源文件完成'));
    
    // 创建文件结构
    const fileStructure = await createFileStructure(config);
    console.log(chalk.green('创建文件结构完成'));
    
    // 处理每个分类
    for (const category of config.categories) {
      console.log(chalk.blue(`处理分类: ${category.name}`));
      
      // 创建分类目录
      const categoryOutputDir = path.join(outputDir, category.id);
      fs.ensureDirSync(categoryOutputDir);
      
      // 获取该分类下的所有Markdown文件
      const inputDir = path.resolve(process.cwd(), config.input, category.path);
      const mdFiles = glob.sync('**/*.md', { cwd: inputDir });
      
      // 处理每个Markdown文件
      for (const mdFile of mdFiles) {
        const inputFile = path.join(inputDir, mdFile);
        const outputFile = path.join(categoryOutputDir, mdFile.replace('.md', '.html'));
        
        // 确保输出目录存在
        fs.ensureDirSync(path.dirname(outputFile));
        
        // 读取Markdown内容
        const markdown = fs.readFileSync(inputFile, 'utf-8');
        
        // 提取标题
        const title = extractTitle(markdown) || path.basename(mdFile, '.md');
        
        // 生成HTML
        const html = await generateHtml({
          title: `${title} - ${config.title}`,
          content: markdown,
          config,
          category,
          fileStructure,
          relativePath: path.relative(path.dirname(outputFile), outputDir)
        });
        
        // 写入HTML文件
        fs.writeFileSync(outputFile, html);
        console.log(chalk.green(`生成文件: ${outputFile}`));
        
        // 添加到文件结构
        fileStructure.files.push({
          title,
          path: path.relative(outputDir, outputFile),
          category: category.id
        });
      }
      
      // 生成分类页面
      const categoryHtml = await generateCategoryPage({
        title: `${category.name} - ${config.title}`,
        category,
        config,
        fileStructure,
        relativePath: path.relative(categoryOutputDir, outputDir)
      });
      
      fs.writeFileSync(path.join(outputDir, `${category.id}.html`), categoryHtml);
      console.log(chalk.green(`生成分类页面: ${path.join(outputDir, `${category.id}.html`)}`));
    }
    
    // 生成首页
    const indexHtml = await generateIndexPage({
      title: config.title,
      config,
      fileStructure,
      relativePath: ''
    });
    
    fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
    console.log(chalk.green(`生成首页: ${path.join(outputDir, 'index.html')}`));
    
    // 生成更新日志页面
    const changelogInputFile = path.resolve(process.cwd(), config.input, 'changelog.md');
    if (fs.existsSync(changelogInputFile)) {
      const changelogMarkdown = fs.readFileSync(changelogInputFile, 'utf-8');
      const changelogHtml = await generateHtml({
        title: `更新日志 - ${config.title}`,
        content: changelogMarkdown,
        config,
        category: null,
        fileStructure,
        relativePath: ''
      });
      
      fs.writeFileSync(path.join(outputDir, 'changelog.html'), changelogHtml);
      console.log(chalk.green(`生成更新日志: ${path.join(outputDir, 'changelog.html')}`));
    }
    
    console.log(chalk.green('文档生成完成!'));
  } catch (error) {
    console.error(chalk.red('生成文档时出错:'), error);
    throw error;
  }
}

module.exports = {
  generateDocs
};
