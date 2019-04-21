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
		this.value = 0;
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
		this.value = totalScore;
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
		if(node.name == num){
			return;
		}
		node.name = num + '';
		var sprite = node.getComponent(cc.Sprite);
		sprite.spriteFrame = GData.assets[num];
		return node;
	},
	addOneNum(num){
		var node = new cc.Node(num+'');
		var sprite = node.addComponent(cc.Sprite);
		sprite.spriteFrame = GData.assets[num];
		return node;
	},
	startRollNum(totalScore){
		console.log("startRollNum",totalScore);
		var numRollCell = GData.TimeActionParam.NumRollCell;
		/*
		if(totalScore <= 32){
			numRollCell = Math.pow(numRollCell,1);
		}else if(totalScore <= 64){
			numRollCell = Math.pow(numRollCell,2);
		}else if(totalScore <= 128){
			numRollCell = Math.pow(numRollCell,3);
		}else if(totalScore <= 256){
			numRollCell = Math.pow(numRollCell,4);
		}else if(totalScore <= 512){
			numRollCell = Math.pow(numRollCell,5);
		}else if(totalScore <= 1024){
			numRollCell = Math.pow(numRollCell,6);
		}else if(totalScore <= 2048){
			numRollCell = Math.pow(numRollCell,7);
		}else{
			numRollCell = Math.pow(numRollCell,8);
		}
		*/
		//if(totalScore % numRollCell == 0){
			var goNum = totalScore / numRollCell;
			var goTimeCell = GData.TimeActionParam.NumRollTime / goNum;
			console.log("startRollNum",totalScore,numRollCell,goNum,goTimeCell);
			for(var i = 0;i < totalScore;i = i + numRollCell){
				var delay = (i / 2) * goTimeCell;
				//console.log("delay time",delay);
				this.addAction(numRollCell,delay);
			}
		//}
		/*
		else{
			var left = totalScore % numRollCell;
			var secondCell = numRollCell / 2;
			while(true){
				if(left % secondCell == 0){
					break;
				}else{
					secondCell = secondCell / 2;
				}
				if(secondCell < 1){
					secondCell = 1;
					break;
				}
			}
			var firstScore = totalScore - left;
			var goNum = firstScore / numRollCell;
			var goTimeCell = GData.TimeActionParam.NumRollTime / goNum;
			console.log("startRollNum",firstScore,numRollCell,goNum,goTimeCell);
			for(var i = 0;i < totalScore;i = i + numRollCell){
				var delay = (i / 2) * goTimeCell;
				this.addAction(numRollCell,delay);
			}
			console.log("startRollNum",left,secondCell,goNum,goTimeCell);
			for(var i = 0;i < left;i = i + secondCell){
				this.addAction(secondCell,0);
			}
		}
		*/
	},
	addAction(cell,time){
		var self = this;
		setTimeout(function(){
			//console.log("deal time");
			self.value += cell;
			self.updateCurrentScore(cell,0);
			//self.updateCurrentScore();
		},time * 1000);
	}
    // update (dt) {},
});
