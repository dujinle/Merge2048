var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		//演示动画节点
		handleNode:cc.Node,
		bombNode:cc.Node,
		numItemNode:cc.Node,
		eliminateNode1:cc.Node,
		eliminateNode2:cc.Node,
		eliminateNode3:cc.Node,
		numNodes:{
			type:cc.Node,
			default:[]
		}
    },
	onLoad(){
		var self = this;
		this.eliminateNode1.runAction(cc.fadeOut());
		this.eliminateNode2.runAction(cc.fadeOut());
		this.eliminateNode3.runAction(cc.fadeOut());
		for(var i = 0;i < this.numNodes.length;i++){
			this.numNodes[i].active = true;
		}
	},
	touchCB(event){
		EventManager.emitPress({type:'HammerTouch',pos:event.currentTouch.getLocation()});
	},
	start(){
		this.node.active = true;
		//this.onStart();
	},
	show(){
		this.node.active = true;
		var self = this;
		this.startEffect(function(){
			self.startEffect(function(){
				/*
				self.node.stopAllActions();
				self.node.removeFromParent();
				self.node.destroy();
				*/
			});
		});
	},
	cancleButtonCb(event){
		EventManager.emitPress({'type':'BombCancle'});
	},
    startEffect(callback){
		this.bombNode.runAction(cc.fadeIn());
		for(var i = 0;i < this.numNodes.length;i++){
			this.numNodes[i].active = true;
		}
		this.handleEffect(callback);
	},
	handleEffect(callback){
		var self = this;
		this.handlePos = this.handleNode.getPosition();
		this.bombNode.setPosition(this.handlePos);
		var handleSize = this.handleNode.getContentSize();
		var endPos = this.numItemNode.getPosition();
		var moveToNode = cc.moveTo(0.5,cc.v2(endPos.x,endPos.y + 5));
		var bombMove = cc.moveTo(0.5,endPos);
		var callFunc = cc.callFunc(function(){
			self.node.stopAllActions();
			self.handleNode.setPosition(self.handlePos);
			self.handleNode.runAction(cc.fadeIn(0));
			self.BombEffect(callback);
		},this);
		this.handleNode.runAction(cc.sequence(moveToNode,cc.fadeOut(0.2),callFunc));
		this.bombNode.runAction(bombMove)
	},
	BombEffect(callback){
		var self = this;
		var scaleBig1 = cc.scaleTo(0.3,2);
		var scaleNormal = cc.scaleTo(0,1);
		var eliminateAction = cc.callFunc(function(){
			self.bombNode.runAction(cc.fadeOut(0.1));
			self.eliminateNode1.runAction(cc.sequence(cc.fadeIn(),scaleBig1.clone(),cc.fadeOut(0.1),scaleNormal));
			self.eliminateNode2.runAction(cc.sequence(cc.delayTime(0.2),cc.fadeIn(),scaleBig1.clone(),cc.fadeOut(0.1),scaleNormal));
			self.eliminateNode3.runAction(cc.sequence(cc.delayTime(0.4),cc.fadeIn(),scaleBig1.clone(),cc.fadeOut(0.1),scaleNormal));
		},this);
		var numAction = cc.callFunc(function(){
			for(var i = 0;i < self.numNodes.length;i++){
				self.numNodes[i].active = false;
			}
		},this);
		var actionEnd = cc.callFunc(function(){
			console.log(self.eliminateNode3.getNumberOfRunningActions());
			console.log(self.eliminateNode2.getNumberOfRunningActions());
			console.log(self.eliminateNode1.getNumberOfRunningActions());
			callback();
		},this);
		this.node.runAction(cc.sequence(eliminateAction,cc.delayTime(0.9),numAction,cc.delayTime(0.2),actionEnd));
	},
	bombOneNum(itemNode,callback){
		var endPos = itemNode.getPosition();
		this.bombRealNode.active = true;
		var bombSize = this.bombRealNode.getContentSize();
		this.bombRealNode.setPosition(cc.v2(endPos.x + bombSize.width,endPos.y - 100));
		
		this.bombPos = this.bombRealNode.getPosition();
		
		
		var moveToNode = cc.moveTo(0.5,cc.v2(endPos.x + bombSize.width,endPos.y + 10));
		var pressAction = cc.sequence(cc.rotateTo(0.2,-30),cc.rotateTo(0.2,0));
		var moveShow = cc.spawn(moveToNode,cc.fadeIn(0.5));
		var moveHide = cc.spawn(cc.moveTo(0.5,this.bombPos),cc.fadeOut(0.5));
		
		var callFunc = cc.callFunc(function(){
			itemNode.runAction(cc.fadeOut(0.2));
		},this);
		var actionEnd = cc.callFunc(function(){
			callback();
		},this);
		this.bombRealNode.runAction(cc.sequence(moveShow,pressAction,callFunc,moveHide,actionEnd));
	}
});
