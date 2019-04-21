var ThirdAPI = require('ThirdAPI');
var PropManager = require('PropManager');
var WxVideoAd = require('WxVideoAd');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		startButton:cc.Node,
		battleButton:cc.Node,
		gameLogo:cc.Node,
		buttonLayout:cc.Node,
		scoreLabel:cc.Node,
		kingSprite:cc.Node,
		gameStart:false,
		soundOnNode:cc.Node,
		soundOffNode:cc.Node,
		innerChain:cc.Node,
		oneInner:cc.Node,
		voiceManager:null,
    },
	onLoad(){
		this.nodePosChange = {};
		this.battleButton.getComponent(cc.Button).interactable = false;
		this.startButton.getComponent(cc.Button).interactable = false;
		for(var i = 0;i < this.buttonLayout.children.length;i++){
			var nodeButton = this.buttonLayout.children[i];
			nodeButton.getComponent(cc.Button).interactable = false;
		}
	},
	refreshGame(){
		this.initInnerChain(0);
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['DJBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['StartMenu']){
			this.buttonLayout.active = true;
		}else{
			this.buttonLayout.active = false;
		}
	},
	initInnerChain(time){
		var self = this;
		this.innerChain.active = false;
		if(GData.cdnPropParam.PropUnLock['PropLocker'] <= GData.GRunTimeParam.juNum){
			this.innerChain.getComponent('ScrollLinkGame').createAllLinkGame(GData.cdnOtherGameDoor.locker);
			this.node.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(function(){
				self.innerChain.active = true;
			})));
		}
		this.oneInner.active = false;
		if(GData.cdnPropParam.PropUnLock['PropInner'] <= GData.GRunTimeParam.juNum){
			this.oneInner.active = true;
			this.oneInner.getComponent('LockerItem').setLinkGame(GData.cdnOtherGameDoor.InnerChain);
		}
	},
	finishLoad(voiceManager){
		this.voiceManager = voiceManager;
		this.battleButton.getComponent(cc.Button).interactable = true;
		this.startButton.getComponent(cc.Button).interactable = true;
		for(var i = 0;i < this.buttonLayout.children.length;i++){
			var nodeButton = this.buttonLayout.children[i];
			nodeButton.getComponent(cc.Button).interactable = true;
		}
	},
	shareButtonCb(){
		if(this.voiceManager != null){
			this.voiceManager.getComponent("AudioManager").play(GData.AudioParam.AudioButton);
		}
		var param = {
			type:null,
			arg:null,
			successCallback:this.shareSuccessCb.bind(this),
			failCallback:this.shareFailedCb.bind(this),
			shareName:'啊啊啊',
			isWait:false
		};
		ThirdAPI.shareGame(param);
	},
	soundButtonCb(){
		if(GData.AudioSupport == false){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
			GData.AudioSupport = true;
		}else{
			if(this.voiceManager != null){
				this.voiceManager.getComponent("AudioManager").play(GData.AudioParam.AudioButton);
			}
			GData.AudioSupport = false;
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
	},
	rankButtonCb(){
		EventManager.emit({type:'RankView'});
	},
	startButtonCb(){
		EventManager.emitLogic({type:'StartGame'});
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
	battleButtonCb(event){
		if(this.openType == null){
			this.openType = PropManager.getShareOrADKey('DJBattle');
		}
		if(this.openType == 'DJShare'){
			this.isShareCallBack = false;
			var param = {
				type:null,
				arg:null,
				successCallback:this.sharePropSuccessCb.bind(this),
				failCallback:this.sharePropFailedCb.bind(this),
				shareName:this.openType,
				isWait:true
			};
			if(GData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}
		else if(this.openType == 'DJAV'){
			this.AVSuccessCb = function(arg){
				EventManager.emit({
					type:'StartBattleSuccess',
					propKey:'DJBomb',
					startPos:cc.v2(0,0)
				});
			}.bind(this);
			this.AVFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo();
				}else if(arg == 'error'){
					this.openType = "DJShare";
					this.battleButtonCb(null);
				}
			}.bind(this);
			WxVideoAd.initCreateReward(this.AVSuccessCb,this.AVFailedCb,null);
		}
	},
	sharePropSuccessCb(type, shareTicket, arg){
		this.isShareCallBack = true;
		EventManager.emit({
			type:'StartBattleSuccess',
			propKey:'DJBomb',
			startPos:cc.v2(0,0)
		});
	},
	sharePropFailedCb(type,arg){
		if(this.isShareCallBack == false){
			this.showFailInfo(null);
		}
		this.isShareCallBack = true;
	},
	showFailInfo(msg){
		try{
			var self = this;
			var content = '请分享到不同的群获得更多的好友帮助!';
			if(this.openType == 'DJAV'){
				content = '看完视频才能获得奖励，请再看一次!';
			}
			wx.showModal({
				title:'提示',
				content:content,
				cancelText:'取消',
				confirmText:'确定',
				confirmColor:'#53679c',
				success(res){
					if (res.confirm) {
						self.battleButtonCb(null);
					}else if(res.cancel){}
				}
			});
		}catch(err){}
	},
	slideIn(node,type){
		//支持节点动作滑入 type 指定方向上下左右
		var originPos = node.getPosition();
		var winSize = this.node.getContentSize();
		var nodeSize = node.getContentSize();
		if(type == 'UP'){
			var yy = winSize.height/2 + nodeSize.height/2;
			node.setPosition(cc.v2(originPos.x,yy));
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,originPos);
			node.runAction(moveTo);
		}else if(type == 'DOWN'){
			var yy = (winSize.height/2 + nodeSize.height/2) * -1;
			node.setPosition(cc.v2(originPos.x,yy));
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,originPos);
			node.runAction(moveTo);
		}else if(type == 'LEFT'){
			var xx = (winSize.width/2 + nodeSize.width/2) * -1;
			node.setPosition(cc.v2(xx,originPos.y));
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,originPos);
			node.runAction(moveTo);
		}else if(type == 'RIGHT'){
			var xx = winSize.width/2 + nodeSize.width/2;
			node.setPosition(cc.v2(xx,originPos.y));
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,originPos);
			node.runAction(moveTo);
		}
		this.nodePosChange[node.uuid] = [node,originPos];
	},
	slideOut(node,type){
		//支持节点动作滑出 type 指定方向上下左右
		var originPos = node.getPosition();
		var winSize = this.node.getContentSize();
		var nodeSize = node.getContentSize();
		if(this.nodePosChange[node.uuid] != null){
			var nodeInfo = this.nodePosChange[node.uuid];
			node.setPosition(nodeInfo[1]);
			originPos = node.getPosition();
		}
		if(type == 'UP'){
			var yy = winSize.height/2 + nodeSize.height/2;
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,cc.v2(originPos.x,yy));
			node.runAction(moveTo);
		}else if(type == 'DOWN'){
			var yy = (winSize.height/2 + nodeSize.height/2) * -1;
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,cc.v2(originPos.x,yy));
			node.runAction(moveTo);
		}else if(type == 'LEFT'){
			var xx = (winSize.width/2 + nodeSize.width/2) * -1;
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,cc.v2(xx,originPos.y));
			node.runAction(moveTo);
		}else if(type == 'RIGHT'){
			var xx = winSize.width/2 + nodeSize.width/2;
			var moveTo = cc.moveTo(GData.TimeActionParam.StartGameMoveTime,cc.v2(xx,originPos.y));
			node.runAction(moveTo);
		}
	},
	resetPos(){
		for(var key in this.nodePosChange){
			var nodeInfo = this.nodePosChange[key];
			nodeInfo[0].setPosition(nodeInfo[1]);
		}
	},
	showStart(){
		console.log("start game board show");
		this.node.active = true;
		this.openType = null;
		
		if(GData.AudioSupport == false){
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}else{
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
		}
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['DJBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['StartMenu']){
			this.buttonLayout.active = true;
		}else{
			this.buttonLayout.active = false;
		}
		this.scoreLabel.active = true;
		this.kingSprite.active = true;
		this.scoreLabel.getComponent(cc.Label).string = GData.GRunTimeParam.maxScore;
		this.slideIn(this.gameLogo,'UP');
		this.slideIn(this.startButton,'LEFT');
		if(this.battleButton.active == true){
			this.slideIn(this.battleButton,'RIGHT');
		}
		//分享，排行，声音效果设置
		if(this.buttonLayout.active == true){
			this.slideIn(this.buttonLayout,'DOWN');
		}
		this.initInnerChain(GData.TimeActionParam.StartGameMoveTime);
	},
	hideStaticStart(callBack){
		var self = this;
		//this.node.active = false;
		console.log("start game board hide");
		var winSize = this.node.getContentSize();
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['DJBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		var hideAction = cc.callFunc(function(){
			self.scoreLabel.active = false;
			self.kingSprite.active = false;
			self.node.active = false;
			callBack();
		},this);
		if(this.node.active != false){
			this.node.runAction(hideAction);
		}else{
			callBack();
		}
	},
	hideStart(callBack){
		var self = this;
		console.log("start game board hide");
		var winSize = this.node.getContentSize();
		if(GData.GRunTimeParam.juNum >= GData.cdnPropParam.PropUnLock['DJBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		//logo 效果设置
		this.slideOut(this.gameLogo,'UP');
		//开始效果设置
		this.slideOut(this.startButton,'LEFT');
		//挑战效果设置
		if(this.battleButton.active == true){
			this.slideOut(this.battleButton,'RIGHT');
		}
		//分享，排行，声音效果设置
		if(this.buttonLayout.active == true){
			this.slideOut(this.buttonLayout,'DOWN');
		}
		var hideAction = cc.callFunc(function(){
			self.scoreLabel.active = false;
			self.kingSprite.active = false;
			self.node.active = false;
			self.resetPos();
			callBack();
		},this);
		if(this.node.active == true){
			this.node.runAction(cc.sequence(
				cc.delayTime(GData.TimeActionParam.StartGameMoveTime),
				hideAction
			));
		}else{
			this.resetPos();
			callBack();
		}
	},
});
