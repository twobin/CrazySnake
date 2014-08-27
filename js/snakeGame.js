$(document).ready(function(e) {
	var sg = new snakeGame();
});

var snakeGame = function(options){
	//通过ID获取元素
	this.e_playArea = $("#play_area");
	this.e_startBtn = $("#play_btn_start");
	this.e_playScore = $("#play_score");
	this.e_playDirection = $("#play_direction");
	this.e_levelBtn = $("#play_btn_level");
	this.e_levelMenu = $("#play_menu_level");
	//游戏区域行列
	this.cellCol = 25;
	this.cellRow = 25;
	this.cellArr = [];//格子数组
	this.activeArr = [0,1,2,3,4];//蛇的位置数组
	this.goal;//食物
	this.score = 0;//游戏得分
	this.direction = "right";//当前蛇的前进方向-初始为向右前进
	this.timer = null;
	this.interval = [300,200,100,50];//不同游戏级别的不同定时器时间
	this.levelScore = [2,5,10,20];//不同游戏级别的不同游戏单位得分
	this.level = 2;//容易、中等、困难、天才-对应的level：0、1、2、3
	
	this.lastCell;//蛇尾
	this.nextCell;//蛇头
	//游戏状态
	this.playing = false;//是否正在游戏中的状态
	this.turning = false;//是否蛇正在转向的状态
	this.deadth = false;//是否游戏结束死亡的状态
		
	this.start();
};
snakeGame.prototype = {
	start:function(){
		//this.playing = true;
		this.init();
		this.menu();
	},
	//初始化-游戏区域布局、显示事务、显示蛇
	init:function(){
		var self = this, 
			ele;
		//游戏区域布局
		for(var i = 0, num = this.cellCol * this.cellRow; i<num; i++){
			ele = document.createElement("div");
			ele.className = "play_cell";
			ele.id = "play_cell_" + i;
			this.cellArr.push($(ele));
			this.e_playArea.append(ele);
		}
		this.showGoal();//显示食物
		//显示蛇
		for(var j = 0, len = this.activeArr.length; j<len; j++){
			this.cellArr[this.activeArr[j]].addClass("active");
		}	
	},
	//显示食物
	showGoal:function(){
		if(this.goal != null) 
			this.cellArr[this.goal].removeClass("goal");
		//食物随机出现，且不与蛇的位置重叠
		this.goal = Math.floor(Math.random() * this.cellArr.length);
		for(var i = 0, len = this.activeArr.length; i<len; i++){
			if(this.goal == this.activeArr[i]){
				this.showGoal();
			}
		}
		this.cellArr[this.goal].addClass("goal");
	},
	//游戏菜单
	menu:function(){
		var self = this;
		//游戏开始按钮
		this.e_startBtn.click(function(){
			self.e_levelMenu.hide();
			if(self.playing){
				self.pause();
			}else if(self.deadth){
				self.resetArea();
				self.play();
			}else{
				self.play();
			}
		});
		//游戏难度按钮
		this.e_levelBtn.click(function(){
			if(self.playing) 
				return;
			self.e_levelMenu.toggle();//游戏难度菜单开关
		});
		//游戏菜单选项按钮
		this.e_levelMenu.find("a").click(function(){
			self.e_levelMenu.hide();
			self.e_levelBtn.find(".level_text").html($(this).html())
			//设置游戏难度等级
			self.setOptions({
				"level": $(this).attr("level")
			});
			//alert(self.interval[self.level])
		})
	},
	//设置游戏参数-运动方向、蛇的位置、游戏得分、游戏难度
	setOptions:function(options){
		this.direction = options.direction || this.direction;
		this.activeArr = options.activeArr || this.activeArr;
		this.score = options.score === 0 ? options.score : (options.score|| this.score);
		this.level = options.level === 0 ? options.level : (options.level|| this.level);
	},
	resetArea:function(){
		$(".play_cell.active").removeClass("active");
		this.setOptions({
			"direction": "right",
			"activeArr": [0,1,2,3,4],
			"score": 0
		});
		this.e_playScore.html(this.score);
		this.showGoal();
		for(var j = 0, len = this.activeArr.length; j<len; j++){
			this.cellArr[this.activeArr[j]].addClass("active");
		}
	},
	//游戏开始进行
	play:function(){
		var self = this;
		this.e_startBtn.html("暂停");
		this.playing = true;
		this.deadth = false;
		// this.timer = setTimeout(function(){
		// 	self.showSnake()},this.interval[this.level]);
		this.showSnake();
		this.control();
	},
	pause:function(){
		this.e_startBtn.html("开始")
		this.playing = false;
		//当游戏暂停或结束时，停止定时器
		clearTimeout(this.timer);
	},
	control:function(){
		var self = this;
		$("html").keydown(function(e){
			if(self.turning) 
				return !self.playing;
			switch (e.keyCode) {
				case 37:
					self.direction = self.direction != "right" ? "left" : self.direction;
					break;
				case 38:
					self.direction = self.direction != "bottom" ? "top" : self.direction;
					break;
				case 39:
					self.direction = self.direction != "left" ? "right" : self.direction;
					break;
				case 40:
					self.direction = self.direction != "top" ? "bottom" : self.direction;
					break;
				default:
					break;
			}
			self.e_playDirection.html(self.direction);
			self.turning = true;
			return !self.playing;
		})
	},
	//蛇身显示与移动-利用定时器控制移动
	showSnake:function(){
		var self = this;
		//目前只是蛇头执行了命令
		switch (this.direction) {
			case "top":
				this.nextCell = this.activeArr[this.activeArr.length-1] - this.cellCol;//减去一行的个数，即蛇向上爬行一行
				this.nextCell = this.nextCell < 0 ? null : this.nextCell;
				break;
			case "right":
				this.nextCell = this.activeArr[this.activeArr.length-1] + 1;//蛇向右前进一格
				this.nextCell = this.nextCell % this.cellCol == 0 ? null : this.nextCell;
				break;
			case "bottom":
				this.nextCell = this.activeArr[this.activeArr.length-1] + this.cellCol;//蛇向下一行
				this.nextCell = this.nextCell > this.cellCol * this.cellRow ? null : this.nextCell;
				break;
			case "left":
				this.nextCell = this.activeArr[this.activeArr.length-1] - 1;//蛇向左前进一格
				this.nextCell = (this.nextCell + 1) % this.cellCol == 0 ? null : this.nextCell;
				break;
		};
		//蛇撞墙，游戏结束
		if(this.nextCell == null){
			this.gameOver();
			return;
		}else{
			//蛇撞到自身，游戏结束
			for(var i = 0, len = this.activeArr.length; i<len; i++){
				if(this.nextCell == this.activeArr[i]){
					this.gameOver();
					return;
				}
			}
			//如果下一个格子不是食物，则移除蛇的第一个格子（蛇尾），更新蛇身位置
			if(this.nextCell != this.goal){
				this.lastCell = this.activeArr.shift();
				this.cellArr[this.lastCell].removeClass("active");
			}else{
				//如果下一个格子是食物，则不移除蛇尾
				this.getScore();//如果下一个格子是食物，则计算游戏得分
			}
			//将下一个格子加入蛇身数组的尾部-即蛇头
			this.activeArr.push(this.nextCell);
			this.cellArr[this.nextCell].addClass("active");
			//蛇没有在转向的状态，则保持前一个状态
			this.turning = false;
			this.timer = setTimeout(function(){
				self.showSnake()},this.interval[this.level]);
		}
	},
	getScore:function(){
		this.score += this.levelScore[this.level];
		this.e_playScore.html(this.score);
		this.showGoal();
	},
	gameOver:function(){
		this.deadth = true;
		this.pause();
		return;
	},
	isOver:function(){
		if(this.nextCell == null) return false;
		for(var i = 0, len = this.activeArr.length; i<len; i++){
			if(this.nextCell == this.activeArr[i]) 
				return false;
		}
	}
}
