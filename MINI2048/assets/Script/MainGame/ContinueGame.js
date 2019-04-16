var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		tipLabel:cc.Node,
    },

    onLoad () {
		 this.node.scale = 0.5;
	},
	//继续游戏按钮回调
	onContinueCb(event){
		EventManager.emit({type:'ContinueGame'});
	},
	//重新开始按钮回调
	onResetCb(event){
		EventManager.emit({type:'ResetGame'});
	},
	onClose(event){
		this.node.removeFromParent();
		this.node.destroy();
	},
	show(){
		this.node.runAction(cc.scaleTo(0.2,1));
	},
	hideBoard(){
		this.node.removeFromParent();
		this.node.destroy();
	}
});
