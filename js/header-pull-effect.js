/**
 * 顶部背景图片下拉展开效果插件
 * 类似微信朋友圈下拉查看背景的功能
 * 
 * 使用方法：
 * 1. 在 _config.butterfly.yml 的 inject.bottom 中添加此脚本
 * 2. 在页面中添加 data-enable-pull-effect="true" 属性到 #page-header 元素
 *   或者在 _config.butterfly.yml 中设置 header_pull_effect.enable: true
 * 
 * 注意：此插件默认不启用，需要显式配置才会激活
 */

(function() {
  'use strict';

  // 检查是否启用下拉效果插件
  // 方法1: 检查全局配置
  const globalConfig = window.headerPullEffectConfig || {};
  const configEnabled = globalConfig.enable === true;
  
  // 方法2: 检查页面header元素上的data属性
  let pageHeader = document.getElementById('page-header');
  const dataEnabled = pageHeader && pageHeader.getAttribute('data-enable-pull-effect') === 'true';
  
  // 方法3: 检查body元素上的data属性
  const bodyEnabled = document.body && document.body.getAttribute('data-enable-pull-effect') === 'true';
  
  // 如果都没有启用，直接返回，不执行任何操作
  if (!configEnabled && !dataEnabled && !bodyEnabled) {
    console.log('Header pull effect plugin is disabled. To enable it, add data-enable-pull-effect="true" to #page-header or configure in _config.butterfly.yml');
    return;
  }
  
  console.log('Header pull effect plugin enabled');

  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  let isPulled = false;
  let pullDistance = 0;
  const PULL_THRESHOLD = 80; // 下拉阈值（像素）
  const MAX_PULL = 150; // 最大下拉距离

  function initHeaderPullEffect() {
    // 再次检查是否启用（在函数内部也检查，确保安全）
    pageHeader = document.getElementById('page-header');
    if (!pageHeader) {
      console.log('Page header not found');
      return;
    }
    
    // 检查该页面是否启用了下拉效果
    const pageEnabled = pageHeader.getAttribute('data-enable-pull-effect') === 'true';
    const bodyEnabled = document.body && document.body.getAttribute('data-enable-pull-effect') === 'true';
    const globalEnabled = window.headerPullEffectConfig && window.headerPullEffectConfig.enable === true;
    
    if (!pageEnabled && !bodyEnabled && !globalEnabled) {
      console.log('Header pull effect is disabled for this page');
      return;
    }

    // 检查是否有背景图片（包括内联样式和计算样式）
    // 放宽检查条件，只要不是 not-top-img 类，就启用下拉效果
    const hasNotTopImg = pageHeader.classList.contains('not-top-img');
    
    // 检查内联样式（Butterfly主题通过style属性设置背景）
    const inlineStyle = pageHeader.getAttribute('style') || '';
    const inlineBgMatch = inlineStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
    let inlineBg = inlineBgMatch ? `url('${inlineBgMatch[1]}')` : pageHeader.style.backgroundImage;
    
    const computedStyle = window.getComputedStyle(pageHeader);
    const computedBg = computedStyle.backgroundImage;
    
    // 也检查style属性中是否有background-image
    const hasStyleBg = inlineStyle && inlineStyle.includes('background-image');
    
    const hasBg = (inlineBg && inlineBg !== 'none' && inlineBg !== '') || 
                  (computedBg && computedBg !== 'none' && computedBg !== '') ||
                  hasStyleBg;
    const hasVideo = pageHeader.classList.contains('video-bg');
    
    console.log('Header background check:', {
      hasNotTopImg: hasNotTopImg,
      inlineStyle: inlineStyle,
      inlineBg: inlineBg,
      computedBg: computedBg,
      hasStyleBg: hasStyleBg,
      hasBg: hasBg,
      hasVideo: hasVideo,
      classList: Array.from(pageHeader.classList)
    });
    
    // 如果没有背景图片且没有视频，且不是 not-top-img，仍然启用（可能是延迟加载）
    if (hasNotTopImg) {
      console.log('Page has not-top-img class, skipping pull effect');
      return; // 明确标记为无顶部图片的页面，不启用效果
    }
    
    // 即使暂时没有检测到背景图片，也启用下拉效果
    // Butterfly主题可能通过内联样式延迟设置背景图片
    console.log('Enabling pull effect (background may load later)');
    
    // 检查是否已经创建了背景层（避免重复创建）
    let bgImage = pageHeader.querySelector('.header-bg-image');
    let isInitialized = false;
    
    if (bgImage) {
      console.log('Background image layer already exists');
      // 如果已存在，检查是否需要更新背景图片
      const currentBg = window.getComputedStyle(pageHeader).backgroundImage;
      if (currentBg && currentBg !== 'none' && currentBg !== '') {
        const bgImageCurrentBg = window.getComputedStyle(bgImage).backgroundImage;
        if (!bgImageCurrentBg || bgImageCurrentBg === 'none' || bgImageCurrentBg === '') {
          // 背景层存在但没有背景图片，更新它
          bgImage.style.backgroundImage = currentBg;
          bgImage.style.backgroundSize = computedStyle.backgroundSize || 'cover';
          bgImage.style.backgroundPosition = computedStyle.backgroundPosition || 'center center';
          bgImage.style.backgroundRepeat = computedStyle.backgroundRepeat || 'no-repeat';
          // 延迟清除原背景图片，确保先显示
          // 增加延迟时间，确保图片完全加载
          setTimeout(function() {
            const bgImageBg = window.getComputedStyle(bgImage).backgroundImage;
            if (bgImageBg && bgImageBg !== 'none' && bgImageBg !== '') {
              pageHeader.style.backgroundImage = 'none';
            }
          }, 200);
          console.log('Updated existing background image layer');
        }
      }
      isInitialized = true; // 标记为已初始化，但继续执行以绑定事件
    }

    // 创建背景图片层
    bgImage = document.createElement('div');
    bgImage.className = 'header-bg-image';
    
    // 复制背景图片样式
    // 优先使用内联样式，如果没有则使用计算样式
    // 也检查style属性中的background-image
    let bgImageSrc = '';
    if (inlineBg && inlineBg !== 'none' && inlineBg !== '') {
      bgImageSrc = inlineBg;
    } else if (computedBg && computedBg !== 'none' && computedBg !== '') {
      bgImageSrc = computedBg;
    } else if (hasStyleBg && inlineBgMatch) {
      // 从style属性中提取背景图片URL
      bgImageSrc = `url('${inlineBgMatch[1]}')`;
    }
    
    // 函数：设置背景图片到bgImage层
    function setBackgroundImage(bgSrc, style) {
      if (bgSrc && bgSrc !== 'none' && bgSrc !== '') {
        // 先设置背景图片到bgImage层
        bgImage.style.backgroundImage = bgSrc;
        bgImage.style.backgroundSize = style.backgroundSize || 'cover';
        bgImage.style.backgroundPosition = style.backgroundPosition || 'center center';
        bgImage.style.backgroundRepeat = style.backgroundRepeat || 'no-repeat';
        
        console.log('Background image copied to bgImage layer:', {
          image: bgSrc,
          size: bgImage.style.backgroundSize,
          position: bgImage.style.backgroundPosition
        });
        
        // 确保bgImage层已经添加到DOM中
        if (!pageHeader.contains(bgImage)) {
          pageHeader.appendChild(bgImage);
        }
        
        // 延迟清除原背景图片，确保背景图片先显示
        // 增加延迟时间，确保图片完全加载后再清除原背景
        // 这样可以避免第一次加载时图片不显示的问题
        setTimeout(function() {
          // 只有在bgImage层确实有背景图片时才清除原背景
          const bgImageBg = window.getComputedStyle(bgImage).backgroundImage;
          if (bgImageBg && bgImageBg !== 'none' && bgImageBg !== '') {
            // 检查图片是否已加载完成
            const bgUrl = bgImageBg.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (bgUrl && bgUrl[1]) {
              const img = new Image();
              img.onload = function() {
                // 图片加载完成后再清除原背景
                pageHeader.style.backgroundImage = 'none';
                console.log('Original background image cleared, using bgImage layer');
              };
              img.onerror = function() {
                // 如果图片加载失败，保留原背景
                console.warn('Background image failed to load, keeping original background');
              };
              img.src = bgUrl[1];
            } else {
              // 如果无法提取URL，延迟更长时间后清除
              setTimeout(function() {
                pageHeader.style.backgroundImage = 'none';
                console.log('Original background image cleared after extended delay');
              }, 300);
            }
          }
        }, 100);
        
        return true;
      }
      return false;
    }
    
    // 如果背景层不存在，先创建并添加到DOM
    // 这样即使背景图片还没检测到，也能确保结构存在
    if (!isInitialized) {
      // 立即添加bgImage层，即使背景图片还没加载
      // 这样下拉效果可以立即工作，背景图片也能正常显示
      pageHeader.appendChild(bgImage);
    }
    
    // 立即尝试设置背景图片
    if (setBackgroundImage(bgImageSrc, computedStyle)) {
      console.log('Background image set immediately');
    } else {
      // 如果没有检测到背景图片，多次重试（可能是延迟加载）
      // 增加重试次数和更长的等待时间，确保所有页面都能检测到背景图片
      let retryCount = 0;
      const maxRetries = 10; // 增加到10次重试
      
      function retryCheck() {
        retryCount++;
        const retryComputedStyle = window.getComputedStyle(pageHeader);
        const retryInlineStyle = pageHeader.getAttribute('style') || '';
        const retryInlineBgMatch = retryInlineStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
        let retryInlineBg = retryInlineBgMatch ? `url('${retryInlineBgMatch[1]}')` : pageHeader.style.backgroundImage;
        const retryComputedBg = retryComputedStyle.backgroundImage;
        
        // 优先使用内联样式，然后是计算样式
        const retryBg = (retryInlineBg && retryInlineBg !== 'none' && retryInlineBg !== '') 
          ? retryInlineBg 
          : (retryComputedBg && retryComputedBg !== 'none' && retryComputedBg !== '')
            ? retryComputedBg
            : '';
        
        console.log(`Retry ${retryCount}: checking background image`, {
          inlineStyle: retryInlineStyle,
          inline: retryInlineBg,
          computed: retryComputedBg,
          final: retryBg
        });
        
        if (retryBg && setBackgroundImage(retryBg, retryComputedStyle)) {
          console.log('Background image loaded after retry:', retryBg);
        } else if (retryCount < maxRetries) {
          // 继续重试，间隔逐渐增加（但不超过2秒）
          const delay = Math.min(200 * retryCount, 2000);
          setTimeout(retryCheck, delay);
        } else {
          console.warn('Background image not found after all retries, but pull effect will still work');
          // 即使没有检测到背景图片，也确保下拉效果可以工作
          // 有些页面可能通过其他方式设置背景，或者背景图片加载很慢
          // 保持原背景图片显示，不清除
        }
      }
      
      // 第一次重试在100ms后（更快）
      setTimeout(retryCheck, 100);
    }

    // 检查并创建下拉指示器（如果不存在）
    let pullIndicator = pageHeader.querySelector('.pull-indicator');
    if (!pullIndicator) {
      pullIndicator = document.createElement('div');
      pullIndicator.className = 'pull-indicator';
      pullIndicator.innerHTML = '<span>下拉查看完整背景</span>';
      pageHeader.appendChild(pullIndicator);
    }

    // 检查并创建关闭按钮（如果不存在）
    let closeBtn = pageHeader.querySelector('.close-full-bg');
    if (!closeBtn) {
      closeBtn = document.createElement('div');
      closeBtn.className = 'close-full-bg';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', '关闭全屏背景');
      pageHeader.appendChild(closeBtn);
    }
    
    // 如果已经初始化过，检查事件监听器是否已绑定
    // 使用一个标记来避免重复绑定
    // 注意：在pjax导航后，这个标记会被清除，所以需要重新绑定
    if (pageHeader.dataset.pullEffectInitialized === 'true') {
      console.log('Pull effect already initialized with event listeners');
      return; // 已经初始化且事件已绑定，直接返回
    }
    
    // 标记为已初始化（在绑定事件之前标记，避免重复执行）
    pageHeader.dataset.pullEffectInitialized = 'true';

    // 触摸事件（移动端）
    // 使用 passive: true 提高性能，不阻止其他事件
    pageHeader.addEventListener('touchstart', handleTouchStart, { passive: true });
    pageHeader.addEventListener('touchmove', handleTouchMove, { passive: true });
    pageHeader.addEventListener('touchend', handleTouchEnd, { passive: true });

    // 鼠标事件（桌面端）- 只在非导航栏区域触发
    // 使用命名函数以便后续可以移除监听器，避免重复绑定
    const mouseDownHandler = function(e) {
      // 如果点击的是导航栏或导航栏内的元素，不触发下拉效果
      const nav = pageHeader.querySelector('#nav');
      if (nav && (nav.contains(e.target) || e.target === nav)) {
        return;
      }
      handleMouseDown(e);
    };
    const mouseMoveHandler = handleMouseMove;
    const mouseUpHandler = handleMouseUp;
    
    pageHeader.addEventListener('mousedown', mouseDownHandler);
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
    
    // 保存事件处理器引用，以便后续可以移除（如果需要）
    pageHeader._pullEffectHandlers = {
      mousedown: mouseDownHandler,
      mousemove: mouseMoveHandler,
      mouseup: mouseUpHandler
    };

    // 关闭按钮点击事件
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeFullBackground();
    });

    // 点击背景关闭（当已展开时）
    pageHeader.addEventListener('click', function(e) {
      if (isPulled && e.target === pageHeader || e.target === bgImage) {
        closeFullBackground();
      }
    });

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isPulled) {
        closeFullBackground();
      }
    });

    function handleTouchStart(e) {
      // 检查是否触摸到特效元素
      const target = e.target;
      if (target && (
        target.tagName === 'CANVAS' || 
        target.classList.contains('fireworks') ||
        target.closest('.fireworks') ||
        target.closest('[class*="effect"]')
      )) {
        return; // 不处理特效元素的触摸
      }
      
      if (pageHeader.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    }

    function handleTouchMove(e) {
      if (!isPulling) return;
      
      // 检查是否触摸到特效元素
      const target = e.target;
      if (target && (
        target.tagName === 'CANVAS' || 
        target.classList.contains('fireworks') ||
        target.closest('.fireworks') ||
        target.closest('[class*="effect"]')
      )) {
        // 如果触摸到特效元素，停止下拉
        isPulling = false;
        resetPullState();
        return;
      }
      
      currentY = e.touches[0].clientY;
      pullDistance = Math.max(0, currentY - startY);

      if (pullDistance > 0) {
        updatePullState();
      }
    }

    function handleTouchEnd() {
      if (pullDistance >= PULL_THRESHOLD) {
        openFullBackground();
      } else {
        resetPullState();
      }
      isPulling = false;
    }

    function handleMouseDown(e) {
      // 如果点击的是导航栏，不触发下拉
      const nav = pageHeader.querySelector('#nav');
      if (nav && (nav.contains(e.target) || e.target === nav)) {
        return;
      }
      
      // 如果点击的是特效元素（如 fireworks canvas、爱心特效等），不触发下拉
      // 这样可以完全避免与所有原生特效脚本冲突
      if (e.target && (
        e.target.tagName === 'CANVAS' || 
        e.target.classList.contains('fireworks') ||
        e.target.closest('.fireworks') ||
        e.target.classList.contains('click-heart') ||
        e.target.closest('.click-heart') ||
        e.target.closest('[class*="effect"]') ||
        e.target.closest('[id*="ribbon"]') ||
        e.target.closest('[id*="canvas"]')
      )) {
        return;
      }
      
      // 只在页面顶部且未展开时才能触发下拉
      if (pageHeader.scrollTop === 0 && !isPulled) {
        // 检查是否在可下拉区域（避免与页面内容交互冲突）
        const rect = pageHeader.getBoundingClientRect();
        if (e.clientY > rect.top && e.clientY < rect.top + rect.height) {
          startY = e.clientY;
          isPulling = true;
          pageHeader.style.cursor = 'grabbing';
          // 不阻止默认行为，让其他特效脚本也能正常工作
        }
      }
    }

    function handleMouseMove(e) {
      if (!isPulling) return;
      
      // 如果鼠标在特效元素上，不处理下拉，并停止下拉状态
      if (e.target && (
        e.target.tagName === 'CANVAS' || 
        e.target.classList.contains('fireworks') ||
        e.target.closest('.fireworks') ||
        e.target.classList.contains('click-heart') ||
        e.target.closest('.click-heart') ||
        e.target.closest('[class*="effect"]') ||
        e.target.closest('[id*="ribbon"]') ||
        e.target.closest('[id*="canvas"]')
      )) {
        // 如果遇到特效元素，停止下拉
        isPulling = false;
        resetPullState();
        return;
      }
      
      currentY = e.clientY;
      pullDistance = Math.max(0, currentY - startY);

      if (pullDistance > 0) {
        updatePullState();
      }
    }

    function handleMouseUp(e) {
      // 如果点击的是导航栏，不处理
      const nav = pageHeader.querySelector('#nav');
      if (nav && e && (nav.contains(e.target) || e.target === nav)) {
        isPulling = false;
        return;
      }
      
      if (pullDistance >= PULL_THRESHOLD) {
        openFullBackground();
      } else {
        resetPullState();
      }
      isPulling = false;
      pageHeader.style.cursor = '';
    }

    function updatePullState() {
      // 不是放大，而是向下移动显示更多内容
      const translateY = pullDistance * 0.5; // 下拉时背景向下移动
      bgImage.style.transform = `translateY(${translateY}px)`;
      
      if (pullDistance > 20) {
        pageHeader.classList.add('pulling');
      }
    }

    function openFullBackground() {
      isPulled = true;
      pageHeader.classList.remove('pulling');
      pageHeader.classList.add('pulled');
      
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
      
      // 显示完整图片 - 改为contain模式显示完整图片，而不是放大
      bgImage.style.backgroundSize = 'contain';
      bgImage.style.backgroundPosition = 'center center';
      bgImage.style.transform = 'translateY(0)';
    }

    function closeFullBackground() {
      isPulled = false;
      pageHeader.classList.remove('pulled');
      pullDistance = 0;
      
      // 恢复原始背景样式
      const computedStyle = window.getComputedStyle(pageHeader);
      bgImage.style.backgroundSize = computedStyle.backgroundSize || 'cover';
      bgImage.style.backgroundPosition = computedStyle.backgroundPosition || 'center center';
      bgImage.style.transform = 'translateY(0)';
      
      // 恢复页面滚动
      document.body.style.overflow = '';
    }

    function resetPullState() {
      pageHeader.classList.remove('pulling');
      pullDistance = 0;
      bgImage.style.transform = 'translateY(0)';
    }
  }

  // 初始化函数 - 确保在所有页面都能正常工作
  function initWithRetry(forceReinit = false) {
    // 检查是否已经初始化过
    const pageHeader = document.getElementById('page-header');
    if (!pageHeader) {
      // 如果header还没加载，延迟重试
      if (typeof initWithRetry.retryCount === 'undefined') {
        initWithRetry.retryCount = 0;
      }
      if (initWithRetry.retryCount < 5) {
        initWithRetry.retryCount++;
        setTimeout(() => initWithRetry(forceReinit), 200);
      }
      return;
    }
    
    // 如果强制重新初始化（pjax导航后），清除标记
    if (forceReinit) {
      pageHeader.dataset.pullEffectInitialized = 'false';
      
      // 检查并恢复原背景图片（如果被清除了）
      const inlineStyle = pageHeader.getAttribute('style') || '';
      const inlineBgMatch = inlineStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
      const currentBg = window.getComputedStyle(pageHeader).backgroundImage;
      
      // 如果原背景图片被清除了，恢复它
      if ((!currentBg || currentBg === 'none' || currentBg === '') && inlineBgMatch) {
        pageHeader.style.backgroundImage = `url('${inlineBgMatch[1]}')`;
        console.log('Restored original background image before reinitialization');
      }
      
      // 移除旧的事件监听器和元素
      // 先移除事件监听器
      if (pageHeader._pullEffectHandlers) {
        pageHeader.removeEventListener('mousedown', pageHeader._pullEffectHandlers.mousedown);
        document.removeEventListener('mousemove', pageHeader._pullEffectHandlers.mousemove);
        document.removeEventListener('mouseup', pageHeader._pullEffectHandlers.mouseup);
        delete pageHeader._pullEffectHandlers;
      }
      
      const oldBgImage = pageHeader.querySelector('.header-bg-image');
      if (oldBgImage) {
        oldBgImage.remove();
      }
      const oldIndicator = pageHeader.querySelector('.pull-indicator');
      if (oldIndicator) {
        oldIndicator.remove();
      }
      const oldCloseBtn = pageHeader.querySelector('.close-full-bg');
      if (oldCloseBtn) {
        oldCloseBtn.remove();
      }
      console.log('Cleared old pull effect elements for reinitialization');
    }
    
    if (pageHeader.dataset.pullEffectInitialized === 'true' && !forceReinit) {
      console.log('Header pull effect already initialized');
      return; // 已经初始化，不重复执行
    }
    
    initHeaderPullEffect();
  }
  
  // 立即尝试初始化（不等待DOMContentLoaded，提升响应速度）
  initWithRetry();
  
  // 也监听DOMContentLoaded，确保万无一失
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(() => initWithRetry(), 100);
    });
  }
  
  // 多次延迟检查，确保所有背景图片都已加载
  // 有些页面的背景图片可能通过主题机制延迟设置
  // 减少重复检查次数，避免过度初始化
  setTimeout(() => initWithRetry(), 300);
  setTimeout(() => initWithRetry(), 1000);
  setTimeout(() => initWithRetry(), 2000);
  
  // 监听pjax导航完成事件，重新初始化下拉效果
  // Butterfly主题使用pjax进行页面导航
  document.addEventListener('pjax:complete', function() {
    console.log('Pjax navigation complete, reinitializing pull effect');
    
    // 立即检查并恢复背景图片显示
    const pageHeader = document.getElementById('page-header');
    if (pageHeader) {
      // 检查是否有style属性中的背景图片
      const inlineStyle = pageHeader.getAttribute('style') || '';
      const inlineBgMatch = inlineStyle.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i);
      
      // 如果原背景图片被清除了，恢复它
      const currentBg = window.getComputedStyle(pageHeader).backgroundImage;
      if ((!currentBg || currentBg === 'none' || currentBg === '') && inlineBgMatch) {
        // 恢复原背景图片，确保立即显示
        pageHeader.style.backgroundImage = `url('${inlineBgMatch[1]}')`;
        console.log('Restored original background image after pjax:', inlineBgMatch[1]);
      }
    }
    
    // 延迟一点确保DOM已更新
    setTimeout(() => {
      initWithRetry(true); // 强制重新初始化
    }, 100);
    
    // 再次延迟检查，确保背景图片已加载
    // 减少重复检查，避免过度初始化
    setTimeout(() => initWithRetry(true), 500);
    setTimeout(() => initWithRetry(true), 1500);
  });
  
  // 也监听window的load事件（完整刷新时）
  window.addEventListener('load', function() {
    setTimeout(() => initWithRetry(), 200);
  });
})();
