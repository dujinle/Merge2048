cc.Class({
    extends: cc.Component,

    properties: {
		guideNode:cc.Node,
    },
    onLoad () {
		var self = this;
		this.node.on(cc.Node.EventType.TOUCH_START,this.hideGuide,this);
		this.guideNode.active = false;
	},
	showGuide(startPos,endPos){
		var self = this;
		this.guideNode.setPosition(startPos);
		this.guideNode.active = true;
		var callFunc = cc.callFunc(function(){
			self.guideNode.setPosition(startPos);
		});
		var moveEnd = cc.moveTo(GlobalData.TimeActionParam.GuideMoveTime,endPos);
		var repeat = cc.repeatForever(cc.sequence(moveEnd,callFunc));
		this.guideNode.runAction(repeat);
	},
	hideGuide(){
		this.node.off(cc.Node.EventType.TOUCH_START,this.hideGuide,this);
		this.guideNode.stopAllActions();
		this.node.removeFromParent();
		this.node.destroy();
	}
});
