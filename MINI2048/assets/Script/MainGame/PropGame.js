var WxVideoAd = require('WxVideoAd');
var ThirdAPI = require('ThirdAPI');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		propKey:null,
		openType:null,
		cancelNode:cc.Node,
		bgContext:cc.Node,
		light:cc.Node,
		typeSprite:cc.Node,
		iscallBack:false,
    },
    onLoad () {
		 this.cancelNode.active = false;
		 this.iscallBack = false;
		 this.bgContext.scale = 0.2;
	},
	initLoad(startPos,openType,prop){
		var self = this;
		this.startPos = startPos;
		this.openType = openType;
		this.propKey = prop;
		if(this.openType == 'DJShare'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GData.assets['share'];
		}else if(this.openType == 'DJAV'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GData.assets['share_videw'];
		}
		this.light.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
		this.bgContext.runAction(cc.scaleTo(GData.TimeActionParam.PropSBAScaleTime,1));
		setTimeout(function(){
			self.cancelNode.active = true;
		},1000);
	},
	buttonCb(){
		this.iscallBack = false;
		if(this.openType == "DJShare"){
			var param = {
				type:null,
				arg:null,
				successCallback:this.shareSuccessCb.bind(this),
				failCallback:this.shareFailedCb.bind(this),
				shareName:this.openType,
				isWait:true
			};
			if(GData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}else if(this.openType == "DJAV"){
			console.log(this.openType);
			this.AVSuccessCb = function(arg){
				EventManager.emitLogic({
					type:'PropShareSuccess',
					propKey:'DJBomb',
					startPos:cc.v2(0,0)
				});
			}.bind(this);
			this.AVFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo();
				}else if(arg == 'error'){
					this.openType = "DJShare";
					this.buttonCb();
				}
			}.bind(this);
			WxVideoAd.initCreateReward(this.AVSuccessCb,this.AVFailedCb,this);
		}
	},
	shareSuccessCb(type, shareTicket, arg){
		if(this.iscallBack == false){
			console.log(type, shareTicket, arg);
			EventManager.emitLogic({type:'PropShareSuccess',propKey:this.propKey,startPos:this.startPos});
		}
		this.iscallBack = true;
	},
	shareFailedCb(type,arg){
		if(this.iscallBack == false && this.node.active == true){
			this.showFailInfo();
			console.log(type,arg);
		}
		this.iscallBack = true;
	},
	showFailInfo(){
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
						self.buttonCb();
					}else if(res.cancel){}
				}
			});
		}catch(err){}
	},
	//道具个数发生变化
	propFreshNum(prop,propNode){
		if(prop == 'DJFresh'){
			propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJFresh'];
		}else if(prop == 'DJHammer'){
			if(GData.GamePropParam.bagNum['DJHammer'] > 0){
				propNode.getChildByName("add").active = false;
				propNode.getChildByName("numLabel").active = true;
				propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJHammer'];
			}else{
				propNode.getChildByName("add").active = true;
				propNode.getChildByName("numLabel").active = false;
			}
		}else if(prop == 'DJBomb'){
			if(GData.GamePropParam.bagNum['DJBomb'] > 0){
				propNode.getChildByName("add").active = false;
				propNode.getChildByName("numLabel").active = true;
				propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJBomb'];
			}else{
				propNode.getChildByName("add").active = true;
				propNode.getChildByName("numLabel").active = false;
			}
		}
	},
	cancel(){
		this.node.removeFromParent();
		this.node.destroy();
	}
});
