#!/bin/bash

# 验证 Mermaid 文档生成器工具包是否可以独立运行

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 目标文件夹
TARGET_DIR=~/mermaid-docs-generator

echo -e "${YELLOW}开始验证 Mermaid 文档生成器工具包...${NC}"

# 检查目标文件夹是否存在
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}错误: 目标文件夹 $TARGET_DIR 不存在${NC}"
    exit 1
fi

# 进入目标文件夹
cd "$TARGET_DIR" || { echo -e "${RED}错误: 无法进入目标文件夹 $TARGET_DIR${NC}"; exit 1; }

echo -e "${YELLOW}检查必要文件...${NC}"

# 检查必要文件
REQUIRED_FILES=(
    "package.json"
    "bin/cli.js"
    "src/index.js"
    "src/utils.js"
    "templates/page.html"
    "templates/index.html"
    "templates/category.html"
    "assets/css/style.css"
    "assets/css/modal.css"
    "assets/js/diagram-modal.js"
    "README.md"
    "LICENSE"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}缺少文件: $file${NC}"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo -e "${RED}错误: 缺少 $MISSING_FILES 个必要文件${NC}"
    exit 1
else
    echo -e "${GREEN}所有必要文件都存在${NC}"
fi

# 检查 package.json
echo -e "${YELLOW}检查 package.json...${NC}"
if grep -q "mermaid-docs-generator" package.json; then
    echo -e "${GREEN}package.json 包含正确的包名${NC}"
else
    echo -e "${RED}错误: package.json 不包含正确的包名${NC}"
    exit 1
fi

# 检查 CLI 脚本是否有执行权限
echo -e "${YELLOW}检查 CLI 脚本权限...${NC}"
if [ -x "bin/cli.js" ]; then
    echo -e "${GREEN}CLI 脚本有执行权限${NC}"
else
    echo -e "${YELLOW}警告: CLI 脚本没有执行权限，正在添加...${NC}"
    chmod +x bin/cli.js
    if [ -x "bin/cli.js" ]; then
        echo -e "${GREEN}已成功添加 CLI 脚本执行权限${NC}"
    else
        echo -e "${RED}错误: 无法添加 CLI 脚本执行权限${NC}"
        exit 1
    fi
fi

# 创建测试目录
echo -e "${YELLOW}创建测试目录...${NC}"
TEST_DIR="$TARGET_DIR/test-run"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR" || { echo -e "${RED}错误: 无法创建测试目录${NC}"; exit 1; }

# 运行初始化命令
echo -e "${YELLOW}运行初始化命令...${NC}"
"$TARGET_DIR/bin/cli.js" init

# 检查初始化是否成功
if [ -f "mermaid-docs.config.js" ] && [ -d "docs" ]; then
    echo -e "${GREEN}初始化成功${NC}"
else
    echo -e "${RED}错误: 初始化失败${NC}"
    exit 1
fi

# 运行生成命令
echo -e "${YELLOW}运行生成命令...${NC}"
"$TARGET_DIR/bin/cli.js" generate

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

echo -e "${GREEN}验证完成! Mermaid 文档生成器工具包可以独立运行${NC}"
echo -e "${YELLOW}工具包位置: $TARGET_DIR${NC}"
echo -e "${YELLOW}使用方法:${NC}"
echo -e "${YELLOW}  cd $TARGET_DIR${NC}"
echo -e "${YELLOW}  npm link # 全局链接（可选）${NC}"
echo -e "${YELLOW}  npx ./bin/cli.js init # 初始化项目${NC}"
echo -e "${YELLOW}  npx ./bin/cli.js generate # 生成文档${NC}"
echo -e "${YELLOW}  npx ./bin/cli.js serve # 启动本地服务器${NC}"

exit 0
