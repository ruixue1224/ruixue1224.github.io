/**
 * 视频背景功能
 * 支持在页面中使用视频作为背景
 * 
 * 使用方法：
 * 1. 在页面的 front matter 中添加 video_bg: /path/to/video.mp4
 * 2. 可选：添加 video_bg_poster: /path/to/poster.jpg（视频封面图）
 * 3. 可选：添加 video_bg_loop: true（是否循环播放，默认true）
 * 4. 可选：添加 video_bg_muted: true（是否静音，默认true）
 */

(function() {
  'use strict';

  // 等待DOM加载完成
  function startInit() {
    // 延迟一点执行，确保所有元素都已加载
    setTimeout(function() {
      initVideoBackground();
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInit);
  } else {
    startInit();
  }

  function initVideoBackground() {
    // 方法1: 从页面中的特殊div获取配置（最简单的方法）
    const videoConfigDiv = document.getElementById('video-bg-config');
    if (videoConfigDiv) {
      const videoBg = videoConfigDiv.getAttribute('data-video') || 
                      videoConfigDiv.getAttribute('data-src');
      const videoBgPoster = videoConfigDiv.getAttribute('data-poster');
      const videoBgLoop = videoConfigDiv.getAttribute('data-loop') !== 'false';
      const videoBgMuted = videoConfigDiv.getAttribute('data-muted') !== 'false';
      const useHeader = videoConfigDiv.getAttribute('data-header') === 'true';
      
      if (videoBg) {
        console.log('Video background config found:', {
          video: videoBg,
          poster: videoBgPoster,
          loop: videoBgLoop,
          muted: videoBgMuted,
          useHeader: useHeader
        });
        createVideoBackground(videoBg, {
          poster: videoBgPoster,
          loop: videoBgLoop,
          muted: videoBgMuted,
          useHeader: useHeader
        });
        return;
      } else {
        console.warn('Video background config div found but no video path specified');
      }
    } else {
      console.log('No video background config found');
    }

    // 方法2: 从页面元素获取配置（通过data属性）
    const videoBg = document.body.getAttribute('data-video-bg') || 
                    document.getElementById('page-header')?.getAttribute('data-video-bg');
    const videoBgPoster = document.body.getAttribute('data-video-bg-poster') || 
                          document.getElementById('page-header')?.getAttribute('data-video-bg-poster');
    const videoBgLoop = (document.body.getAttribute('data-video-bg-loop') || 
                         document.getElementById('page-header')?.getAttribute('data-video-bg-loop')) !== 'false';
    const videoBgMuted = (document.body.getAttribute('data-video-bg-muted') || 
                         document.getElementById('page-header')?.getAttribute('data-video-bg-muted')) !== 'false';
    
    if (videoBg) {
      createVideoBackground(videoBg, {
        poster: videoBgPoster,
        loop: videoBgLoop,
        muted: videoBgMuted
      });
      return;
    }

    // 方法3: 从页面数据脚本获取配置
    const pageData = document.querySelector('script[type="application/json"][data-page]');
    if (pageData) {
      try {
        const pageConfig = JSON.parse(pageData.textContent);
        if (pageConfig.video_bg) {
          createVideoBackground(pageConfig.video_bg, {
            poster: pageConfig.video_bg_poster,
            loop: pageConfig.video_bg_loop !== false,
            muted: pageConfig.video_bg_muted !== false
          });
        }
      } catch (e) {
        console.warn('Failed to parse page config for video background:', e);
      }
    }
  }

  function createVideoBackground(videoSrc, options = {}) {
    // 默认选项
    const config = {
      poster: options.poster || '',
      loop: options.loop !== false,
      muted: options.muted !== false,
      autoplay: true,
      playsinline: true,
      useHeader: options.useHeader || false
    };

    // 检查是否在header区域使用视频背景
    const pageHeader = document.getElementById('page-header');
    const useHeaderBg = config.useHeader || (pageHeader && pageHeader.classList.contains('video-bg'));

    if (useHeaderBg) {
      // 在header区域添加视频背景
      if (!pageHeader) {
        console.error('Page header not found, cannot add video background');
        return;
      }
      
      pageHeader.classList.add('video-bg');
      
      const video = document.createElement('video');
      video.className = 'video-header-bg';
      video.src = videoSrc;
      if (config.poster) {
        video.poster = config.poster;
        // 预加载封面图
        const posterImg = new Image();
        posterImg.src = config.poster;
      }
      video.loop = config.loop;
      video.muted = config.muted;
      video.autoplay = config.autoplay;
      video.playsInline = config.playsinline;
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('preload', 'metadata'); // 改为metadata，加快初始加载
      
      console.log('Creating header video background:', videoSrc);
      
      // 视频加载完成后播放
      video.addEventListener('loadeddata', function() {
        console.log('Video loaded, attempting to play');
        video.play().catch(function(error) {
          console.warn('Video autoplay failed:', error);
          // 如果自动播放失败，尝试用户交互后播放
          document.addEventListener('click', function playVideo() {
            video.play().catch(console.warn);
            document.removeEventListener('click', playVideo);
          }, { once: true });
        });
      });

      // 视频加载错误处理
      video.addEventListener('error', function(e) {
        console.error('Video loading error:', videoSrc, e);
        // 如果视频加载失败，显示封面图作为背景
        // 延迟设置，确保 header-pull-effect 插件能正确检测到
        if (config.poster) {
          setTimeout(function() {
            pageHeader.style.backgroundImage = `url('${config.poster}')`;
            pageHeader.style.backgroundSize = 'cover';
            pageHeader.style.backgroundPosition = 'center center';
          }, 100);
        }
      });

      // 视频可以播放时
      video.addEventListener('canplay', function() {
        console.log('Video can play');
      });
      
      // 视频加载中显示封面图
      // 延迟设置背景图片，确保 header-pull-effect 插件能正确检测到
      if (config.poster) {
        setTimeout(function() {
          pageHeader.style.backgroundImage = `url('${config.poster}')`;
          pageHeader.style.backgroundSize = 'cover';
          pageHeader.style.backgroundPosition = 'center center';
        }, 50);
      }

      pageHeader.appendChild(video);
    } else {
      // 在全页面背景添加视频
      let container = document.getElementById('video-background-container');
      
      if (!container) {
        container = document.createElement('div');
        container.id = 'video-background-container';
        document.body.appendChild(container);
      }

      const video = document.createElement('video');
      video.src = videoSrc;
      video.poster = config.poster;
      video.loop = config.loop;
      video.muted = config.muted;
      video.autoplay = config.autoplay;
      video.playsInline = config.playsinline;
      video.setAttribute('webkit-playsinline', 'true');
      
      // 视频加载完成后播放
      video.addEventListener('loadeddata', function() {
        video.play().catch(function(error) {
          console.warn('Video autoplay failed:', error);
          // 如果自动播放失败，尝试用户交互后播放
          document.addEventListener('click', function playVideo() {
            video.play().catch(console.warn);
            document.removeEventListener('click', playVideo);
          }, { once: true });
        });
      });

      // 视频加载错误处理
      video.addEventListener('error', function() {
        console.error('Video loading error:', videoSrc);
        // 可以在这里添加备用图片背景
        if (config.poster) {
          container.style.backgroundImage = `url(${config.poster})`;
          container.style.backgroundSize = 'cover';
          container.style.backgroundPosition = 'center';
        }
      });

      container.appendChild(video);
    }

    // 移动端检测：如果屏幕太小，可以禁用视频背景
    if (window.innerWidth <= 768) {
      const videos = document.querySelectorAll('#video-background-container video, .video-header-bg');
      videos.forEach(v => {
        v.style.display = 'none';
      });
    }
  }

  // 监听窗口大小变化
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth <= 768) {
        const videos = document.querySelectorAll('#video-background-container video, .video-header-bg');
        videos.forEach(v => {
          v.style.display = 'none';
        });
      } else {
        const videos = document.querySelectorAll('#video-background-container video, .video-header-bg');
        videos.forEach(v => {
          v.style.display = 'block';
        });
      }
    }, 250);
  });
})();
