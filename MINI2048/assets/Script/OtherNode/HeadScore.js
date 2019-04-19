cc.Class({
    extends: cc.Component,

    properties: {
		CurrentScore:cc.Node,
		MaxScore:cc.Node,
		MaxScoreChildNode:cc.Node,
		value:0,
    },
	initData(){
		for(var i = 0;i < this.CurrentScore.children.length;i++){
			var node = this.CurrentScore.children[i];
			node.removeFromParent();
			node.destroy();
		}
		for(var i = 0;i < this.MaxScoreChildNode.children.length;i++){
			var node = this.MaxScoreChildNode.children[i];
			node.removeFromParent();
			node.destroy();
		}
	},
	initCurrentScore(totalScore){
		var numStr = totalScore.toString();
		var deep = 0;
		for(var i = numStr.length - 1;i >= 0;i--){
			let oNum = numStr[i];
			let oneNumNode = this.CurrentScore.children[deep];
			if(oneNumNode == null){
				oneNumNode = this.addOneNum(oNum);
				this.CurrentScore.addChild(oneNumNode);
			}else{
				this.updateOneNum(oneNumNode,oNum);
			}
			deep += 1;
		}
	},
	updateCurrentScore(currentScore,deep){
		var node = this.CurrentScore.children[deep];
		if(node == null){
			node = this.addOneNum(currentScore);
			this.CurrentScore.addChild(node);
		}else{
			var name = node.name;
			var score = parseInt(name) + currentScore;
			var left = score - 10;
			console.log(name,score,left);
			if(left >= 0){
				this.updateOneNum(node,left);
				this.updateCurrentScore(1,deep + 1);
			}else{
				this.updateOneNum(node,score);
			}
		}
	},
	initMaxScore(maxNum){
		var numStr = maxNum.toString();
		for(var i = numStr.length - 1;i >= 0;i--){
			let oNum = numStr[i];
			let oneNumNode = this.addOneNum(oNum);
			this.MaxScoreChildNode.addChild(oneNumNode);
		}
	},
	updateOneNum(node,num){
		node.name = num + '';
		var sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = GlobalData.assets[num];
		return node;
	},
	addOneNum(num){
		var node = new cc.Node(num+'');
		var sprite = node.addComponent(cc.Sprite);
		sprite.spriteFrame = GlobalData.assets[num];
		return node;
	},
	startRollNum(totalScore){
		console.log("startRollNum",totalScore);
		var goNum = totalScore / GlobalData.TimeActionParam.NumRollCell;
		var goTimeCell = GlobalData.TimeActionParam.NumRollTime / goNum;
		console.log("startRollNum",totalScore,goNum);
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
			self.updateCurrentScore(GlobalData.TimeActionParam.NumRollCell,0);
		},time * 1000);
	}
    // update (dt) {},
});
