cc.Class({
    extends: cc.Component,

    properties: {
		label:cc.Node,
		getType:null,
		propType:"",
		logo:cc.Node,
		addSprite:cc.Node,
    },
    // LIFE-CYCLE CALLBACKS:
    onLoad () {},
	onShow(flag){
		this.node.active = flag;
		if(flag == true){
			
		}
	},
    start () {

    },

    // update (dt) {},
});
