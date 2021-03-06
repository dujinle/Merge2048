var ThirdAPI = require('ThirdAPI');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		rankSprite:cc.Node,
		isDraw:false,
		scoreLabel:cc.Node,
		maxScoreLabel:cc.Node,
		upLabel:cc.Node,
		openSprite:cc.Node,
		//innerChainNode:cc.Node,
    },
    onLoad () {
		console.log("finish game board load");
	},
	start(){
		/*
		try{
			this.texture = new cc.Texture2D();
			var openDataContext = wx.getOpenDataContext();
			this.sharedCanvas = openDataContext.canvas;
		}catch(error){}
		*/
	},
	initInnerChain(time){
		var self = this;
		this.innerChainNode.active = false;
		if(GData.cdnPropParam.PropUnLock.PropLocker <= GData.GRunTimeParam.juNum){
			this.innerChainNode.getComponent('ScrollLinkGame').createAllLinkGame(GData.cdnOtherGameDoor.locker);
			this.node.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(function(){
				self.innerChainNode.active = true;
			})));
		}
	},
	showInnerChain(){
		this.innerChainNode.getComponent('ScrollLinkGame').playScrollLinkGame(true);
	},
	show(){
		console.log("finish game show");
		this.scoreLabel.getComponent(cc.Label).string = GData.GRunTimeParam.totalScore;
		this.maxScoreLabel.getComponent(cc.Label).string = GData.GRunTimeParam.maxScore;
		//this.isDraw = true;
		//this.initInnerChain(0);
		//this.node.active = true;
		/*
		var param = {
			type:'gameOverUIRank'
		};
		ThirdAPI.getRank(param);
		*/
	},
	hide(){
		this.isDraw = false;
		this.node.active = false;
	},
	rankButtonCb(){
		EventManager.emit({type:'RankView'});
	},
	restartButtonCb(){
		EventManager.emitLogic({type:'FinishRestart'});
	},
	goHomeButtonCb(){
		EventManager.emitLogic({type:'FinishGoHome'});
	},
	shareToFriends(){
		var param = {
			type:null,
			arg:null,
			successCallback:this.shareSuccessCb.bind(this),
			failCallback:this.shareFailedCb.bind(this),
			shareName:'分享你的战绩',
			isWait:false
		};
		ThirdAPI.shareGame(param);
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
	rankSuccessCb(){
		if(!this.texture){
			return;
		}
		this.texture.initWithElement(this.sharedCanvas);
		this.texture.handleLoadedTexture();
		this.rankSprite.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.texture);
	},
	update(){
		//console.log("update finish game");
		if(this.isDraw == true){
			this.rankSuccessCb();
		}
	}
});
