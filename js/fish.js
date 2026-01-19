// 使用原生 JavaScript，不依赖 jQuery
function fish() {
  var footer = document.querySelector("footer");
  if (!footer) {
    // footer 元素不存在，延迟执行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fish);
    } else {
      setTimeout(fish, 100);
    }
    return;
  }
  
  // 检查容器是否已存在，避免重复添加
  var container = document.getElementById("jsi-flying-fish-container");
  if (container) {
    return;
  }
  
  // 创建容器，覆盖页脚下方缝隙
  container = document.createElement('div');
  container.className = 'fish_container';
  container.id = 'jsi-flying-fish-container';
  // 使用绝对定位延伸到页面底部，覆盖缝隙
  container.style.cssText = 'z-index: -1; width: 100%; height: 200px; margin: 0; padding: 0; position: absolute; bottom: 0; left: 0;';
  footer.appendChild(container);
  
  // 设置 footer-wrap 样式
  var footerWrap = document.getElementById("footer-wrap");
  if (footerWrap) {
    footerWrap.style.cssText = 'position: absolute; text-align: center; top: 0; right: 0; left: 0; bottom: 0;';
  }
}
var RENDERER = {
	POINT_INTERVAL : 5,
	FISH_COUNT : 3,
	MAX_INTERVAL_COUNT : 50,
	INIT_HEIGHT_RATE : 0.5,
	THRESHOLD : 50,
	WATCH_INTERVAL : 200,
	
	init : function(){
		if (!this.setParameters()) {
			console.error('Fish animation: Failed to set parameters');
			return;
		}
		this.reconstructMethods();
		this.setup();
		this.bindEvent();
		this.render();
	},
	setParameters : function(){
		// 使用原生 JavaScript，不依赖 jQuery
		this.container = document.getElementById('jsi-flying-fish-container');
		
		// 检查容器是否存在
		if (!this.container) {
			console.error('Fish container not found!');
			return false;
		}
		
		this.canvas = document.createElement('canvas');
		this.container.appendChild(this.canvas);
		this.context = this.canvas.getContext('2d');
		this.points = [];
		this.fishes = [];
		this.watchIds = [];
		return true;
	},
	createSurfacePoints : function(){
		var count = Math.round(this.width / this.POINT_INTERVAL);
		this.pointInterval = this.width / (count - 1);
		this.points.push(new SURFACE_POINT(this, 0));
		
		for(var i = 1; i < count; i++){
			var point = new SURFACE_POINT(this, i * this.pointInterval),
				previous = this.points[i - 1];
				
			point.setPreviousPoint(previous);
			previous.setNextPoint(point);
			this.points.push(point);
		}
	},
	reconstructMethods : function(){
		this.watchWindowSize = this.watchWindowSize.bind(this);
		this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
		this.startEpicenter = this.startEpicenter.bind(this);
		this.moveEpicenter = this.moveEpicenter.bind(this);
		this.reverseVertical = this.reverseVertical.bind(this);
		this.render = this.render.bind(this);
	},
	setup : function(){
		this.points.length = 0;
		this.fishes.length = 0;
		this.watchIds.length = 0;
		this.intervalCount = this.MAX_INTERVAL_COUNT;
		// 使用原生 JavaScript 获取宽度和高度
		this.width = this.container.offsetWidth || this.container.clientWidth;
		this.height = this.container.offsetHeight || this.container.clientHeight;
		this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500;
		// 设置 canvas 尺寸
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.reverse = false;
		
		this.fishes.push(new FISH(this));
		this.createSurfacePoints();
	},
	watchWindowSize : function(){
		this.clearTimer();
		this.tmpWidth = window.innerWidth;
		this.tmpHeight = window.innerHeight;
		this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
	},
	clearTimer : function(){
		while(this.watchIds.length > 0){
			clearTimeout(this.watchIds.pop());
		}
	},
	jdugeToStopResize : function(){
		var width = window.innerWidth,
			height = window.innerHeight,
			stopped = (width == this.tmpWidth && height == this.tmpHeight);
			
		this.tmpWidth = width;
		this.tmpHeight = height;
		
		if(stopped){
			this.setup();
		}
	},
	bindEvent : function(){
		// 使用原生 JavaScript 事件监听
		window.addEventListener('resize', this.watchWindowSize);
		this.container.addEventListener('mouseenter', this.startEpicenter);
		this.container.addEventListener('mousemove', this.moveEpicenter);
		this.container.addEventListener('click', this.reverseVertical);
	},
	getAxis : function(event){
		// 使用 getBoundingClientRect 获取元素位置
		var rect = this.container.getBoundingClientRect();
		var scrollX = window.pageXOffset || window.scrollX || 0;
		var scrollY = window.pageYOffset || window.scrollY || 0;
		
		return {
			x : event.clientX - rect.left + scrollX,
			y : event.clientY - rect.top + scrollY
		};
	},
	startEpicenter : function(event){
		this.axis = this.getAxis(event);
	},
	moveEpicenter : function(event){
		var axis = this.getAxis(event);
		
		if(!this.axis){
			this.axis = axis;
		}
		this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
		this.axis = axis;
	},
	generateEpicenter : function(x, y, velocity){
		if(y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD){
			return;
		}
		var index = Math.round(x / this.pointInterval);
		
		if(index < 0 || index >= this.points.length){
			return;
		}
		this.points[index].interfere(y, velocity);
	},
	reverseVertical : function(){
		this.reverse = !this.reverse;
		
		for(var i = 0, count = this.fishes.length; i < count; i++){
			this.fishes[i].reverseVertical();
		}
	},
	controlStatus : function(){
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateSelf();
		}
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].updateNeighbors();
		}
		if(this.fishes.length < this.fishCount){
			if(--this.intervalCount == 0){
				this.intervalCount = this.MAX_INTERVAL_COUNT;
				this.fishes.push(new FISH(this));
			}
		}
	},
	render : function(){
		requestAnimationFrame(this.render);
		this.controlStatus();
		this.context.clearRect(0, 0, this.width, this.height);
		// 更淡的蓝色波浪
		this.context.fillStyle = 'rgba(200, 230, 250, 0.4)'; // 更淡的天蓝色，40% 透明度
		
		for(var i = 0, count = this.fishes.length; i < count; i++){
			this.fishes[i].render(this.context);
		}
		this.context.save();
		this.context.globalCompositeOperation = 'xor';
		this.context.beginPath();
		this.context.moveTo(0, this.reverse ? 0 : this.height);
		
		for(var i = 0, count = this.points.length; i < count; i++){
			this.points[i].render(this.context);
		}
		this.context.lineTo(this.width, this.reverse ? 0 : this.height);
		this.context.closePath();
		this.context.fill();
		this.context.restore();
	}
};
var SURFACE_POINT = function(renderer, x){
	this.renderer = renderer;
	this.x = x;
	this.init();
};
SURFACE_POINT.prototype = {
	SPRING_CONSTANT : 0.03,
	SPRING_FRICTION : 0.9,
	WAVE_SPREAD : 0.3,
	ACCELARATION_RATE : 0.01,
	
	init : function(){
		this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
		this.height = this.initHeight;
		this.fy = 0;
		this.force = {previous : 0, next : 0};
	},
	setPreviousPoint : function(previous){
		this.previous = previous;
	},
	setNextPoint : function(next){
		this.next = next;
	},
	interfere : function(y, velocity){
		this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocity);
	},
	updateSelf : function(){
		this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
		this.fy *= this.SPRING_FRICTION;
		this.height += this.fy;
	},
	updateNeighbors : function(){
		if(this.previous){
			this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
		}
		if(this.next){
			this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
		}
	},
	render : function(context){
		if(this.previous){
			this.previous.height += this.force.previous;
			this.previous.fy += this.force.previous;
		}
		if(this.next){
			this.next.height += this.force.next;
			this.next.fy += this.force.next;
		}
		context.lineTo(this.x, this.renderer.height - this.height);
	}
};
var FISH = function(renderer){
	this.renderer = renderer;
	this.init();
};
FISH.prototype = {
	GRAVITY : 0.4,
	
	// 生成随机彩色
	getRandomColor : function(){
		// 生成鲜艳的颜色，使用 HSL 颜色空间
		var hue = Math.random() * 360; // 色相：0-360度
		var saturation = 60 + Math.random() * 40; // 饱和度：60-100%
		var lightness = 45 + Math.random() * 25; // 亮度：45-70%
		return 'hsl(' + Math.round(hue) + ', ' + Math.round(saturation) + '%, ' + Math.round(lightness) + '%)';
	},
	
	init : function(){
		// 为每条鱼分配随机彩色
		this.color = this.getRandomColor();
		this.direction = Math.random() < 0.5;
		this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
		this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);
		
		if(this.renderer.reverse){
			this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
			this.vy = this.getRandomValue(2, 5);
			this.ay = this.getRandomValue(0.05, 0.2);
		}else{
			this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
			this.vy = this.getRandomValue(-5, -2);
			this.ay = this.getRandomValue(-0.2, -0.05);
		}
		this.isOut = false;
		this.theta = 0;
		this.phi = 0;
	},
	getRandomValue : function(min, max){
		return min + (max - min) * Math.random();
	},
	reverseVertical : function(){
		this.isOut = !this.isOut;
		this.ay *= -1;
	},
	controlStatus : function(context){
		this.previousY = this.y;
		this.x += this.vx;
		this.y += this.vy;
		this.vy += this.ay;
		
		if(this.renderer.reverse){
			if(this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE){
				this.vy -= this.GRAVITY;
				this.isOut = true;
			}else{
				if(this.isOut){
					this.ay = this.getRandomValue(0.05, 0.2);
				}
				this.isOut = false;
			}
		}else{
			if(this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE){
				this.vy += this.GRAVITY;
				this.isOut = true;
			}else{
				if(this.isOut){
					this.ay = this.getRandomValue(-0.2, -0.05);
				}
				this.isOut = false;
			}
		}
		if(!this.isOut){
			this.theta += Math.PI / 20;
			this.theta %= Math.PI * 2;
			this.phi += Math.PI / 30;
			this.phi %= Math.PI * 2;
		}
		this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);
		
		if(this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx < 0 && this.x < -this.renderer.THRESHOLD){
			this.init();
		}
	},
	render : function(context){
		context.save();
		context.translate(this.x, this.y);
		context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
		context.scale(1, this.direction ? 1 : -1);
		
		// 设置鱼的彩色
		context.fillStyle = this.color;
		
		context.beginPath();
		context.moveTo(-30, 0);
		context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
		context.bezierCurveTo(15, -10, -20, -15, -30, 0);
		context.fill();
		
		context.save();
		context.translate(40, 0);
		context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
		context.beginPath();
		context.moveTo(0, 0);
		context.quadraticCurveTo(5, 10, 20, 8);
		context.quadraticCurveTo(12, 5, 10, 0);
		context.quadraticCurveTo(12, -5, 20, -8);
		context.quadraticCurveTo(5, -10, 0, 0);
		context.fill();
		context.restore();
		
		context.save();
		context.translate(-3, 0);
		context.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));
		
		context.beginPath();
		
		if(this.renderer.reverse){
			context.moveTo(5, 0);
			context.bezierCurveTo(10, 10, 10, 30, 0, 40);
			context.bezierCurveTo(-12, 25, -8, 10, 0, 0);
		}else{
			context.moveTo(-5, 0);
			context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
			context.bezierCurveTo(12, -25, 8, -10, 0, 0);
		}
		context.closePath();
		context.fill();
		context.restore();
		context.restore();
		this.controlStatus(context);
	}
};
// 初始化鱼儿动画（不依赖 jQuery）
(function() {
  console.log('Fish animation: Script loaded, starting initialization...');
  
  function initFishAnimation() {
    console.log('Fish animation: initFishAnimation called');
    
    // 确保 DOM 已加载
    var domReady = function(callback) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
      } else {
        callback();
      }
    };
    
    domReady(function() {
      console.log('Fish animation: DOM ready, checking footer...');
      
      // 检查 footer 元素是否存在
      var footer = document.querySelector("footer");
      if (!footer) {
        console.warn('Fish animation: Footer element not found, retrying...');
        setTimeout(initFishAnimation, 200);
        return;
      }
      
      console.log('Fish animation: Footer found, creating container...');
      
      // 创建容器（如果不存在）
      fish();
      
      // 等待容器创建后初始化渲染器
      setTimeout(function() {
        var container = document.getElementById("jsi-flying-fish-container");
        var containerExists = !!container;
        console.log('Fish animation: Container check -', {
          containerExists: containerExists,
          rendererExists: !!RENDERER,
          containerWidth: container ? container.offsetWidth : 0,
          containerHeight: container ? container.offsetHeight : 0
        });
        
        if (containerExists && RENDERER) {
          try {
            console.log('Fish animation: Initializing renderer...');
            RENDERER.init();
            console.log('Fish animation: Initialized successfully!');
          } catch(e) {
            console.error('Fish animation init error:', e);
            console.error('Error stack:', e.stack);
          }
        } else {
          console.warn('Fish animation: Container not found or RENDERER not available', {
            containerExists: containerExists,
            renderer: !!RENDERER
          });
        }
      }, 300);
    });
  }

  // 开始初始化（脚本在 body 底部加载，此时 DOM 可能已准备好）
  if (document.readyState === 'loading') {
    console.log('Fish animation: DOM still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initFishAnimation);
  } else {
    console.log('Fish animation: DOM already loaded, starting immediately...');
    initFishAnimation();
  }
})();


