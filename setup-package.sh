#!/bin/bash

# 设置 Mermaid 文档生成器工具包

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 目标文件夹
TARGET_DIR=~/mermaid-docs-generator

echo -e "${YELLOW}开始设置 Mermaid 文档生成器工具包...${NC}"

# 检查目标文件夹是否存在
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}错误: 目标文件夹 $TARGET_DIR 不存在${NC}"
    exit 1
fi

# 进入目标文件夹
cd "$TARGET_DIR" || { echo -e "${RED}错误: 无法进入目标文件夹 $TARGET_DIR${NC}"; exit 1; }

# 安装依赖项
echo -e "${YELLOW}安装依赖项...${NC}"
npm install

# 检查安装是否成功
if [ $? -eq 0 ]; then
    echo -e "${GREEN}依赖项安装成功${NC}"
else
    echo -e "${RED}错误: 依赖项安装失败${NC}"
    exit 1
fi

# 添加 CLI 脚本执行权限
echo -e "${YELLOW}添加 CLI 脚本执行权限...${NC}"
chmod +x bin/cli.js

# 检查是否成功
if [ -x "bin/cli.js" ]; then
    echo -e "${GREEN}CLI 脚本执行权限添加成功${NC}"
else
    echo -e "${RED}错误: 无法添加 CLI 脚本执行权限${NC}"
    exit 1
fi

# 创建测试目录
echo -e "${YELLOW}创建测试目录...${NC}"
TEST_DIR="$TARGET_DIR/test-run"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR" || { echo -e "${RED}错误: 无法创建测试目录${NC}"; exit 1; }

# 运行初始化命令
echo -e "${YELLOW}运行初始化命令...${NC}"
node "$TARGET_DIR/bin/cli.js" init

# 检查初始化是否成功
if [ -f "mermaid-docs.config.js" ] && [ -d "docs" ]; then
    echo -e "${GREEN}初始化成功${NC}"
else
    echo -e "${RED}错误: 初始化失败${NC}"
    exit 1
fi

# 运行生成命令
echo -e "${YELLOW}运行生成命令...${NC}"
node "$TARGET_DIR/bin/cli.js" generate

# 检查生成是否成功
if [ -d "docs-html" ] && [ -f "docs-html/index.html" ]; then
    echo -e "${GREEN}文档生成成功${NC}"
else
    echo -e "${RED}错误: 文档生成失败${NC}"
    exit 1
fi

# 清理测试目录
echo -e "${YELLOW}清理测试目录...${NC}"
cd "$TARGET_DIR" || { echo -e "${RED}错误: 无法返回目标文件夹${NC}"; exit 1; }
rm -rf "$TEST_DIR"

# 全局链接（可选）
echo -e "${YELLOW}是否要全局链接工具包? (y/n)${NC}"
read -p "> " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}全局链接工具包...${NC}"
    npm link
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}全局链接成功${NC}"
        echo -e "${YELLOW}现在可以在任何位置使用 'mermaid-docs' 命令${NC}"
    else
        echo -e "${RED}错误: 全局链接失败${NC}"
    fi
fi

echo -e "${GREEN}设置完成! Mermaid 文档生成器工具包已准备就绪${NC}"
echo -e "${YELLOW}工具包位置: $TARGET_DIR${NC}"
echo -e "${YELLOW}使用方法:${NC}"
echo -e "${YELLOW}  cd $TARGET_DIR${NC}"
echo -e "${YELLOW}  node ./bin/cli.js init # 初始化项目${NC}"
echo -e "${YELLOW}  node ./bin/cli.js generate # 生成文档${NC}"
echo -e "${YELLOW}  node ./bin/cli.js serve # 启动本地服务器${NC}"

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}或者使用全局命令:${NC}"
    echo -e "${YELLOW}  mermaid-docs init # 初始化项目${NC}"
    echo -e "${YELLOW}  mermaid-docs generate # 生成文档${NC}"
    echo -e "${YELLOW}  mermaid-docs serve # 启动本地服务器${NC}"
fi

exit 0
