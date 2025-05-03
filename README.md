# Mermaid文档生成器

将Markdown文档转换为带有交互式Mermaid图表的HTML静态网页。

[![NPM版本](https://img.shields.io/npm/v/mermaid-docs-generator.svg)](https://www.npmjs.com/package/mermaid-docs-generator)
[![许可证](https://img.shields.io/npm/l/mermaid-docs-generator.svg)](https://github.com/luoleyan/mermaid-docs-generator/blob/main/LICENSE)

**在线文档：** [https://luoleyan.github.io/mermaid-docs-generator/](https://luoleyan.github.io/mermaid-docs-generator/)

## 功能特点

1. 将Markdown文档转换为HTML静态网页
2. 自动将Mermaid代码块转换为交互式图表
3. 支持点击图表查看大图
4. 支持右键菜单保存图表为图片文件
5. 支持代码高亮显示
6. 响应式设计，适应不同屏幕尺寸
7. 分类展示不同类型的文档
8. 支持明暗两种主题

## 安装

### 全局安装

```bash
npm install -g mermaid-docs-generator
```

### 项目内安装

```bash
npm install --save-dev mermaid-docs-generator
```

## 快速开始

### 初始化项目

```bash
npx mermaid-docs init
```

这将创建基本的目录结构和配置文件。

### 生成文档

```bash
npx mermaid-docs generate
```

### 启动本地服务器预览文档

```bash
npx mermaid-docs serve
```

## 目录结构

初始化后，将创建以下目录结构：

```
项目根目录/
├── docs/                  # Markdown文档目录
│   ├── structure/         # 结构图文档
│   ├── er/                # 实体关系图文档
│   ├── flowcharts/        # 流程图文档
│   └── ui/                # UI设计图文档
│
└── mermaid-docs.config.js # 配置文件
```

生成的HTML文档将默认输出到`docs-html`目录。

## 配置选项

在`mermaid-docs.config.js`中可以配置以下选项：

```javascript
module.exports = {
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
```

## 命令行选项

### 初始化

```bash
npx mermaid-docs init [options]
```

选项：
- `-d, --dir <dir>`: 项目目录，默认为当前目录

### 生成文档

```bash
npx mermaid-docs generate [options]
```

选项：
- `-c, --config <path>`: 配置文件路径，默认为`mermaid-docs.config.js`
- `-i, --input <dir>`: 输入目录，默认为`docs`
- `-o, --output <dir>`: 输出目录，默认为`docs-html`
- `-t, --title <title>`: 文档标题，默认为`项目文档`
- `--theme <theme>`: 主题 (light, dark)，默认为`light`
- `--no-interactive`: 禁用图表交互功能
- `--no-save-image`: 禁用保存图片功能

### 启动服务器

```bash
npx mermaid-docs serve [options]
```

选项：
- `-p, --port <port>`: 端口号，默认为`8080`
- `-d, --dir <dir>`: 文档目录，默认为`docs-html`

## 图表交互功能

### 查看大图

1. 点击任何Mermaid图表可以在模态框中查看大图
2. 大图模式下可以使用右下角的控制按钮进行放大、缩小和重置操作
3. 点击关闭按钮、点击模态框外部区域或按ESC键可以关闭大图
4. 优化的响应式设计，确保在各种屏幕尺寸下都能正确显示图表

### 图表缩放功能

1. 使用右下角的缩放控制按钮可以放大、缩小或重置图表大小
2. 缩放时图表会自动居中，提供更好的查看体验
3. 缩放范围从50%到300%，满足不同查看需求

### 保存图表为图片

1. 在大图模式下，点击右下角的"保存图片"按钮可以将图表保存为高质量PNG图片
2. 在大图模式下，右键点击图表，在弹出的菜单中选择"保存图片"也可以保存图表
3. 保存的图片文件名会根据图表标题自动生成
4. 如果PNG导出失败，系统会自动尝试保存为SVG格式
5. 导出过程中会显示加载指示器，提升用户体验

## 自定义模板

您可以通过在配置文件中指定自定义模板来更改文档的外观：

```javascript
templates: {
  // 自定义页面模板
  page: 'templates/custom-page.html',
  // 自定义首页模板
  index: 'templates/custom-index.html',
  // 自定义分类页面模板
  category: 'templates/custom-category.html',
  // 自定义样式
  styles: ['templates/custom-style.css']
}
```

模板中可以使用以下变量：
- `{{title}}`: 页面标题
- `{{projectTitle}}`: 项目标题
- `{{content}}`: 页面内容
- `{{navLinks}}`: 导航链接
- `{{sidebarLinks}}`: 侧边栏链接
- `{{categoryCards}}`: 分类卡片（仅在首页模板中）
- `{{fileCards}}`: 文件卡片（仅在分类页面模板中）
- `{{cssLinks}}`: CSS链接
- `{{jsLinks}}`: JavaScript链接
- `{{theme}}`: 主题名称

## 技术栈

- Node.js
- [Marked.js](https://marked.js.org/) - Markdown解析器
- [Mermaid.js](https://mermaid.js.org/) - 图表生成库
- [Highlight.js](https://highlightjs.org/) - 代码高亮库
- [html2canvas](https://html2canvas.hertzen.com/) - HTML转图片库

## 注意事项

1. Mermaid图表的渲染依赖于Mermaid.js库，确保您的网络环境可以访问CDN
2. 保存图片功能依赖html2canvas库，该库会在需要时自动加载
3. 如果html2canvas库加载失败，系统会尝试直接保存SVG格式的图表

## 许可证

MIT
