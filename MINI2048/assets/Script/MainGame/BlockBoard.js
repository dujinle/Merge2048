cc.Class({
    extends: cc.Component,

    properties: {
        shadowSprite:cc.Node,
    },
	onLoad(){
		this.shadowSprite.active = false;
	},
	shadowShow(type){
		this.shadowSprite.active = type;
	}
});
