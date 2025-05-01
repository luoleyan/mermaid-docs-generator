/**
 * 图表模态框功能
 * 允许用户点击图表查看大图
 * 支持右键菜单保存图片
 */
document.addEventListener('DOMContentLoaded', function() {
  // 创建模态框元素
  const modal = document.createElement('div');
  modal.className = 'diagram-modal';
  modal.innerHTML = `
    <div class="diagram-modal-content">
      <span class="diagram-close">&times;</span>
      <h3 class="diagram-title"></h3>
      <div class="mermaid-large"></div>
      <div class="diagram-controls">
        <button id="zoom-in">放大</button>
        <button id="zoom-out">缩小</button>
        <button id="reset-zoom">重置</button>
        <button id="save-image">保存图片</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // 创建右键菜单
  const contextMenu = document.createElement('div');
  contextMenu.className = 'diagram-context-menu';
  contextMenu.innerHTML = `
    <ul>
      <li id="context-save-image">保存图片</li>
      <li id="context-zoom-in">放大</li>
      <li id="context-zoom-out">缩小</li>
      <li id="context-reset-zoom">重置缩放</li>
    </ul>
  `;
  document.body.appendChild(contextMenu);

  // 获取模态框元素
  const modalContent = modal.querySelector('.diagram-modal-content');
  const closeBtn = modal.querySelector('.diagram-close');
  const diagramTitle = modal.querySelector('.diagram-title');
  const mermaidLarge = modal.querySelector('.mermaid-large');
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetZoomBtn = document.getElementById('reset-zoom');
  const saveImageBtn = document.getElementById('save-image');
  
  // 获取右键菜单元素
  const contextSaveImageBtn = document.getElementById('context-save-image');
  const contextZoomInBtn = document.getElementById('context-zoom-in');
  const contextZoomOutBtn = document.getElementById('context-zoom-out');
  const contextResetZoomBtn = document.getElementById('context-reset-zoom');

  // 当前缩放级别
  let currentZoom = 1;
  
  // 当前图表标题（用于保存文件名）
  let currentTitle = "";

  // 为所有Mermaid图表添加点击事件
  document.querySelectorAll('.mermaid').forEach((diagram, index) => {
    // 跳过已经在模态框中的图表
    if (diagram.closest('.diagram-modal')) return;
    
    // 为每个图表添加唯一ID（如果没有）
    if (!diagram.id) {
      diagram.id = 'mermaid-diagram-' + index;
    }
    
    // 添加点击事件
    diagram.addEventListener('click', function() {
      // 获取图表的前一个h2标题作为模态框标题
      let title = "图表详情";
      let prevElement = diagram.previousElementSibling;
      
      // 向上查找最近的标题元素
      while (prevElement) {
        if (prevElement.tagName === 'H2' || prevElement.tagName === 'H3' || 
            prevElement.tagName === 'H1') {
          title = prevElement.textContent;
          break;
        }
        prevElement = prevElement.previousElementSibling;
      }
      
      // 设置模态框标题
      diagramTitle.textContent = title;
      // 保存当前标题用于文件名
      currentTitle = title;
      
      // 复制图表内容到模态框
      mermaidLarge.innerHTML = diagram.innerHTML;
      
      // 重新渲染模态框中的图表
      if (typeof mermaid !== 'undefined') {
        try {
          // 使用mermaid API重新渲染图表
          mermaid.init(undefined, mermaidLarge);
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
        }
      }
      
      // 显示模态框
      modal.classList.add('show');
      
      // 重置缩放
      currentZoom = 1;
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  });
  
  // 关闭模态框
  closeBtn.addEventListener('click', function() {
    modal.classList.remove('show');
  });
  
  // 点击模态框背景关闭
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.classList.remove('show');
    }
  });
  
  // ESC键关闭模态框
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('show')) {
      modal.classList.remove('show');
    }
  });
  
  // 缩放功能
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      currentZoom += 0.1;
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      currentZoom = Math.max(0.5, currentZoom - 0.1);
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  if (resetZoomBtn) {
    resetZoomBtn.addEventListener('click', function() {
      currentZoom = 1;
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  // 保存图片功能
  function saveDiagramAsImage() {
    // 使用html2canvas库将SVG转换为canvas，然后保存为图片
    if (typeof html2canvas !== 'undefined') {
      // 获取图表SVG元素
      const svgElement = mermaidLarge.querySelector('svg');
      if (!svgElement) {
        alert('无法找到图表SVG元素');
        return;
      }
      
      // 创建一个新的div来包含SVG，以便正确捕获
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.background = 'white';
      container.style.width = svgElement.getAttribute('width') || '800px';
      container.style.height = svgElement.getAttribute('height') || '600px';
      container.style.padding = '20px';
      
      // 克隆SVG元素
      const clonedSvg = svgElement.cloneNode(true);
      container.appendChild(clonedSvg);
      document.body.appendChild(container);
      
      // 使用html2canvas将div转换为canvas
      html2canvas(container).then(canvas => {
        // 移除临时容器
        document.body.removeChild(container);
        
        // 创建下载链接
        const link = document.createElement('a');
        // 生成文件名：使用标题或默认名称
        const fileName = (currentTitle ? currentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'diagram') + '.png';
        
        // 将canvas转换为blob URL
        canvas.toBlob(function(blob) {
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          
          // 释放URL对象
          setTimeout(() => URL.revokeObjectURL(link.href), 5000);
        });
      }).catch(error => {
        console.error('保存图片失败:', error);
        alert('保存图片失败: ' + error.message);
        document.body.removeChild(container);
      });
    } else {
      // 如果html2canvas未加载，尝试使用原生方法
      try {
        const svgElement = mermaidLarge.querySelector('svg');
        if (!svgElement) {
          alert('无法找到图表SVG元素');
          return;
        }
        
        // 创建一个新的SVG元素，设置正确的命名空间
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        
        // 创建下载链接
        const link = document.createElement('a');
        const fileName = (currentTitle ? currentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'diagram') + '.svg';
        
        link.href = URL.createObjectURL(svgBlob);
        link.download = fileName;
        link.click();
        
        // 释放URL对象
        setTimeout(() => URL.revokeObjectURL(link.href), 5000);
      } catch (error) {
        console.error('保存SVG失败:', error);
        alert('保存图片失败: ' + error.message + '\n请确保已加载html2canvas库');
      }
    }
  }
  
  // 添加保存图片按钮事件
  if (saveImageBtn) {
    saveImageBtn.addEventListener('click', saveDiagramAsImage);
  }
  
  // 右键菜单显示和隐藏
  mermaidLarge.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    
    // 显示右键菜单
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    
    // 标记当前右键菜单为活动状态
    contextMenu.classList.add('active');
  });
  
  // 点击页面任何地方关闭右键菜单
  document.addEventListener('click', function() {
    contextMenu.style.display = 'none';
    contextMenu.classList.remove('active');
  });
  
  // 右键菜单项事件
  if (contextSaveImageBtn) {
    contextSaveImageBtn.addEventListener('click', saveDiagramAsImage);
  }
  
  if (contextZoomInBtn) {
    contextZoomInBtn.addEventListener('click', function() {
      currentZoom += 0.1;
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  if (contextZoomOutBtn) {
    contextZoomOutBtn.addEventListener('click', function() {
      currentZoom = Math.max(0.5, currentZoom - 0.1);
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  if (contextResetZoomBtn) {
    contextResetZoomBtn.addEventListener('click', function() {
      currentZoom = 1;
      mermaidLarge.style.transform = `scale(${currentZoom})`;
    });
  }
  
  // 加载html2canvas库（如果尚未加载）
  if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;
    document.head.appendChild(script);
  }
});
