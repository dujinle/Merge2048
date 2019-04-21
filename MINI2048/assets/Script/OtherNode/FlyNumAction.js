cc.Class({
    extends: cc.Component,

    properties: {
		numLabel:cc.Node,
    },
	startFlyOnce(idx,keyNum,addScore,cb){
		if(idx == 0){
			this.numLabel.getComponent(cc.Label).string = addScore + "";
		}else{
			this.numLabel.getComponent(cc.Label).string = addScore + "x" + (idx + 1);
		}
		this.numLabel.color = this.numLabel.color.fromHEX(GData.flyNumColors[keyNum]);//cc.hexToColor(GData.flyNumColors[keyNum]);
		this.node.scale = 0.5;
		var pos = this.node.getPosition();
        var bigAction = cc.scaleTo(0.2, 1);
        var moveAction = cc.moveTo(0.4, cc.v2(pos.x, pos.y + 96));
		var finish = cc.callFunc(function(){
			if(cb != null){
				cb();
			}
		},this);
        this.node.runAction(cc.sequence(cc.fadeIn(),bigAction, moveAction,cc.fadeOut(),finish));
	}
});
