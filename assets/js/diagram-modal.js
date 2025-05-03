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

          // 获取渲染后的SVG元素并优化其显示
          setTimeout(() => {
            const svgElement = mermaidLarge.querySelector('svg');
            if (svgElement) {
              // 获取SVG的viewBox属性
              const viewBox = svgElement.getAttribute('viewBox');

              // 确保SVG有正确的宽高设置
              if (!svgElement.hasAttribute('width') || !svgElement.hasAttribute('height')) {
                if (viewBox) {
                  const viewBoxValues = viewBox.split(' ');
                  if (viewBoxValues.length >= 4) {
                    const viewBoxWidth = parseFloat(viewBoxValues[2]);
                    const viewBoxHeight = parseFloat(viewBoxValues[3]);

                    // 设置SVG的宽高
                    svgElement.setAttribute('width', viewBoxWidth);
                    svgElement.setAttribute('height', viewBoxHeight);
                  }
                }
              }

              // 确保SVG可以正确缩放
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';

              // 移除可能导致显示问题的样式
              svgElement.style.overflow = 'visible';
            }
          }, 50); // 短暂延迟确保DOM已更新
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
        }
      }

      // 显示模态框
      modal.classList.add('show');

      // 重置缩放
      currentZoom = 1;

      // 延迟应用缩放，确保SVG已完全渲染
      setTimeout(() => {
        applyZoom();

        // 确保图表在视图中居中
        const svgElement = mermaidLarge.querySelector('svg');
        if (svgElement) {
          // 计算滚动位置，使图表居中
          const containerHeight = mermaidLarge.clientHeight;
          const svgHeight = svgElement.getBoundingClientRect().height;

          // 如果图表高度超过容器，则滚动到顶部
          if (svgHeight > containerHeight) {
            mermaidLarge.scrollTop = 0;
          }
        }
      }, 100);
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
  function applyZoom() {
    // 获取SVG元素
    const svgElement = mermaidLarge.querySelector('svg');
    if (svgElement) {
      // 应用缩放到SVG元素而不是容器
      svgElement.style.transform = `scale(${currentZoom})`;
      svgElement.style.transformOrigin = 'center top'; // 从顶部中心缩放

      // 更新容器的滚动位置，保持图表在视图中居中
      if (currentZoom > 1) {
        // 只有在放大时才调整滚动位置
        const scrollX = (svgElement.getBoundingClientRect().width * (currentZoom - 1)) / 2;
        const scrollY = (svgElement.getBoundingClientRect().height * (currentZoom - 1)) / 4;
        mermaidLarge.scrollLeft = scrollX;
        mermaidLarge.scrollTop = scrollY;
      }
    } else {
      // 如果找不到SVG元素，则应用到容器
      mermaidLarge.style.transform = `scale(${currentZoom})`;
      mermaidLarge.style.transformOrigin = 'center top';
    }
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      currentZoom = Math.min(3, currentZoom + 0.1); // 限制最大缩放为3倍
      applyZoom();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      currentZoom = Math.max(0.5, currentZoom - 0.1);
      applyZoom();
    });
  }

  if (resetZoomBtn) {
    resetZoomBtn.addEventListener('click', function() {
      currentZoom = 1;
      applyZoom();
      // 重置滚动位置
      mermaidLarge.scrollLeft = 0;
      mermaidLarge.scrollTop = 0;
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

      // 获取SVG的尺寸信息
      const svgWidth = svgElement.getAttribute('width');
      const svgHeight = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');

      // 解析viewBox以获取实际尺寸
      let viewBoxWidth, viewBoxHeight;
      if (viewBox) {
        const viewBoxValues = viewBox.split(' ');
        if (viewBoxValues.length >= 4) {
          viewBoxWidth = parseFloat(viewBoxValues[2]);
          viewBoxHeight = parseFloat(viewBoxValues[3]);
        }
      }

      // 确定最终尺寸 - 优先使用viewBox尺寸，因为它通常更准确
      const finalWidth = viewBoxWidth || parseFloat(svgWidth) || svgElement.getBoundingClientRect().width || 800;
      const finalHeight = viewBoxHeight || parseFloat(svgHeight) || svgElement.getBoundingClientRect().height || 600;

      // 创建一个新的div来包含SVG，以便正确捕获
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px'; // 使用left而不是top，避免可能的垂直滚动问题
      container.style.background = 'white';
      container.style.width = `${finalWidth}px`;
      container.style.height = `${finalHeight}px`;
      container.style.padding = '0'; // 移除内边距，确保图表完整显示
      container.style.margin = '0';
      container.style.overflow = 'hidden'; // 防止内容溢出

      // 克隆SVG元素并设置正确的尺寸
      const clonedSvg = svgElement.cloneNode(true);

      // 确保SVG尺寸正确
      clonedSvg.setAttribute('width', finalWidth);
      clonedSvg.setAttribute('height', finalHeight);
      if (!clonedSvg.getAttribute('viewBox') && viewBoxWidth && viewBoxHeight) {
        clonedSvg.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
      }

      // 确保SVG使用绝对单位
      clonedSvg.style.width = `${finalWidth}px`;
      clonedSvg.style.height = `${finalHeight}px`;

      container.appendChild(clonedSvg);
      document.body.appendChild(container);

      // 显示加载提示
      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'loading-indicator';
      loadingMsg.textContent = '正在生成图片，请稍候...';
      document.body.appendChild(loadingMsg);

      // 使用html2canvas将div转换为canvas，设置适当的选项
      const options = {
        scale: 2, // 提高分辨率
        useCORS: true, // 允许跨域图片
        allowTaint: true, // 允许污染canvas
        backgroundColor: '#ffffff', // 确保白色背景
        logging: false, // 关闭日志
        width: finalWidth,
        height: finalHeight
      };

      // 给浏览器一点时间来渲染克隆的SVG
      setTimeout(() => {
        html2canvas(container, options).then(canvas => {
          // 移除临时元素
          document.body.removeChild(container);
          document.body.removeChild(loadingMsg);

          // 创建下载链接
          const link = document.createElement('a');
          // 生成文件名：使用标题或默认名称
          const fileName = (currentTitle ? currentTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'diagram') + '.png';

          // 将canvas转换为blob URL，使用高质量设置
          canvas.toBlob(function(blob) {
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            // 释放URL对象
            setTimeout(() => URL.revokeObjectURL(link.href), 5000);
          }, 'image/png', 1.0); // 使用最高质量
        }).catch(error => {
          console.error('保存图片失败:', error);
          alert('保存图片失败: ' + error.message);
          document.body.removeChild(container);
          document.body.removeChild(loadingMsg);

          // 如果html2canvas失败，尝试使用SVG方法
          saveSvgDirectly(svgElement);
        });
      }, 100); // 短暂延迟确保DOM已更新
    } else {
      // 如果html2canvas未加载，尝试使用原生方法保存SVG
      const svgElement = mermaidLarge.querySelector('svg');
      if (!svgElement) {
        alert('无法找到图表SVG元素');
        return;
      }

      saveSvgDirectly(svgElement);
    }
  }

  // 直接保存SVG的辅助函数
  function saveSvgDirectly(svgElement) {
    try {
      // 克隆SVG以便修改
      const clonedSvg = svgElement.cloneNode(true);

      // 添加XML命名空间（如果没有）
      if (!clonedSvg.getAttribute('xmlns')) {
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // 添加CSS样式内联
      const styles = document.querySelectorAll('style');
      let stylesText = '';
      styles.forEach(style => {
        stylesText += style.textContent;
      });

      if (stylesText) {
        const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        styleElement.textContent = stylesText;
        clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);
      }

      // 序列化SVG
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
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
      alert('保存图片失败: ' + error.message + '\n请确保已加载html2canvas库或尝试使用现代浏览器');
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
      currentZoom = Math.min(3, currentZoom + 0.1); // 限制最大缩放为3倍
      applyZoom();
    });
  }

  if (contextZoomOutBtn) {
    contextZoomOutBtn.addEventListener('click', function() {
      currentZoom = Math.max(0.5, currentZoom - 0.1);
      applyZoom();
    });
  }

  if (contextResetZoomBtn) {
    contextResetZoomBtn.addEventListener('click', function() {
      currentZoom = 1;
      applyZoom();
      // 重置滚动位置
      mermaidLarge.scrollLeft = 0;
      mermaidLarge.scrollTop = 0;
    });
  }

  // 加载html2canvas库（如果尚未加载）
  if (typeof html2canvas === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;

    // 设置超时处理，防止长时间加载
    const timeoutId = setTimeout(() => {
      if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas库加载超时');
        // 显示加载失败通知
        showLoadFailureNotification();
        // 移除脚本元素
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    }, 10000); // 10秒超时

    // 加载成功和失败的处理
    script.onload = function() {
      clearTimeout(timeoutId);
      console.log('html2canvas库加载成功');
    };

    script.onerror = function() {
      clearTimeout(timeoutId);
      console.error('html2canvas库加载失败，将使用SVG格式保存');
      showLoadFailureNotification();
    };

    // 显示加载失败通知的函数
    function showLoadFailureNotification() {
      // 添加一个提示，告知用户html2canvas加载失败
      const notification = document.createElement('div');
      notification.textContent = 'html2canvas库加载失败，图表将以SVG格式保存';
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.padding = '10px 15px';
      notification.style.backgroundColor = '#ff9800';
      notification.style.color = 'white';
      notification.style.borderRadius = '4px';
      notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      notification.style.zIndex = '9999';
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';

      document.body.appendChild(notification);

      // 显示通知
      setTimeout(() => {
        notification.style.opacity = '1';
      }, 100);

      // 3秒后隐藏通知
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }

    document.head.appendChild(script);
  }
});
