cc.Class({
    extends: cc.Component,

    properties: {
		value:0,
		addValue:0,
    },
	startRollNum(totalScore){
		console.log("startRollNum",totalScore);
		var goNum = totalScore / GlobalData.TimeActionParam.NumRollCell;
		var goTimeCell = GlobalData.TimeActionParam.NumRollTime / goNum;
		for(var i = 0;i < totalScore;i = i + GlobalData.TimeActionParam.NumRollCell){
			var delay = (i / 2) * goTimeCell;
			//console.log("delay time",delay);
			this.addAction(delay);
		}
	},
	addAction(time){
		var self = this;
		setTimeout(function(){
			//console.log("deal time");
			self.value += GlobalData.TimeActionParam.NumRollCell;
			self.node.getComponent(cc.Label).string = self.value;
		},time * 1000);
	}
});
