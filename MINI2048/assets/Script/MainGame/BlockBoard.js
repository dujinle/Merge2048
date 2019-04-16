cc.Class({
    extends: cc.Component,

    properties: {
        shadowSprite:cc.Node,
		bgSprite:cc.Node,
    },
	shadowShow(type){
		this.shadowSprite.active = type;
	}
});
