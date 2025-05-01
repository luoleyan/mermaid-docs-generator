#!/bin/bash

# 定义HTML文件目录
HTML_DIR="docs/diagrams/html"

# 递归查找所有HTML文件
find "$HTML_DIR" -type f -name "*.html" | while read -r file; do
  echo "Processing $file..."
  
  # 检查文件是否已经包含modal.css
  if grep -q "modal.css" "$file"; then
    echo "File $file already has modal.css, skipping..."
    continue
  fi
  
  # 使用sed添加CSS和JavaScript引用
  # 1. 添加modal.css引用
  sed -i 's|<link rel="stylesheet" href="\(.*\)css/style.css">|<link rel="stylesheet" href="\1css/style.css">\n  <link rel="stylesheet" href="\1css/modal.css">|g' "$file"
  
  # 2. 添加diagram-modal.js引用
  sed -i 's|<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/lib/highlight.min.js"></script>|<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.8.0/lib/highlight.min.js"></script>\n  <script src="\1js/diagram-modal.js" defer></script>|g' "$file"
  
  echo "Added modal functionality to $file"
done

echo "All HTML files updated with modal functionality!"
