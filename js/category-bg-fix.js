/**
 * 分类页面背景图片修复 - 高性能优化版本
 * 确保只有分类页面使用 category_img .png
 * 优化加载性能 - 立即设置，不等待加载，减少延迟
 * 解决首次点击无法加载、慢加载问题
 */

(function() {
  'use strict';

  // 使用URL编码的路径，避免空格问题
  const bgImageUrl = '/img/category_img%20.png';
  
  // 快速检查是否是分类页面（不依赖DOM，最快速度）
  function isCategoryPage() {
    // 优先使用URL路径检查，最快，不依赖DOM
    return window.location.pathname.includes('/categories/');
  }

  // 预加载图片（仅在分类页面预加载，避免浪费资源）
  // 立即执行，不等待任何事件
  if (isCategoryPage()) {
    // 使用 link rel="preload" 方式预加载（更高效）
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = bgImageUrl;
    document.head.appendChild(link);
    
    // 同时使用 Image 对象预加载（双重保障）
    const preloadImg = new Image();
    preloadImg.src = bgImageUrl;
  }

  function fixCategoryBackground() {
    // 快速检查，如果不是分类页面，立即返回（避免不必要的操作）
    if (!isCategoryPage()) {
      return;
    }

    const pageHeader = document.getElementById('page-header');
    if (!pageHeader) {
      // 如果header还没加载，快速重试（最多3次，间隔递增）
      if (typeof fixCategoryBackground.retryCount === 'undefined') {
        fixCategoryBackground.retryCount = 0;
      }
      if (fixCategoryBackground.retryCount < 3) {
        fixCategoryBackground.retryCount++;
        // 使用递增延迟：10ms, 30ms, 50ms
        setTimeout(fixCategoryBackground, 10 * fixCategoryBackground.retryCount);
      }
      return;
    }

    // 重置重试计数（成功找到header）
    fixCategoryBackground.retryCount = 0;

    // 立即设置背景图片（不等待加载完成，提升体验）
    const currentBg = window.getComputedStyle(pageHeader).backgroundImage;
    if (!currentBg.includes('category_img')) {
      pageHeader.style.backgroundImage = `url('${bgImageUrl}')`;
      pageHeader.style.backgroundSize = 'cover';
      pageHeader.style.backgroundPosition = 'center center';
      pageHeader.style.backgroundRepeat = 'no-repeat';
    }
  }

  // 立即执行，不等待任何事件（最快速度）
  fixCategoryBackground();
  
  // 如果body还没加载，也立即尝试（不等待）
  if (document.body) {
    fixCategoryBackground();
  }
  
  // 监听DOMContentLoaded（仅一次，作为保障）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixCategoryBackground, { once: true });
  }
  
  // 监听pjax完成事件（分类页面通过pjax导航时，立即执行）
  document.addEventListener('pjax:complete', function() {
    // 重置重试计数（pjax导航后重新开始）
    if (typeof fixCategoryBackground !== 'undefined') {
      fixCategoryBackground.retryCount = 0;
    }
    // 立即执行，不延迟
    fixCategoryBackground();
  }, { passive: true });
  
  // 监听pjax发送事件（在导航开始时就预加载，提升首次加载速度）
  document.addEventListener('pjax:send', function(e) {
    // 检查目标URL是否是分类页面
    const targetUrl = e.detail && e.detail.url ? e.detail.url : '';
    if (targetUrl.includes('/categories/')) {
      // 提前预加载图片
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = bgImageUrl;
      document.head.appendChild(link);
      
      const preloadImg = new Image();
      preloadImg.src = bgImageUrl;
    }
  }, { passive: true });
})();
