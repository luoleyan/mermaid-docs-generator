#!/bin/bash

# 定义结构图页面目录
STRUCTURE_DIR="docs/diagrams/html/structure"

# 遍历结构图目录中的所有HTML文件
for file in "$STRUCTURE_DIR"/*.html; do
  echo "Processing $file..."
  
  # 使用sed替换侧边栏链接
  # 将 href="ai_opponent.html" 替换为 href="../structure/ai_opponent.html"
  sed -i 's/href="ai_opponent.html"/href="..\/structure\/ai_opponent.html"/g' "$file"
  sed -i 's/href="architecture.html"/href="..\/structure\/architecture.html"/g' "$file"
  sed -i 's/href="class_diagram.html"/href="..\/structure\/class_diagram.html"/g' "$file"
  sed -i 's/href="component_interaction.html"/href="..\/structure\/component_interaction.html"/g' "$file"
  sed -i 's/href="error_handling.html"/href="..\/structure\/error_handling.html"/g' "$file"
  sed -i 's/href="project_structure.html"/href="..\/structure\/project_structure.html"/g' "$file"
  
  echo "Fixed links in $file"
done

echo "All sidebar links fixed!"
