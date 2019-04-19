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
		if(this.openType == 'PropShare'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['share'];
		}else if(this.openType == 'PropAV'){
			this.typeSprite.getComponent(cc.Sprite).spriteFrame = GlobalData.assets['share_video'];
		}
		this.light.runAction(cc.repeatForever(cc.rotateBy(2, 360)));
		this.bgContext.runAction(cc.scaleTo(GlobalData.TimeActionParam.PropSBAScaleTime,1));
		setTimeout(function(){
			self.cancelNode.active = true;
		},1000);
	},
	buttonCb(){
		this.iscallBack = false;
		if(this.openType == "PropShare"){
			var param = {
				type:null,
				arg:null,
				successCallback:this.shareSuccessCb.bind(this),
				failCallback:this.shareFailedCb.bind(this),
				shareName:this.openType,
				isWait:true
			};
			if(GlobalData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}else if(this.openType == "PropAV"){
			console.log(this.openType);
			this.AVSuccessCb = function(arg){
				EventManager.emitLogic({
					type:'PropShareSuccess',
					propKey:'PropBomb',
					startPos:cc.v2(0,0)
				});
			}.bind(this);
			this.AVFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo();
				}else if(arg == 'error'){
					this.openType = "PropShare";
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
						self.buttonCb();
					}else if(res.cancel){}
				}
			});
		}catch(err){}
	},
	//道具个数发生变化
	propFreshNum(prop,propNode){
		if(prop == 'PropFresh'){
			propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GlobalData.GamePropParam.bagNum['PropFresh'];
		}else if(prop == 'PropHammer'){
			if(GlobalData.GamePropParam.bagNum['PropHammer'] > 0){
				propNode.getChildByName("add").active = false;
				propNode.getChildByName("numLabel").active = true;
				propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GlobalData.GamePropParam.bagNum['PropHammer'];
			}else{
				propNode.getChildByName("add").active = true;
				propNode.getChildByName("numLabel").active = false;
			}
		}else if(prop == 'PropBomb'){
			if(GlobalData.GamePropParam.bagNum['PropBomb'] > 0){
				propNode.getChildByName("add").active = false;
				propNode.getChildByName("numLabel").active = true;
				propNode.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GlobalData.GamePropParam.bagNum['PropBomb'];
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
