/**
 * 夜间模式星空背景动画
 * 参考: https://jzephyrsaber.github.io/2022/10/12/nightsky/
 */
(function() {
    'use strict';

    class StarfieldAnimation {
        constructor() {
            this.canvas = document.getElementById('universe');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.stars = [];
            this.config = {
                starCountFactor: 0.216, // 星星数量系数
                speed: 0.05,
                colors: {
                    giant: '180,184,240',    // 蓝色巨星
                    normal: '226,225,142',   // 黄色普通星
                    comet: '226,225,224'     // 白色彗星
                }
            };
            
            this.init();
            this.bindEvents();
            this.animate();
        }

        init() {
            this.resize();
            this.createStars();
        }

        // 重置画布尺寸
        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.starCount = Math.floor(this.width * this.config.starCountFactor);
        }

        // 创建星星数组
        createStars() {
            this.stars = [];
            for (let i = 0; i < this.starCount; i++) {
                this.stars.push(new Star(this.width, this.height, this.config));
            }
        }

        // 渲染循环
        render() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.stars.forEach(star => {
                star.update();
                star.draw(this.ctx);
            });
        }

        // 动画帧
        animate() {
            // 只在夜间模式时渲染星空
            const htmlElement = document.getElementsByTagName('html')[0];
            const isDark = htmlElement.getAttribute('data-theme') === 'dark' || 
                          htmlElement.classList.contains('dark') ||
                          document.body.classList.contains('dark');
            
            if (isDark) {
                this.render();
            }
            requestAnimationFrame(() => this.animate());
        }

        // 绑定事件
        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
                this.createStars();
            });
        }
    }

    class Star {
        constructor(width, height, config) {
            this.width = width;
            this.height = height;
            this.config = config;
            this.reset();
        }

        reset() {
            // 类型判定
            this.isGiant = this.randomChance(3);
            this.isComet = !this.isGiant && this.randomChance(10);
            
            // 位置
            this.x = this.random(0, this.width);
            this.y = this.random(0, this.height);
            
            // 大小
            this.radius = this.random(1.1, 2.6);
            
            // 速度
            const baseSpeed = this.config.speed;
            this.velocityX = this.random(baseSpeed, baseSpeed * 6);
            this.velocityY = -this.random(baseSpeed, baseSpeed * 6);
            
            if (this.isComet) {
                this.velocityX *= this.random(50, 120);
                this.velocityY *= this.random(50, 120);
            }
            
            // 透明度动画
            this.opacity = 0;
            this.fadeInSpeed = this.random(0.0005, 0.002);
            this.opacityThreshold = this.random(0.2, 0.6);
            if (this.isComet) this.opacityThreshold += 0.4;
            
            this.isFadingIn = true;
            this.isFadingOut = false;
            
            // 延迟显示普通星星
            if (!this.isGiant && !this.isComet) {
                setTimeout(() => {
                    this.opacity = this.random(0.3, 0.8);
                    this.isFadingIn = false;
                }, 100);
            }
        }

        update() {
            // 淡入
            if (this.isFadingIn) {
                this.opacity += this.fadeInSpeed;
                if (this.opacity >= this.opacityThreshold) {
                    this.isFadingIn = false;
                }
            }

            // 淡出
            if (this.isFadingOut) {
                this.opacity -= this.fadeInSpeed / 2;
                if (this.opacity <= 0) {
                    this.isFadingOut = false;
                    this.reset();
                }
            }

            // 移动
            this.x += this.velocityX;
            this.y += this.velocityY;

            // 边界检测
            if (this.x > this.width || this.y < 0) {
                this.isFadingOut = true;
            }
        }

        draw(ctx) {
            ctx.save();
            
            if (this.isGiant) {
                // 绘制巨星
                ctx.fillStyle = `rgba(${this.config.colors.giant}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.isComet) {
                // 绘制彗星和拖尾
                ctx.fillStyle = `rgba(${this.config.colors.comet}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制拖尾
                for (let i = 0; i < 30; i++) {
                    const tailOpacity = this.opacity - (this.opacity / 30 * i);
                    if (tailOpacity > 0) {
                        ctx.fillStyle = `rgba(${this.config.colors.comet}, ${tailOpacity})`;
                        ctx.fillRect(
                            this.x - this.velocityX * i / 4,
                            this.y - this.velocityY * i / 4,
                            2, 2
                        );
                    }
                }
            } else {
                // 绘制普通星星
                ctx.fillStyle = `rgba(${this.config.colors.normal}, ${this.opacity})`;
                ctx.fillRect(this.x, this.y, this.radius, this.radius);
            }
            
            ctx.restore();
        }

        // 工具方法
        random(min, max) {
            return Math.random() * (max - min) + min;
        }

        randomChance(outOf) {
            return Math.random() * 1000 < outOf * 10;
        }
    }

    // 初始化星空动画
    function initStarfield() {
        // 等待 canvas 元素加载
        if (document.getElementById('universe')) {
            new StarfieldAnimation();
        } else {
            // 如果 canvas 还没加载，等待 DOM 加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.getElementById('universe')) {
                        new StarfieldAnimation();
                    }
                });
            }
        }
    }

    // 执行初始化
    initStarfield();
})();
