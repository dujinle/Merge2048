var ThirdAPI = require('ThirdAPI');
cc.Class({
    extends: cc.Component,

    properties: {
		isDraw:false,
		time:0,
    },
	start(){
		try{
			this.texture = new cc.Texture2D();
			var openDataContext = wx.getOpenDataContext();
			this.sharedCanvas = openDataContext.canvas;
		}catch(error){}
	},
	onStart(){
		this.node.active = true;
		this.isDraw = true;
	},
	onStop(){
		this.isDraw = false;
	},
	show(){
		var params = {
			type:'battleUIRank',
			score:GData.GRunTimeParam.totalScore
		};
		ThirdAPI.getRank(params);
	},
	hide(){
		this.isDraw = false;
		this.node.active = false;
	},
	rankSuccessCb(){
		if(!this.texture){
			return;
		}
		this.texture.initWithElement(this.sharedCanvas);
		this.texture.handleLoadedTexture();
		this.node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(this.texture);
	},
	update(dt){
		this.time += dt;
		if(this.time < 1){
			return;
		}
		this.time = 0;
		//console.log("update finish game");
		if(this.isDraw == true){
			this.rankSuccessCb();
		}
	}
});
