#!/usr/bin/env node

/**
 * 简单的测试脚本，用于验证 mermaid-docs-generator 是否正常工作
 */

const path = require('path');
const fs = require('fs-extra');
const { generateDocs } = require('../src/index');

// 测试配置
const testConfig = {
  input: path.join(__dirname, 'fixtures'),
  output: path.join(__dirname, 'output'),
  title: '测试文档',
  theme: 'light',
  interactive: true,
  saveImage: true,
  categories: [
    { id: 'test', name: '测试', path: 'test' }
  ]
};

// 创建测试目录和文件
async function setup() {
  console.log('设置测试环境...');
  
  // 创建测试目录
  const fixturesDir = path.join(__dirname, 'fixtures');
  const testDir = path.join(fixturesDir, 'test');
  
  fs.ensureDirSync(testDir);
  
  // 创建测试Markdown文件
  const testMarkdown = `# 测试文档

这是一个测试Markdown文档，用于验证 mermaid-docs-generator 是否正常工作。

## 流程图示例

\`\`\`mermaid
flowchart TD
    A[开始] --> B{判断条件}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E
\`\`\`

## 测试完成
`;
  
  fs.writeFileSync(path.join(testDir, 'test.md'), testMarkdown);
  
  console.log('测试环境设置完成');
}

// 清理测试目录
async function cleanup() {
  console.log('清理测试环境...');
  
  // 删除测试输出目录
  fs.removeSync(path.join(__dirname, 'output'));
  
  console.log('测试环境清理完成');
}

// 运行测试
async function runTest() {
  try {
    console.log('开始测试...');
    
    // 设置测试环境
    await setup();
    
    // 生成文档
    await generateDocs(testConfig);
    
    // 验证输出
    const outputDir = path.join(__dirname, 'output');
    const indexFile = path.join(outputDir, 'index.html');
    const testFile = path.join(outputDir, 'test', 'test.html');
    
    if (!fs.existsSync(indexFile)) {
      throw new Error('未生成首页');
    }
    
    if (!fs.existsSync(testFile)) {
      throw new Error('未生成测试页面');
    }
    
    console.log('测试通过!');
    
    // 清理测试环境
    await cleanup();
    
    process.exit(0);
  } catch (error) {
    console.error('测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
runTest();
