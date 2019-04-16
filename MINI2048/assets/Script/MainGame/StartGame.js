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
    },
	onLoad(){
	},
	refreshGame(){
		this.initInnerChain(0);
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['PropBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['StartMenu']){
			this.buttonLayout.active = true;
		}else{
			this.buttonLayout.active = false;
		}
	},
	initInnerChain(time){
		var self = this;
		this.innerChain.active = false;
		if(GlobalData.cdnPropParam.PropUnLock['PropLocker'] <= GlobalData.gameRunTimeParam.juNum){
			this.innerChain.getComponent('ScrollLinkGame').createAllLinkGame(GlobalData.cdnOtherGameDoor.locker);
			this.node.runAction(cc.sequence(cc.delayTime(time),cc.callFunc(function(){
				self.innerChain.active = true;
			})));
		}
		this.oneInner.active = false;
		if(GlobalData.cdnPropParam.PropUnLock['PropInner'] <= GlobalData.gameRunTimeParam.juNum){
			this.oneInner.active = true;
			this.oneInner.getComponent('LockerItem').setLinkGame(GlobalData.cdnOtherGameDoor.InnerChain);
		}
	},
	shareButtonCb(){
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
		if(GlobalData.AudioSupport == false){
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
			GlobalData.AudioSupport = true;
		}else{
			GlobalData.AudioSupport = false;
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}
	},
	rankButtonCb(){
		EventManager.emit({type:'RankView'});
	},
	startButtonCb(){
		EventManager.emit({type:'StartGame'});
	},
	shareSuccessCb(type, shareTicket, arg){
		console.log(type, shareTicket, arg);
	},
	shareFailedCb(type,arg){
		console.log(type,arg);
	},
	battleButtonCb(event){
		if(this.openType == null){
			this.openType = PropManager.getShareOrADKey('PropBattle');
		}
		if(this.openType == 'PropShare'){
			this.isShareCallBack = false;
			var param = {
				type:null,
				arg:null,
				successCallback:this.sharePropSuccessCb.bind(this),
				failCallback:this.sharePropFailedCb.bind(this),
				shareName:this.openType,
				isWait:true
			};
			if(GlobalData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}
		else if(this.openType == 'PropAV'){
			this.AVSuccessCb = function(arg){
				EventManager.emit({
					type:'StartBattleSuccess',
					propKey:'PropBomb',
					startPos:cc.v2(0,0)
				});
			}.bind(this);
			this.AVFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo();
				}else if(arg == 'error'){
					this.openType = "PropShare";
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
			propKey:'PropBomb',
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
			if(this.openType == 'PropAV'){
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
	showStart(){
		console.log("start game board show");
		this.openType = null;
		if(GlobalData.AudioSupport == false){
			this.soundOnNode.active = false;
			this.soundOffNode.active = true;
		}else{
			this.soundOnNode.active = true;
			this.soundOffNode.active = false;
		}
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['PropBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['StartMenu']){
			this.buttonLayout.active = true;
		}else{
			this.buttonLayout.active = false;
		}
		if(this.gameStart == false){
			this.node.active = true;
			this.scoreLabel.active = true;
			this.kingSprite.active = true;
			this.scoreLabel.getComponent(cc.Label).string = GlobalData.gameRunTimeParam.maxScore;
			var winSize = this.node.getContentSize();
			//logo 效果设置
			this.logoPos = this.gameLogo.getPosition();
			var logoSize = this.gameLogo.getContentSize();
			var logoY = winSize.height/2 + logoSize.height/2;
			this.gameLogo.setPosition(cc.v2(this.logoPos.x,logoY));
			var logoMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.logoPos);
			this.gameLogo.runAction(logoMoveTo);
			//开始效果设置
			this.startPos = this.startButton.getPosition();
			var startSize = this.startButton.getContentSize();
			var startX = (startSize.width/2 + winSize.width/2) * -1;
			this.startButton.setPosition(cc.v2(startX,this.startPos.y));
			var startMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.startPos);
			this.startButton.runAction(startMoveTo);
			
			//挑战效果设置
			this.battlePos = this.battleButton.getPosition();
			if(this.battleButton.active == true){
				var battleSize = this.battleButton.getContentSize();
				var battleX = (battleSize.width/2 + winSize.width/2);
				this.battleButton.setPosition(cc.v2(battleX,this.battlePos.y));
				var battleMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.battlePos);
				this.battleButton.runAction(battleMoveTo);
			}
			//分享，排行，声音效果设置
			this.layoutPos = this.buttonLayout.getPosition();
			if(this.buttonLayout.active == true){
				var layoutSize = this.buttonLayout.getContentSize();
				var layoutY = (winSize.height/2 + logoSize.height/2) * -1;
				this.buttonLayout.setPosition(cc.v2(this.layoutPos.x,layoutY));
				var layoutMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.layoutPos);
				this.buttonLayout.runAction(layoutMoveTo);
			}
			this.gameStart = true;
			this.initInnerChain(GlobalData.TimeActionParam.StartGameMoveTime);
		}else{
			this.node.active = true;
			this.scoreLabel.active = true;
			this.kingSprite.active = true;
			this.scoreLabel.getComponent(cc.Label).string = GlobalData.gameRunTimeParam.maxScore;
			//logo 效果设置
			var logoMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.logoPos);
			this.gameLogo.runAction(logoMoveTo);
			//开始效果设置
			var startMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.startPos);
			this.startButton.runAction(startMoveTo);
			//挑战效果设置
			if(this.battleButton.active == true){
				var battleMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.battlePos);
				this.battleButton.runAction(battleMoveTo);
			}
			//分享，排行，声音效果设置
			if(this.buttonLayout.active == true){
				var layoutMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,this.layoutPos);
				this.buttonLayout.runAction(layoutMoveTo);
			}
			this.initInnerChain(GlobalData.TimeActionParam.StartGameMoveTime);
		}
	},
	hideStaticStart(callBack){
		var self = this;
		//this.node.active = false;
		console.log("start game board hide");
		var winSize = this.node.getContentSize();
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['PropBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		//logo 效果设置
		var logoPos = this.gameLogo.getPosition();
		var logoSize = this.gameLogo.getContentSize();
		var logoY = winSize.height/2 + logoSize.height/2;
		this.gameLogo.setPosition(cc.v2(logoPos.x,logoY));
		//开始效果设置
		var startPos = this.startButton.getPosition();
		var startSize = this.startButton.getContentSize();
		var startX = (startSize.width/2 + winSize.width/2) * -1;
		this.startButton.setPosition(cc.v2(startX,startPos.y));
		//挑战效果设置
		var battlePos = this.battleButton.getPosition();
		var battleSize = this.battleButton.getContentSize();
		var battleX = (battleSize.width/2 + winSize.width/2);
		this.battleButton.setPosition(cc.v2(battleX,battlePos.y));

		//分享，排行，声音效果设置
		var layoutPos = this.buttonLayout.getPosition();
		var layoutSize = this.buttonLayout.getContentSize();
		var layoutY = (winSize.height/2 + logoSize.height/2) * -1;
		this.buttonLayout.setPosition(cc.v2(layoutPos.x,layoutY));
		
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
		if(GlobalData.gameRunTimeParam.juNum >= GlobalData.cdnPropParam.PropUnLock['PropBattle']){
			this.battleButton.active = true;
		}else{
			this.battleButton.active = false;
		}
		//logo 效果设置
		var logoPos = this.gameLogo.getPosition();
		var logoSize = this.gameLogo.getContentSize();
		var logoY = winSize.height/2 + logoSize.height/2;
		var logoMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,cc.v2(logoPos.x,logoY));
		this.gameLogo.runAction(logoMoveTo);
		//开始效果设置
		var startPos = this.startButton.getPosition();
		var startSize = this.startButton.getContentSize();
		var startX = (startSize.width/2 + winSize.width/2) * -1;
		var startMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,cc.v2(startX,startPos.y));
		this.startButton.runAction(startMoveTo);
		//挑战效果设置
		if(this.battleButton.active == true){
			var battlePos = this.battleButton.getPosition();
			var battleSize = this.battleButton.getContentSize();
			var battleX = (battleSize.width/2 + winSize.width/2);
			var battleMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,cc.v2(battleX,battlePos.y));
			this.battleButton.runAction(battleMoveTo);
		}
		//分享，排行，声音效果设置
		if(this.buttonLayout.active == true){
			var layoutPos = this.buttonLayout.getPosition();
			var layoutSize = this.buttonLayout.getContentSize();
			var layoutY = (winSize.height/2 + logoSize.height/2) * -1;
			var layoutMoveTo = cc.moveTo(GlobalData.TimeActionParam.StartGameMoveTime,cc.v2(layoutPos.x,layoutY));
			this.buttonLayout.runAction(layoutMoveTo);
		}
		var hideAction = cc.callFunc(function(){
			self.scoreLabel.active = false;
			self.kingSprite.active = false;
			self.node.active = false;
			callBack();
		},this);
		if(this.node.active == true){
			this.node.runAction(cc.sequence(
				cc.delayTime(GlobalData.TimeActionParam.StartGameMoveTime),
				hideAction
			));
		}else{
			callBack();
		}
	},
});
