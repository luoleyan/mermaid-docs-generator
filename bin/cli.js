#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { generateDocs } = require('../src/index');
const { version } = require('../package.json');

// 设置CLI程序
program
  .name('mermaid-docs')
  .description('将Markdown文档转换为带有交互式Mermaid图表的HTML静态网页')
  .version(version);

// 添加命令
program
  .command('generate')
  .description('生成HTML文档')
  .option('-c, --config <path>', '配置文件路径', 'mermaid-docs.config.js')
  .option('-i, --input <dir>', '输入目录', 'docs')
  .option('-o, --output <dir>', '输出目录', 'docs-html')
  .option('-t, --title <title>', '文档标题', '项目文档')
  .option('--theme <theme>', '主题 (light, dark)', 'light')
  .option('--no-interactive', '禁用图表交互功能')
  .option('--no-save-image', '禁用保存图片功能')
  .action(async (options) => {
    try {
      console.log(chalk.blue('开始生成文档...'));
      
      // 检查配置文件
      let config = {};
      const configPath = path.resolve(process.cwd(), options.config);
      
      if (fs.existsSync(configPath)) {
        console.log(chalk.green(`使用配置文件: ${options.config}`));
        config = require(configPath);
      } else {
        console.log(chalk.yellow(`未找到配置文件: ${options.config}，使用命令行参数`));
      }
      
      // 合并配置
      const finalConfig = {
        input: options.input || config.input || 'docs',
        output: options.output || config.output || 'docs-html',
        title: options.title || config.title || '项目文档',
        theme: options.theme || config.theme || 'light',
        interactive: options.interactive !== false && config.interactive !== false,
        saveImage: options.saveImage !== false && config.saveImage !== false,
        categories: config.categories || [
          { id: 'structure', name: '结构图', path: 'structure' },
          { id: 'er', name: '实体关系图', path: 'er' },
          { id: 'flowcharts', name: '流程图', path: 'flowcharts' },
          { id: 'ui', name: 'UI设计图', path: 'ui' }
        ],
        templates: config.templates || {}
      };
      
      // 生成文档
      await generateDocs(finalConfig);
      
      console.log(chalk.green('文档生成成功!'));
      console.log(chalk.blue(`输出目录: ${path.resolve(process.cwd(), finalConfig.output)}`));
      console.log(chalk.blue(`启动方式: 打开 ${path.resolve(process.cwd(), finalConfig.output, 'index.html')}`));
    } catch (error) {
      console.error(chalk.red('生成文档时出错:'), error);
      process.exit(1);
    }
  });

