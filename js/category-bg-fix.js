/**
 * 分类页面背景图片修复
 * 确保只有分类页面使用 category_img .png
 * 优化加载性能 - 立即设置，不等待加载，减少延迟
 */

(function() {
  'use strict';

  // 使用URL编码的路径，避免空格问题
  const bgImageUrl = '/img/category_img%20.png';
  
  // 预加载图片（立即开始，不等待页面检查）
  const preloadImg = new Image();
  preloadImg.src = bgImageUrl;
  preloadImg.onload = function() {
    console.log('Category background image preloaded');
  };
  preloadImg.onerror = function() {
    console.warn('Category background image preload failed');
  };

  function fixCategoryBackground() {
    // 检查是否是分类页面（快速检查，不依赖DOM）
    const isCategoriesPage = 
      document.body && document.body.classList.contains('type-categories') ||
      window.location.pathname.includes('/categories/') ||
      (document.querySelector('#page-title') && 
       document.querySelector('#page-title').textContent.includes('分类'));

    if (!isCategoriesPage) {
      return; // 不是分类页面，不处理
    }

    const pageHeader = document.getElementById('page-header');
    if (!pageHeader) {
      // 如果header还没加载，快速重试（减少重试次数和延迟）
      if (typeof fixCategoryBackground.retryCount === 'undefined') {
        fixCategoryBackground.retryCount = 0;
      }
      if (fixCategoryBackground.retryCount < 2) { // 减少到2次重试
        fixCategoryBackground.retryCount++;
        setTimeout(fixCategoryBackground, 50); // 减少延迟到50ms
      }
      return;
    }

    // 立即设置背景图片（不等待加载完成，提升体验）
    // CSS已经设置了，这里确保JavaScript也设置，避免冲突
    const currentBg = window.getComputedStyle(pageHeader).backgroundImage;
    if (!currentBg.includes('category_img')) {
      pageHeader.style.backgroundImage = `url('${bgImageUrl}')`;
      pageHeader.style.backgroundSize = '120% auto';
      pageHeader.style.backgroundPosition = 'center center';
      pageHeader.style.backgroundRepeat = 'no-repeat';
      console.log('Category background image set immediately:', bgImageUrl);
    }
  }

  // 立即执行，不等待DOMContentLoaded（CSS已经设置了背景）
  // 如果body还没加载，使用更快的检查方式
  if (document.body) {
    fixCategoryBackground();
  } else {
    // 如果body还没加载，等待很短时间后重试
    setTimeout(fixCategoryBackground, 10);
  }
  
  // 也监听DOMContentLoaded，确保万无一失
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixCategoryBackground);
  }
  
  // 监听window load事件，作为最后保障
  window.addEventListener('load', function() {
    setTimeout(fixCategoryBackground, 10);
  });
})();
