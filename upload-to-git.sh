#!/bin/bash

# 上传 Mermaid 文档生成器到新的 Git 仓库
# 使用方法: ./upload-to-git.sh <git-repo-url>

# 检查参数
if [ $# -eq 0 ]; then
    echo "请提供 Git 仓库 URL"
    echo "使用方法: ./upload-to-git.sh <git-repo-url>"
    exit 1
fi

REPO_URL=$1
PACKAGE_DIR="mermaid-docs-generator"

echo "准备上传 $PACKAGE_DIR 到 $REPO_URL"

# 进入工具包目录
cd $PACKAGE_DIR || { echo "无法进入 $PACKAGE_DIR 目录"; exit 1; }

# 检查是否已经是 Git 仓库
if [ -d ".git" ]; then
    echo "警告: 目录已经是 Git 仓库"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 1
    fi

    # 删除现有的 .git 目录
    rm -rf .git
    echo "已删除现有的 .git 目录"
fi

# 初始化 Git 仓库
echo "初始化 Git 仓库..."
git init

# 更新 package.json 中的仓库信息
echo "更新 package.json 中的仓库信息..."
REPO_NAME=$(basename $REPO_URL .git)
USERNAME=$(echo $REPO_URL | sed -n 's/.*github.com\/\([^\/]*\)\/.*/\1/p')

if [ -z "$USERNAME" ]; then
    USERNAME="luoleyan"
    echo "无法从 URL 提取用户名，使用默认值: $USERNAME"
fi

# 使用 sed 更新 package.json
sed -i "s|\"homepage\": \"https://github.com/luoleyan/mermaid-docs-generator#readme\"|\"homepage\": \"https://github.com/$USERNAME/$REPO_NAME#readme\"|g" package.json
sed -i "s|\"url\": \"git+https://github.com/luoleyan/mermaid-docs-generator.git\"|\"url\": \"git+$REPO_URL\"|g" package.json
sed -i "s|\"url\": \"https://github.com/luoleyan/mermaid-docs-generator/issues\"|\"url\": \"https://github.com/$USERNAME/$REPO_NAME/issues\"|g" package.json

# 添加所有文件
echo "添加文件到 Git..."
git add .

# 创建第一个提交
echo "创建第一个提交..."
git commit -m "Initial commit: Mermaid 文档生成器工具包"

# 添加远程仓库
echo "添加远程仓库..."
git remote add origin $REPO_URL

# 设置主分支名称
echo "设置主分支名称..."
git branch -M main

# 推送到远程仓库
echo "推送到远程仓库..."
git push -u origin main

echo "完成! Mermaid 文档生成器已上传到 $REPO_URL"
echo "您可以通过以下命令克隆仓库:"
echo "git clone $REPO_URL"

# 返回到原目录
cd ..

echo "是否创建示例文档并上传到 GitHub Pages? (y/n)"
read -p "> " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "创建示例文档..."

    # 进入工具包目录
    cd $PACKAGE_DIR || { echo "无法进入 $PACKAGE_DIR 目录"; exit 1; }

    # 创建 docs 目录
    mkdir -p docs

    # 创建示例项目
    mkdir -p example
    cd example

    # 初始化示例项目
    echo "初始化示例项目..."
    ../bin/cli.js init

    # 生成文档
    echo "生成文档..."
    ../bin/cli.js generate

    # 复制生成的文档到 docs 目录
    echo "复制文档到 docs 目录..."
    cp -r docs-html/* ../docs/

    # 返回到工具包目录
    cd ..

    # 添加 docs 目录到 Git
    echo "添加文档到 Git..."
    git add docs

    # 提交更改
    echo "提交更改..."
    git commit -m "添加示例文档"

    # 推送到远程仓库
    echo "推送到远程仓库..."
    git push

    echo "完成! 示例文档已上传"
    echo "请在 GitHub 仓库设置中启用 GitHub Pages，选择 main 分支和 /docs 文件夹"
    echo "几分钟后，您的示例网站将可在以下地址访问:"
    echo "https://$USERNAME.github.io/$REPO_NAME/"

    # 返回到原目录
    cd ..
fi

echo "操作完成!"