// 添加初始化命令
program
  .command('init')
  .description('初始化配置文件和目录结构')
  .option('-d, --dir <dir>', '项目目录', '.')
  .action(async (options) => {
    try {
      const targetDir = path.resolve(process.cwd(), options.dir);
      console.log(chalk.blue(`初始化项目在: ${targetDir}`));
      
      // 创建配置文件
      const configPath = path.join(targetDir, 'mermaid-docs.config.js');
      if (!fs.existsSync(configPath)) {
        const configTemplate = `module.exports = {
  // 输入目录，包含Markdown文档
  input: 'docs',
  
  // 输出目录，生成的HTML文件
  output: 'docs-html',
  
  // 文档标题
  title: '项目文档',
  
  // 主题 (light, dark)
  theme: 'light',
  
  // 是否启用图表交互功能
  interactive: true,
  
  // 是否启用保存图片功能
  saveImage: true,
  
  // 文档分类
  categories: [
    { id: 'structure', name: '结构图', path: 'structure' },
    { id: 'er', name: '实体关系图', path: 'er' },
    { id: 'flowcharts', name: '流程图', path: 'flowcharts' },
    { id: 'ui', name: 'UI设计图', path: 'ui' }
  ],
  
  // 自定义模板（可选）
  templates: {
    // 自定义页面模板
    // page: 'path/to/custom-template.html',
    // 自定义样式
    // styles: ['path/to/custom-style.css']
  }
};
`;
        fs.writeFileSync(configPath, configTemplate);
        console.log(chalk.green(`创建配置文件: ${configPath}`));
      } else {
        console.log(chalk.yellow(`配置文件已存在: ${configPath}`));
      }
      
      // 创建目录结构
      const docsDir = path.join(targetDir, 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir);
        console.log(chalk.green(`创建文档目录: ${docsDir}`));
        
        // 创建分类目录
        ['structure', 'er', 'flowcharts', 'ui'].forEach(category => {
          const categoryDir = path.join(docsDir, category);
          fs.mkdirSync(categoryDir);
          console.log(chalk.green(`创建分类目录: ${categoryDir}`));
        });
        
        // 创建示例文档
        const exampleDoc = `# 示例文档

这是一个示例Markdown文档，展示了Mermaid图表的使用。

## 流程图示例

\`\`\`mermaid
flowchart TD
    A[开始] --> B{判断条件}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E
\`\`\`

## 类图示例

\`\`\`mermaid
classDiagram
    class Animal {
        +name: string
        +age: int
        +makeSound(): void
    }
    class Dog {
        +breed: string
        +bark(): void
    }
    Animal <|-- Dog
\`\`\`

## 时序图示例

\`\`\`mermaid
sequenceDiagram
    participant 用户
    participant 系统
    用户->>系统: 发送请求
    系统->>系统: 处理请求
    系统-->>用户: 返回响应
\`\`\`
`;
        fs.writeFileSync(path.join(docsDir, 'structure', 'example.md'), exampleDoc);
        console.log(chalk.green(`创建示例文档: ${path.join(docsDir, 'structure', 'example.md')}`));
      } else {
        console.log(chalk.yellow(`文档目录已存在: ${docsDir}`));
      }
      
      console.log(chalk.green('初始化完成!'));
      console.log(chalk.blue('使用以下命令生成文档:'));
      console.log(chalk.blue('  npx mermaid-docs generate'));
    } catch (error) {
      console.error(chalk.red('初始化项目时出错:'), error);
      process.exit(1);
    }
  });

// 添加服务器命令
program
  .command('serve')
  .description('启动本地服务器预览文档')
  .option('-p, --port <port>', '端口号', '8080')
  .option('-d, --dir <dir>', '文档目录', 'docs-html')
  .action(async (options) => {
    try {
      const http = require('http');
      const fs = require('fs');
      const path = require('path');
      const url = require('url');
      
      const port = parseInt(options.port);
      const docDir = path.resolve(process.cwd(), options.dir);
      
      if (!fs.existsSync(docDir)) {
        console.error(chalk.red(`文档目录不存在: ${docDir}`));
        console.log(chalk.yellow('请先生成文档: npx mermaid-docs generate'));
        process.exit(1);
      }
      
      // 支持的MIME类型
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      // 创建HTTP服务器
      const server = http.createServer((req, res) => {
        // 解析请求的URL
        const parsedUrl = url.parse(req.url);
        let pathname = parsedUrl.pathname;
        
        // 默认提供index.html
        if (pathname === '/') {
          pathname = '/index.html';
        }
        
        // 获取文件的完整路径
        const filePath = path.join(docDir, pathname);
        
        // 获取文件扩展名
        const extname = path.extname(filePath);
        
        // 默认的内容类型
        let contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // 读取文件
        fs.readFile(filePath, (err, content) => {
          if (err) {
            if (err.code === 'ENOENT') {
              // 文件不存在
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end('<h1>404 Not Found</h1><p>The requested file was not found.</p>');
            } else {
              // 服务器错误
              res.writeHead(500);
              res.end(`Server Error: ${err.code}`);
            }
          } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
          }
        });
      });
      
      // 启动服务器
      server.listen(port, () => {
        console.log(chalk.green(`服务器运行在 http://localhost:${port}/`));
        console.log(chalk.blue('按Ctrl+C停止服务器'));
      });
    } catch (error) {
      console.error(chalk.red('启动服务器时出错:'), error);
      process.exit(1);
    }
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
