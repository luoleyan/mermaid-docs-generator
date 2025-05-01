#!/bin/bash

# 定义UI设计图页面目录
UI_DIR="docs/diagrams/html/ui"

# 遍历UI设计图目录中的所有HTML文件
for file in "$UI_DIR"/*.html; do
  echo "Processing $file..."
  
  # 使用sed替换侧边栏链接
  # 将 href="ui/card_interaction.html" 替换为 href="../ui/card_interaction.html"
  sed -i 's/href="ui\/card_interaction.html"/href="..\/ui\/card_interaction.html"/g' "$file"
  sed -i 's/href="ui\/game_wireframe.html"/href="..\/ui\/game_wireframe.html"/g' "$file"
  sed -i 's/href="ui\/interaction_flow.html"/href="..\/ui\/interaction_flow.html"/g' "$file"
  sed -i 's/href="ui\/menu_wireframe.html"/href="..\/ui\/menu_wireframe.html"/g' "$file"
  sed -i 's/href="ui\/README.html"/href="..\/ui\/README.html"/g' "$file"
  sed -i 's/href="ui\/ui_component_hierarchy.html"/href="..\/ui\/ui_component_hierarchy.html"/g' "$file"
  sed -i 's/href="ui\/ui_layout.html"/href="..\/ui\/ui_layout.html"/g' "$file"
  sed -i 's/href="ui\/ui_style_guide.html"/href="..\/ui\/ui_style_guide.html"/g' "$file"
  
  echo "Fixed links in $file"
done

echo "All UI sidebar links fixed!"
