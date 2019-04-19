var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
			pauseBg:cc.Node,
			gotoHomeButton:cc.Node,
			returnGame:cc.Node,
			innerChainNode:cc.Node,
			soundOnNode:cc.Node,
			soundOffNode:cc.Node,
    },

    onLoad () {
	},
	//继续游戏按钮回调
	onContinueCb(event){
		EventManager.emitLogic({type:'PauseContinue'});
	},
	//重新开始按钮回调
	onGoHomeCb(event){
		EventManager.emitLogic({type:'PauseGoHome'});
	},
	initInnerChain(time){
		var self = this;
		this.innerChainNode.active = false;
		if(GlobalData.cdnPropParam.PropUnLock.PropLocker <= GlobalData.gameRunTimeParam.juNum){
			this.innerChainNode.getComponent('ScrollLinkGame').createAllLinkGame(GlobalData.cdnOtherGameDoor.locker);
			this.node.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(function(){
				self.innerChainNode.active = true;
			})));
		}
	},
	show(){
		console.log("showPause game board show");
		if(GlobalData.AudioSupport == false){
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}else{
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
		}
		this.node.active = true;
		this.pauseBg.scale = 0;
		var pauseBgScale = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,1);
		this.pauseBg.runAction(pauseBgScale);
		this.initInnerChain(GlobalData.TimeActionParam.PauseGameMoveTime);
	},
	hidePause(callBack = null){
		var self = this;
		console.log("start game board hide");
		var pauseBgScale = cc.scaleTo(GlobalData.TimeActionParam.PauseGameMoveTime,0.2);
		this.pauseBg.runAction(pauseBgScale);
		var hideAction = cc.callFunc(function(){
			if(callBack != null){
				callBack();
			}
		},this);
		
		this.node.runAction(cc.sequence(
			cc.delayTime(GlobalData.TimeActionParam.PauseGameMoveTime),
			hideAction
		));
	},
	pauseRestart(){
		EventManager.emitLogic({type:'PauseRestart'});
	},
	pauseSound(){
		if(GlobalData.AudioSupport == false){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
			GlobalData.AudioSupport = true;
		}else{
			GlobalData.AudioSupport = false;
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
	}
    // update (dt) {},
});
