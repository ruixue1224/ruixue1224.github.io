/**
 * 日夜切换转场动画插件
 * 适用于 Butterfly 等 Hexo 博客主题
 */
(function() {
  'use strict';

  class DayNightTransition {
    constructor(options = {}) {
      this.options = {
        duration: 1400, // 动画持续时间（毫秒）
        starsCount: 150, // 星星数量
        shootingStarsCount: 6, // 流星数量
        ...options
      };
      
      this.container = null;
      this.orbitAngle = 0;
      this.isActive = false;
      this.init();
    }

    init() {
      // 创建容器
      this.createContainer();
      // 创建场景元素
      this.createScene();
      // 创建星星和流星
      this.createStars();
      this.createShootingStars();
      // 创建云朵
      this.createClouds();
    }

    createContainer() {
      this.container = document.createElement('div');
      this.container.className = 'day-night-transition';
      document.body.appendChild(this.container);
    }

    createScene() {
      const scene = document.createElement('div');
      scene.className = 'scene';
      
      // 转场层
      const transitionLayer = document.createElement('div');
      transitionLayer.className = 'transition-layer';
      
      // 天空覆盖层
      const skyOverlay = document.createElement('div');
      skyOverlay.className = 'sky-overlay';
      
      // 银河带
      const galaxyBand = document.createElement('div');
      galaxyBand.className = 'galaxy-band';
      
      // 天体轨道
      const celestialOrbit = document.createElement('div');
      celestialOrbit.className = 'celestial-orbit';
      
      const celestialTrail = document.createElement('div');
      celestialTrail.className = 'celestial-trail';
      
      const sun = document.createElement('div');
      sun.className = 'sun';
      
      const moon = document.createElement('div');
      moon.className = 'moon';
      
      celestialOrbit.appendChild(celestialTrail);
      celestialOrbit.appendChild(sun);
      celestialOrbit.appendChild(moon);
      
      // 星星容器
      const stars = document.createElement('div');
      stars.className = 'stars';
      stars.id = 'dnt-stars';
      
      // 流星容器
      const shootingStars = document.createElement('div');
      shootingStars.className = 'shooting-stars';
      shootingStars.id = 'dnt-shooting-stars';
      
      // 云朵容器
      const clouds = document.createElement('div');
      clouds.className = 'clouds';
      clouds.id = 'dnt-clouds';
      
      // 地平线
      const horizon = document.createElement('div');
      horizon.className = 'horizon';
      
      const mountainLayer = document.createElement('div');
      mountainLayer.className = 'mountain-layer';
      
      const mountainFar = document.createElement('div');
      mountainFar.className = 'mountain-range mountain-far';
      
      const mountainMid = document.createElement('div');
      mountainMid.className = 'mountain-range mountain-mid';
      
      const mountainNear = document.createElement('div');
      mountainNear.className = 'mountain-range mountain-near';
      
      const treeBack = document.createElement('div');
      treeBack.className = 'tree-line tree-back';
      
      const treeFront = document.createElement('div');
      treeFront.className = 'tree-line tree-front';
      
      const river = document.createElement('div');
      river.className = 'river';
      
      const foregroundGlow = document.createElement('div');
      foregroundGlow.className = 'foreground-glow';
      
      horizon.appendChild(mountainLayer);
      horizon.appendChild(mountainFar);
      horizon.appendChild(mountainMid);
      horizon.appendChild(mountainNear);
      horizon.appendChild(treeBack);
      horizon.appendChild(treeFront);
      horizon.appendChild(river);
      horizon.appendChild(foregroundGlow);
      
      scene.appendChild(transitionLayer);
      scene.appendChild(skyOverlay);
      scene.appendChild(galaxyBand);
      scene.appendChild(celestialOrbit);
      scene.appendChild(stars);
      scene.appendChild(shootingStars);
      scene.appendChild(clouds);
      scene.appendChild(horizon);
      
      this.container.appendChild(scene);
    }

    createStars() {
      const stars = document.getElementById('dnt-stars');
      if (!stars) return;
      
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < this.options.starsCount; i++) {
        const star = document.createElement('span');
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.animationDelay = `${Math.random() * 4}s`;
        fragment.appendChild(star);
      }
      stars.appendChild(fragment);
    }

    createShootingStars() {
      const shootingStars = document.getElementById('dnt-shooting-stars');
      if (!shootingStars) return;
      
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < this.options.shootingStarsCount; i++) {
        const meteor = document.createElement('span');
        meteor.style.setProperty('--delay', `${Math.random() * 7}s`);
        meteor.style.setProperty('--top', `${Math.random() * 40 + 5}%`);
        meteor.style.setProperty('--left', `${Math.random() * 40 + 60}%`);
        fragment.appendChild(meteor);
      }
      shootingStars.appendChild(fragment);
    }

    createClouds() {
      const clouds = document.getElementById('dnt-clouds');
      if (!clouds) return;
      
      const cloudConfigs = [
        { type: 'day', speed: '26s', width: '200px', height: '65px', top: '18%', left: '8%', delay: '0s' },
        { type: 'day', speed: '32s', width: '150px', height: '50px', top: '38%', left: '32%', delay: '-6s' },
        { type: 'day', speed: '24s', width: '230px', height: '70px', top: '26%', left: '60%', delay: '-12s' },
        { type: 'night', speed: '30s', width: '180px', height: '60px', top: '22%', left: '15%', delay: '-4s' },
        { type: 'night', speed: '36s', width: '210px', height: '65px', top: '28%', left: '55%', delay: '-10s' }
      ];
      
      cloudConfigs.forEach(config => {
        const cloud = document.createElement('div');
        cloud.className = `cloud cloud-${config.type}`;
        cloud.style.setProperty('--speed', config.speed);
        cloud.style.width = config.width;
        cloud.style.height = config.height;
        cloud.style.top = config.top;
        cloud.style.left = config.left;
        cloud.style.animationDelay = config.delay;
        clouds.appendChild(cloud);
      });
    }

    rotateOrbit() {
      this.orbitAngle += 180;
      this.container.style.setProperty('--orbit-angle', `${this.orbitAngle}deg`);
    }

    async play(isDayMode) {
      if (this.isActive) return;
      
      this.isActive = true;
      
      // 设置初始状态
      if (isDayMode) {
        this.container.classList.add('day');
      } else {
        this.container.classList.remove('day');
      }
      
      // 显示容器
      this.container.classList.add('active');
      
      // 等待一帧确保样式应用
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // 开始转场动画
      this.container.classList.add('transitioning');
      this.rotateOrbit();
      
      // 切换模式
      setTimeout(() => {
        if (isDayMode) {
          this.container.classList.add('day');
        } else {
          this.container.classList.remove('day');
        }
      }, 100);
      
      // 动画结束后隐藏
      setTimeout(() => {
        this.container.classList.remove('transitioning');
        
        setTimeout(() => {
          this.container.classList.remove('active');
          this.isActive = false;
        }, 300);
      }, this.options.duration);
    }

    destroy() {
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
    }
  }

  // 导出转场动画实例到全局
  // 注意：转场动画只在点击夜间模式切换按钮时触发，不会自动监听主题变化
  // Butterfly 主题通过 main.js 的 rightSideFn.darkmode() 函数调用 window.dayNightTransition.play()
  // 因此不需要在此处绑定按钮事件，避免重复触发
  
  window.DayNightTransition = DayNightTransition;
  window.dayNightTransition = new DayNightTransition();

  // 手动触发方法（供其他脚本调用）
  window.triggerDayNightTransition = function(isDayMode) {
    window.dayNightTransition.play(isDayMode);
  };

})();
