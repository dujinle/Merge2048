var ThirdAPI = require('ThirdAPI');
var util = require('util');
var PropManager = require('PropManager');
var WxBannerAd = require('WxBannerAd');
var WxVideoAd = require('WxVideoAd');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		//按钮接收参数
		pauseButton:cc.Node,
		//道具参数
		battleNode:cc.Node,
		propBox:cc.Node,
		gamePropFresh:cc.Node,
		gamePropBomb:cc.Node,
		gamePropClear:cc.Node,
		//head 参数
		headNode:cc.Node,
		
		//面板接受参数
		blocksBoard:cc.Node,
		blockBoard:cc.Node,

		//其他参数
		voiceManager:null,
		touchMoveTF:false,
		exitType:false,
    },
    onLoad () {
		this.propConfig = {
			'DJFresh':'',
			'DJHammer':'',
			'DJBomb':''
		};
		this.exitType = false;
	},

	exitGame(flag){
		this.battleNode.getComponent('BattleNode').hide();
		this.clearGame();
		this.initLoad();
		GData.GRunTimeParam.gameStatus = 0;
		this.exitType = flag;
	},
	startGame(){
		this.clearGame();
		this.enterGame();
	},
	resumeGame(){
		this.resumeGameMap();
		this.enterGame();
	},
	reStartGame(){
		this.clearGame();
		this.enterGame();
	},
	ReliveBack(action){
		if(action == 1){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
			this.propBombAction(2048);
			if(GData.numNodeMap[GData.GRunTimeParam.lastSq] != 0){
				GData.numNodeMap[GData.GRunTimeParam.lastSq].removeFromParent();
				GData.numNodeMap[GData.GRunTimeParam.lastSq].destroy();
				GData.numMap[GData.GRunTimeParam.lastSq] = 0;
				GData.numNodeMap[GData.GRunTimeParam.lastSq] = 0;
			}
			GData.GRunTimeParam.gameStatus = 1;
		}else{
			this.resumeGameMap();
			if(GData.GRunTimeParam.lastSq != 0){
				if(GData.numNodeMap[GData.GRunTimeParam.lastSq] != 0){
					GData.numNodeMap[GData.GRunTimeParam.lastSq].removeFromParent();
					GData.numNodeMap[GData.GRunTimeParam.lastSq].destroy();
					GData.numMap[GData.GRunTimeParam.lastSq] = 0;
					GData.numNodeMap[GData.GRunTimeParam.lastSq] = 0;
				}
			}
			this.enterGame();
			this.propBombAction(2048);
		}
		//以上操作会改变游戏状态所以更新信息
		ThirdAPI.updataGameInfo();
	},
	initLoad(){
		//主游戏界面初始化
		this.node.active = true;
		this.headNode.active = false;
		this.pauseButton.active = false;
		this.propBox.active = false;
		this.gamePropFresh.active = false;
		this.gamePropBomb.active = false;
		this.gamePropClear.active = false;
		this.blockBoard.active = false;
	},
	finishLoad(voiceManager){
		this.voiceManager = voiceManager;
		this.nodePool = new cc.NodePool();
		this.node.active = true;
	},
	//所有面板的button按钮 返回函数
	panelButtonCb(event,customEventData){
		//继续游戏
		if(customEventData == "P_show"){
			EventManager.emit({type:'OpenPauseGame'});
		}
	},
	//如果继续游戏则绘制上次的盘局信息
	resumeGameMap(){
		var blocksBoardPos = this.blocksBoard.getPosition();
		for(var i = GData.RANK_TOP;i < 6;i++){
			for(var j = GData.FILE_LEFT;j < 6;j++){
				var sq = GData.COORD_XY(i,j);
				if(GData.numMap[sq] != 0){
					var blockIdx = GData.ConvertToMapId(sq);
					var item = cc.instantiate(GData.assets["PBNumObject"]);
					item.getComponent("NumObject").onInit(GData.numMap[sq]);
					this.node.addChild(item);
					var blockPos = this.blocksBoard.children[blockIdx].getPosition();
					blockPos.x = blockPos.x + blocksBoardPos.x;
					blockPos.y = blockPos.y + blocksBoardPos.y;
					item.setPosition(cc.v2(blockPos.x,blockPos.y - 3));
					GData.numNodeMap[sq] = item;
				}
			}
		}
		if(this.boardItem != null){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
		}
		this.headNode.getComponent('HeadScore').initCurrentScore(GData.GRunTimeParam.totalScore);
		this.propFreshNum('DJFresh');
		this.propFreshNum('DJBomb');
		this.propFreshNum('DJHammer');
	},
	gamePropButtonCb(event, customEventData){
		console.log("gamePropButtonCb",customEventData);
		this.stopRotateProp();
		if(customEventData == "DJFresh"){
			//判断是否超过使用上限
			var propBag = PropManager.getPropBag(customEventData);
			if(propBag.useNum >= 0){
				if(GData.GamePropParam.useNum[customEventData] >= propBag.useNum){
					return;
				}
			}
			//判断是否有道具可以使用
			if(GData.GamePropParam.bagNum[customEventData] <= 0){
				return;
			}
			GData.GamePropParam.useNum[customEventData] += 1;
			GData.GamePropParam.bagNum[customEventData] -= 1;
			this.propFreshNum(customEventData);
			//1 进行概率的有效数字
			this.refeshNumObject(true,1);
		}else if(customEventData == "DJHammer"){
			//判断是否超过使用上限
			var propBag = PropManager.getPropBag(customEventData);
			if(propBag.useNum >= 0){
				if(GData.GamePropParam.useNum[customEventData] >= propBag.useNum){
					return;
				}
			}
			//判断是否有道具可以使用
			if(GData.GamePropParam.bagNum[customEventData] <= 0){
				//道具没有了点击跳出分享界面获取道具
				this.getShareProp(customEventData,this.propConfig[customEventData]);
				return;
			}
			EventManager.emit({type:'OpenHammerGuide'});
			WxBannerAd.hideBannerAd();
		}else if(customEventData == "DJBomb"){
			//判断是否超过使用上限
			var propBag = PropManager.getPropBag(customEventData);
			if(propBag.useNum >= 0){
				if(GData.GamePropParam.useNum[customEventData] >= propBag.useNum){
					return;
				}
			}
			//判断是否有道具可以使用
			if(GData.GamePropParam.bagNum[customEventData] <= 0){
				//道具没有了点击跳出分享界面获取道具
				this.getShareProp(customEventData,this.propConfig[customEventData]);
				return;
			}
			EventManager.emit({type:'OpenBombGuide'});
			
			GData.GamePropParam.useNum[customEventData] += 1;
			GData.GamePropParam.bagNum[customEventData] -= 1;
			this.propFreshNum(customEventData);
			this.propBombAction(2048);
			WxBannerAd.hideBannerAd();
		}
	},
	clearGame(){
		//初始化矩阵信息
		for(var i = GData.RANK_TOP;i < 6;i++){
			for(var j = GData.FILE_LEFT;j < 6;j++){
				var sq = GData.COORD_XY(i,j);
				//console.log(sq,GData.numMap[sq]);                                                                    
				if(GData.numNodeMap[sq] != 0){
					GData.numNodeMap[sq].removeFromParent();
					GData.numNodeMap[sq].destroy();
				}
				GData.numNodeMap[sq] = 0;
				GData.numMap[sq] = 0;
			}
		}
		for(var i = 0;i < this.blocksBoard.children.length;i++){
			this.blocksBoard.children[i].getComponent("BlockBoard").shadowShow(false);
		}
		for(var key in GData.gameRunTimeScene){
			if(GData.gameRunTimeScene[key] != null){
				this.destroyGameBoard(key);
			}
		}
		if(this.boardItem != null){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
		}
		this.nodePool.clear();
		//清楚运行时数据
		this.stopRotateProp();
		//GData.GRunTimeParam.gameStatus = 0;
		GData.GRunTimeParam.totalScore = 0;
		GData.GRunTimeParam.stepNum = 0;
		GData.GRunTimeParam.lastSq = 0;
		GData.GRunTimeParam.lastFreshNum = 0;
		GData.GRunTimeParam.shareTimes = 0;
		
		GData.GamePropParam.bagNum.DJFresh = 0;
		GData.GamePropParam.bagNum.DJHammer = 0;
		GData.GamePropParam.bagNum.DJBomb = 0;
		GData.GamePropParam.bagNum.DJRelive = 0;
		GData.GamePropParam.useNum.DJFresh = 0;
		GData.GamePropParam.useNum.DJHammer = 0;
		GData.GamePropParam.useNum.DJBomb = 0;
		GData.GamePropParam.useNum.DJRelive = 0;
		this.headNode.getComponent('HeadScore').initData();
		this.propFreshNum('DJFresh');
		this.propFreshNum('DJBomb');
		this.propFreshNum('DJHammer');
	},
	//开始初始化主游戏界面信息
	enterGame(){
		//主游戏界面初始化
		this.propBox.active = true;
		this.pauseButton.active = true;
		this.headNode.active = true;
		this.headNode.getComponent('HeadScore').initData();
		//道具解锁操作
		console.log("局数",GData.GRunTimeParam.juNum);
		if(GData.cdnPropParam.PropUnLock.DJFresh <= GData.GRunTimeParam.juNum){
			this.gamePropFresh.active = true;
		}
		if(GData.cdnPropParam.PropUnLock.DJBomb <= GData.GRunTimeParam.juNum){
			this.gamePropBomb.active = true;
		}
		if(GData.cdnPropParam.PropUnLock.DJHammer <= GData.GRunTimeParam.juNum){
			this.gamePropClear.active = true;
		}
		this.blockBoard.active = true;
		this.headNode.getComponent('HeadScore').initMaxScore(GData.GRunTimeParam.maxScore);
		this.headNode.getComponent('HeadScore').initCurrentScore(0);
		if(GData.GRunTimeParam.StartGuideFlag == false){
			this.startGuideBoard();
		}
		GData.GRunTimeParam.gameStatus = 1;
		//结束游戏正常的推出 在进入则游戏数 + 1
		if(this.exitType == true){
			GData.GRunTimeParam.juNum += 1;
		}
		ThirdAPI.updataGameInfo();
		var params = {
			type:'initFriendRank'
		};
		ThirdAPI.getRank(params);
		this.battleNode.getComponent('BattleNode').onStart();
		//添加广告计算 最下面的节点位置所占的全屏比例 广告位置 不得超过这个节点
		/*
		if(GData.cdnPropParam.PropUnLock['PropAD'] <= GData.GRunTimeParam.juNum){
			var sizeHeight = cc.winSize.height;
			var blockBoardPos = this.blockBoard.getPosition();
			//向下移 10个像素 不要挨得最下面的节点太近
			var yy = Math.abs(blockBoardPos.y) +  this.blockBoard.getContentSize().height/2 + sizeHeight/2;
			var yRate = 1 - yy/sizeHeight;
			WxBannerAd.createBannerAd(yRate);
		}
		*/
		this.refeshNumObject(false,0);
		if(this.flyNode == null){
			this.flyNode = cc.instantiate(GData.assets["PBNumFly"]);
			this.flyNode.zIndex = 3;
			this.node.addChild(this.flyNode);
			this.flyNode.runAction(cc.fadeOut());
		}
	},
	startGuideBoard(){
		var guideNode = cc.instantiate(GData.assets["PBGuideStart"]);
		this.node.addChild(guideNode);
		guideNode.zIndex = 3;
		guideNode.setPosition(cc.v2(0,0));
		var block = this.blocksBoard.children[0];
		var blocksBoardPos = this.blocksBoard.getPosition();
		var blockPos = block.getPosition();
		blockPos.x = blockPos.x + blocksBoardPos.x;
		blockPos.y = blockPos.y + blocksBoardPos.y;
		guideNode.getComponent("GuideStart").showGuide(this.blockBoard.getPosition(),blockPos);
		GData.GRunTimeParam.StartGuideFlag = true;
	},
	refeshNumObject(scaleFlag,enbaled){
		console.log('refeshNumObject',scaleFlag,enbaled);
		if(this.boardItem != null){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
		}
		//var test = [256,512,1024,2048];
		//enbaled 0:随机 1:按钮概率 2:防死概率
		var num = util.refreshOneNum(enbaled);
		GData.GRunTimeParam.lastFreshNum = num;
		if(this.nodePool.size() <= 0){
			this.boardItem = cc.instantiate(GData.assets["PBNumObject"]);
		}else{
			this.boardItem = this.nodePool.get();
		}
		if(scaleFlag == false){
			this.boardItem.getComponent("NumObject").onInit(num);
		}else{
			this.boardItem.getComponent("NumObject").scaleShow(num,this.voiceManager);
		}
		this.node.addChild(this.boardItem);
		var blockBoardPos = this.blockBoard.getPosition();
		this.boardItem.setPosition(cc.v2(blockBoardPos.x,blockBoardPos.y - 3));
		this.boardItem.on(cc.Node.EventType.TOUCH_START, this.eventTouchStart,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_MOVE, this.eventTouchMove,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_END, this.eventTouchEnd,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_CANCEL, this.eventTouchCancel,this);
		console.log("refeshNumObject",num,GData.GRunTimeParam.stepNum,GData.GRunTimeParam.juNum);
	},
	offNodeAction(){
		this.boardItem.off(cc.Node.EventType.TOUCH_START, this.eventTouchStart,this);
		this.boardItem.off(cc.Node.EventType.TOUCH_MOVE, this.eventTouchMove,this);
		this.boardItem.off(cc.Node.EventType.TOUCH_END, this.eventTouchEnd,this);
		this.boardItem.off(cc.Node.EventType.TOUCH_CANCEL, this.eventTouchCancel,this);
	},
	//游戏规则算法
	gameLogic(){
		var self = this;
		var totalEatNum = 0;
		var sameLevelWasteTime = 0;
		var sq = GData.ConvertToMapSpace(this.moveIdx);
		var x = GData.FILE_X(sq);
		var y = GData.RANK_Y(sq);
		var myNum = GData.numMap[sq];

		var oriNode = GData.numNodeMap[sq];
		console.log("gameLogic start",sq,x,y,myNum);
		//最多有四次组合[-1,1]
		GData.GRunTimeParam.lastSq = sq;
		var eatNumLevel = new Array();
		//查找并收集所有的可以合并的数字
		for(let i = 0;i < 4;i++){
			let numDic = {'key':myNum,'list':[],'eatNum':0};
			for(let j = 0;j < GData.moveStep.length;j++){
				let step = GData.moveStep[j];
				let tsq = GData.COORD_XY(x + step[0],y + step[1]);
				//console.log("gameLogic",step,GData.numMap[tsq],myNum,tsq);
				if(GData.numMap[tsq] == myNum){
					numDic.list.push(GData.numNodeMap[tsq]);
					numDic.eatNum += 1;
					GData.numMap[tsq] = 0;
					GData.numNodeMap[tsq] = 0;
					totalEatNum += 1;
				}
			}
			if(numDic.eatNum > 0){
				eatNumLevel.push(numDic);
				myNum = myNum * 2;
				GData.numMap[sq] = myNum;
			}else{
				break;
			}
		}
		//console.log(eatNumLevel);
		//对可以合并的数字进行action操作
		if(eatNumLevel.length > 0){
			this.deepCallSameMerge(sq,eatNumLevel,oriNode,myNum,totalEatNum,0,0);
		}else{
			//2048 播放动作效果 退出循环
			if(myNum == 2048){
				GData.numMap[sq] = 0;
				GData.numNodeMap[sq] = 0;
				oriNode.getComponent("NumObject").merge2048Action(this.voiceManager,sq,function(){
					console.log(GData.numMap);
					oriNode.stopAllActions();
					self.nodePool.put(oriNode);
					//oriNode.removeFromParent();
					//oriNode.destroy();
					self.mergeFinish();
					//console.log(GData.numMap);
				});
			}else{
				this.mergeFinish();
			}
		}
	},
	mergeFinish(){
		//判断游戏是否结束
		var self = this;
		var leftNum = 0;
		for(var i = GData.RANK_TOP;i < 6;i++){
			for(var j = GData.FILE_LEFT;j < 6;j++){
				var fsq = GData.COORD_XY(i,j);
				if(GData.numMap[fsq] == 0){
					leftNum += 1;
				}
			}
		}
		//存储信息
		if(GData.GRunTimeParam.maxScore < GData.GRunTimeParam.totalScore){
			GData.GRunTimeParam.maxScore = GData.GRunTimeParam.totalScore;
		}
		if(GData.GRunTimeParam.totalScore > GData.cdnGameConfig.shareADLevel){
			util.reSetPropShareOrADRate();
		}
		this.battleNode.getComponent('BattleNode').show();
		if(leftNum == 0){
			GData.GRunTimeParam.gameStatus = 0;
			this.stopRotateProp();
			//复活道具
			var propRelive = PropManager.getPropRelive();
			if(propRelive != null){
				EventManager.emit({type:'OpenReliveGame',propRelive:propRelive});
			}else{
				this.finishGame();
			}
		}
		else if(leftNum == 1){
			GData.GRunTimeParam.stepNum += 1;
			this.boardItem = null;
			if(GData.GRunTimeParam.stepNum <= GData.cdnGameConfig.NoDeadTotal){
				this.refeshNumObject(false,2);
			}else{
				this.refeshNumObject(false,0);
			}
			//如果剩余一个格子则进行道具的引导使用 随机一个道具进行晃动
			var propArray = new Array();
			if(GData.GamePropParam.bagNum['DJFresh'] > 0){
				propArray.push('DJFresh');
			}
			var propBag = PropManager.getPropBag('DJHammer');
			if(GData.GamePropParam.useNum['DJHammer'] < propBag.useNum){
				if(GData.cdnPropParam.PropUnLock['DJHammer'] <= GData.GRunTimeParam.juNum){
					propArray.push('DJHammer');
				}
			}
			var propBag = PropManager.getPropBag('DJBomb');
			if(GData.GamePropParam.useNum['DJBomb'] < propBag.useNum){
				if(GData.cdnPropParam.PropUnLock['DJBomb'] <= GData.GRunTimeParam.juNum){
					propArray.push('DJBomb');
				}
			}
			var idx = util.getRandomIndexForArray(propArray);
			if(idx != -1){
				var propDc = propArray[idx];
				this.rotateProp(propDc);
			}
		}else{
			this.stopRotateProp();
			GData.GRunTimeParam.stepNum += 1;
			this.boardItem = null;
			this.refeshNumObject(false,0);
		}
		ThirdAPI.updataGameInfo();
	},
	rotateProp(propName){
		console.log('rotateProp ',propName);
		var rotateAction = cc.repeatForever(
			cc.sequence(
				cc.rotateBy(0.1, 10),
				cc.rotateBy(0.2, -20),
				cc.rotateBy(0.2, 20),
				cc.rotateBy(0.2, -20),
				cc.rotateBy(0.1, 10),
				cc.delayTime(1)
			)
		);
		if(propName == 'DJFresh'){
			this.gamePropFresh.runAction(rotateAction);
		}else if(propName == 'DJHammer'){
			this.gamePropClear.runAction(rotateAction);
		}else if(propName == 'DJBomb'){
			this.gamePropBomb.runAction(rotateAction);
		}
	},
	stopRotateProp(){
		this.gamePropFresh.stopAllActions();
		this.gamePropClear.stopAllActions();
		this.gamePropBomb.stopAllActions();
		this.gamePropFresh.rotation = 0;
		this.gamePropClear.rotation = 0;
		this.gamePropBomb.rotation = 0;
	},
	finishGame(){
		this.battleNode.getComponent('BattleNode').hide();
		EventManager.emit({type:'OpenFinishGame'});
		this.initLoad();
		//初始化矩阵信息
		for(var i = GData.RANK_TOP;i < 6;i++){
			for(var j = GData.FILE_LEFT;j < 6;j++){
				var sq = GData.COORD_XY(i,j);
				//console.log(sq,GData.numMap[sq]);                                                                    
				if(GData.numNodeMap[sq] != 0){
					GData.numNodeMap[sq].removeFromParent();
					GData.numNodeMap[sq].destroy();
				}
				GData.numNodeMap[sq] = 0;
				GData.numMap[sq] = 0;
			}
		}
		for(var i = 0;i < this.blocksBoard.children.length;i++){
			this.blocksBoard.children[i].getComponent("BlockBoard").shadowShow(false);
		}
		if(this.boardItem != null){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
		}
	},
	destroyGameBoard(type){
		var board = GData.gameRunTimeScene[type];
		if(board != null){
			board.stopAllActions();
			board.removeFromParent();
			board.destroy();
			GData.gameRunTimeScene[type] = null;
		}
		return null;
	},
	deepCallSameMerge(sq,mergeArray,oriNode,finishKey,totalEatNum,totalScore,deep){
		console.log(totalEatNum,totalScore,deep);
		var self = this;
		var totalTime = 0;
		var oriNodePos = oriNode.getPosition();
		var mergeEnd = function(){
			self.headNode.getComponent("HeadScore").startRollNum(totalScore);
			if(finishKey == 2048){
				GData.numMap[sq] = 0;
				GData.numNodeMap[sq] = 0;
				oriNode.getComponent("NumObject").merge2048Action(self.voiceManager,sq,function(){
					oriNode.stopAllActions();
					self.nodePool.put(oriNode);
					self.getProp(totalEatNum + 1,oriNodePos);
					self.mergeFinish();
				});
			}else{
				self.getProp(totalEatNum + 1,oriNodePos);
				self.mergeFinish();
			}
		};
		var mergeSame = function(pthis,data){
			let numDic = data.shift();
			let deep = data.shift();
			if(numDic == null){
				mergeEnd();
				return;
			}
			for(let j = numDic.list.length - 1;j >= 0;j--){
				let node = numDic.list[j];
				let moveAction = cc.moveTo(GData.TimeActionParam.EatNodeMoveTime,oriNodePos);
				let finished = cc.callFunc(function(pthis,m){
					self.nodePool.put(node);
					if(m == 0){
						let addScore = (numDic.key * 2) * numDic.list.length * (deep + 1);
						GData.GRunTimeParam.totalScore += addScore;
						oriNode.getComponent("NumObject").onInit(numDic.key * 2);
						self.voiceManager.getComponent('AudioManager').play(GData.AudioParam.AudioFall);
						self.flyNode.stopAllActions();
						var size = oriNode.getContentSize();
						var flyNodeSize = self.flyNode.getContentSize();
						self.flyNode.setPosition(cc.v2(oriNodePos.x,oriNodePos.y + size.height/2 + flyNodeSize.height/2));
						self.flyNode.getComponent("FlyNumAction").startFlyOnce(deep,numDic.key * 2,addScore,null);
						oriNode.getComponent("NumObject").MergeFinishNum(numDic.key * 2,function(){
							totalScore += addScore;
							mergeSame(pthis,[mergeArray.shift(),deep + 1]);
						});
					}
				},pthis,j);
				node.runAction(cc.sequence(moveAction,finished));
				if(j == 0){
					self.voiceManager.getComponent('AudioManager').play(GData.AudioParam.AudioComb1 + deep);
				}
			}
		};
		mergeSame(this,[mergeArray.shift(),deep]);
	},
	//获取道具操作
	showFailInfo(prop,propType){
		try{
			var self = this;
			var content = '请分享到不同的群获得更多的好友帮助!';
			if(propType == 'DJAV'){
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
						self.getShareProp(prop,propType);
					}else if(res.cancel){}
				}
			});
		}catch(err){}
	},
	getShareProp(prop,propType){
		if(propType == 'DJShare'){
			this.propKey = prop;
			this.isShareCallBack = false;
			this.shareSuccessCb = function(type, shareTicket, arg){
				console.log('main',type, shareTicket, arg);
				if(this.isShareCallBack == true){
					return;
				}
				this.isShareCallBack = true;
				var spriteName = null;
				var propNode = null;
				if(this.propKey == "DJFresh"){
					spriteName = "deletePropIcon";
					propNode = this.gamePropFresh;
				}else if(this.propKey == "DJBomb"){
					spriteName = "bomb";
					propNode = this.gamePropBomb;
				}else if(this.propKey == "DJHammer"){
					spriteName = "clearPropIcon";
					propNode = this.gamePropClear;
				}else{
					return;
				}
				var flyProp = cc.instantiate(GData.assets["PBPropFly"]);
				this.node.addChild(flyProp);
				flyProp.setPosition(cc.v2(0,0));
				flyProp.getComponent("NumFly").startFly(0.2,spriteName,1,propNode.getPosition(),function(){
					GData.GamePropParam.bagNum[this.propKey] += 1;
					this.propFreshNum(this.propKey);
				}.bind(this));
			};
			this.shareFailedCb = function(type,arg){
				console.log(type,arg);
				if(this.isShareCallBack == false){
					this.showFailInfo(prop,propType);
				}
				this.isShareCallBack = true;
			};
			var param = {
				type:null,
				arg:null,
				successCallback:this.shareSuccessCb.bind(this),
				failCallback:this.shareFailedCb.bind(this),
				shareName:prop,
				isWait:true
			};
			if(GData.cdnGameConfig.shareCustomSet == 0){
				param.isWait = false;
			}
			ThirdAPI.shareGame(param);
		}
		else if(propType == 'DJAV'){
			this.propKey = prop;
			this.shareSuccessCb = function(arg){
				var spriteName = null;
				var propNode = null;
				if(this.propKey == "DJFresh"){
					spriteName = "deletePropIcon";
					propNode = this.gamePropFresh;
				}else if(this.propKey == "DJBomb"){
					spriteName = "bomb";
					propNode = this.gamePropBomb;
				}else if(this.propKey == "DJHammer"){
					spriteName = "clearPropIcon";
					propNode = this.gamePropClear;
				}else{
					return;
				}
				var flyProp = cc.instantiate(GData.assets["PBPropFly"]);
				this.node.addChild(flyProp);
				flyProp.setPosition(cc.v2(0,0));
				flyProp.getComponent("NumFly").startFly(0.2,spriteName,1,propNode.getPosition(),function(){
					GData.GamePropParam.bagNum[this.propKey] += 1;
					this.propFreshNum(this.propKey);
				}.bind(this));
			}.bind(this);
			this.shareFailedCb = function(arg){
				if(arg == 'cancle'){
					this.showFailInfo(prop,propType);
				}else if(arg == 'error'){
					this.getShareProp(prop,'DJShare');
				}
			}.bind(this);
			WxVideoAd.initCreateReward(this.shareSuccessCb,this.shareFailedCb,null);
		}
	},
	getProp(eatNum,fromPos){
		var self = this;
		var res = PropManager.getProp(eatNum);
		console.log("getProp",eatNum,res);
		//直接获取刷新道具
		if(res == null){
			return;
		}
		//res = "PropBao_PropHammer";
		if(res == "DJFresh"){
			var flyProp = cc.instantiate(GData.assets["PBPropFly"]);
			this.node.addChild(flyProp);
			flyProp.setPosition(fromPos);
			flyProp.getComponent("NumFly").startFly(0.3,"deletePropIcon",1,this.gamePropFresh.getPosition(),function(){
				//判断是否超过使用上限
				var propBag = PropManager.getPropBag(res);
				if(propBag.useNum >= 0){
					if(GData.GamePropParam.useNum[res] >= propBag.useNum){
						return;
					}
				}
				//判断背包数量是否少于上限值
				if(GData.GamePropParam.bagNum[res] < propBag.bagNum){
					GData.GamePropParam.bagNum[res] += 1;
					self.propFreshNum('DJFresh');
				}
			});
		}
		var resArr = res.split("_");
		if(resArr[0] == "DJAV" || resArr[0] == "DJShare"){
			EventManager.emit({
				type:'OpenPropScene',
				pos:fromPos,
				openType:resArr[0],
				propKey:resArr[1]
			});
		}
	},
	getPropGameProp(data){
		var self = this;
		var spriteName = null;
		var propNode = null;
		if(data.propKey == "DJFresh"){
			spriteName = "deletePropIcon";
			propNode = this.gamePropFresh;
		}else if(data.propKey == "DJBomb"){
			spriteName = "bomb";
			propNode = this.gamePropBomb;
		}else if(data.propKey == "DJHammer"){
			spriteName = "clearPropIcon";
			propNode = this.gamePropClear;
		}else{
			return;
		}
			
		var flyProp = cc.instantiate(GData.assets["PBPropFly"]);
		this.node.addChild(flyProp);
		flyProp.setPosition(data.startPos);
		flyProp.getComponent("NumFly").startFly(0.2,spriteName,1,propNode.getPosition(),function(){
			//判断是否超过使用上限
			var propBag = PropManager.getPropBag(data.propKey);
			if(propBag.useNum >= 0){
				if(GData.GamePropParam.useNum[data.propKey] >= propBag.useNum){
					return;
				}
			}
			//判断背包数量是否少于上限值
			if(GData.GamePropParam.bagNum[data.propKey] >= propBag.bagNum){
				return;
			}
			GData.GamePropParam.bagNum[data.propKey] += 1;
			self.propFreshNum(data.propKey);
			ThirdAPI.updataGameInfo();
		});
	},
	eventTouchStart(event){
		this.touchMoveTF = true;
		this.moveIdx = -1;
		if(GData.gameRunTimeScene['PBBombGuide'] != null && GData.gameRunTimeScene['PBBombGuide'].isValid == true){
			this.destroyGameBoard('PBBombGuide');
			GData.GRunTimeParam.lastFreshNum = 2048;
			WxBannerAd.showBannerAd();
		}
		this.initLocation = this.boardItem.getPosition();
		this.touchLocation = this.boardItem.parent.convertToNodeSpaceAR(event.getLocation());
		//console.log(this.initLocation.x,this.initLocation.y,this.touchLocation.x,this.touchLocation.y);
		var size = this.boardItem.getContentSize();
		var moveToPos = cc.v2(this.touchLocation.x,this.touchLocation.y + size.height/2);
		this.boardItem.setPosition(moveToPos);
		//console.log('poker TOUCH_START');
	},
	eventTouchMove(event){
		//console.log('poker TOUCH_MOVE',event.touch.getDelta().x,event.touch.getDelta().y);
		let delta = event.touch.getDelta();
		if(GData.phoneModel == 'IphoneX'){
			this.boardItem.x += (delta.x / (1125 / 640));
			this.boardItem.y += (delta.y / (2246 / 1136));
		}else if(GData.phoneModel == 'IphoneXR'){
			this.boardItem.x += (delta.x / (828 / 640));
			this.boardItem.y += (delta.y / (1602 / 1136));
		}else{
			this.boardItem.x += delta.x;
			this.boardItem.y += delta.y;
		}
	},
	getNearBlock(TouchPos){
		let blocksBoardSize = this.blocksBoard.getContentSize();
		let itemLayoutPos = this.blocksBoard.getPosition();
		let beginPos = cc.v2(itemLayoutPos.x - blocksBoardSize.width/2,itemLayoutPos.y + blocksBoardSize.height/2);
		let width = Math.abs(TouchPos.x - beginPos.x);
		let height = Math.abs(TouchPos.y - beginPos.y);
		let idx = Math.floor(width / (138 + 5));
		let idy = Math.floor(height / (141 + 5));
		return idy * 4 + idx;
	},
	eventTouchEnd(event){
		//console.log('poker TOUCH_END');
		//如果移动的位置合法则进行移动
		this.touchMoveTF = false;
		if(this.moveIdx != -1){
			var sq = GData.ConvertToMapSpace(this.moveIdx);
			if(GData.numMap[sq] == 0){
				var block = this.blocksBoard.children[this.moveIdx];
				var blockPos = block.getPosition();
				var blocksBoardPos = this.blocksBoard.getPosition();
				blockPos.x = blockPos.x + blocksBoardPos.x;
				blockPos.y = blockPos.y + blocksBoardPos.y;
				this.boardItem.setPosition(blockPos);
				block.getComponent("BlockBoard").shadowSprite.active = false;
				this.boardItem.getComponent("NumObject").scaleBigOnce(this.voiceManager);
				this.offNodeAction();
				GData.numMap[sq] = parseInt(this.boardItem.getComponent("NumObject").value);
				GData.numNodeMap[sq] = this.boardItem;
				this.gameLogic();
			}else{
				//var moveAction = cc.moveTo(0.02,this.initLocation);
				this.boardItem.setPosition(this.initLocation);//runAction(moveAction);
			}
		}else{
			if(this.shadowBlok != null){
				this.shadowBlok.getComponent("BlockBoard").shadowSprite.active = false;
			}
			this.boardItem.setPosition(this.initLocation);
			//var moveAction = cc.moveTo(0.02,this.initLocation);
			//this.boardItem.runAction(moveAction);
		}
	},
	eventTouchCancel(event){
		//console.log('poker TOUCH_CANCEL');
		//如果移动的位置合法则进行移动
		this.touchMoveTF = false;
		if(this.moveIdx != -1){
			var sq = GData.ConvertToMapSpace(this.moveIdx);
			if(GData.numMap[sq] == 0){
				var block = this.blocksBoard.children[this.moveIdx];
				var blockPos = block.getPosition();
				var blocksBoardPos = this.blocksBoard.getPosition();
				blockPos.x = blockPos.x + blocksBoardPos.x;
				blockPos.y = blockPos.y + blocksBoardPos.y;
				this.boardItem.setPosition(blockPos);
				block.getComponent("BlockBoard").shadowSprite.active = false;
				this.boardItem.getComponent("NumObject").scaleBigOnce(this.voiceManager);
				this.offNodeAction();
				GData.numMap[sq] = parseInt(this.boardItem.getComponent("NumObject").value);
				GData.numNodeMap[sq] = this.boardItem;
				this.gameLogic();
				return true;
			}else{
				//var moveAction = cc.moveTo(0.02,this.initLocation);
				//this.boardItem.runAction(moveAction);
				this.boardItem.setPosition(this.initLocation);
			}
		}else{
			if(this.shadowBlok != null){
				this.shadowBlok.getComponent("BlockBoard").shadowSprite.active = false;
			}
			this.boardItem.setPosition(this.initLocation);
			//var moveAction = cc.moveTo(0.02,this.initLocation);
			//this.boardItem.runAction(moveAction);
		}
	},
	
	useHammer(data){
		console.log(data);
		var self = this;
		var pressPos = this.node.convertToNodeSpaceAR(data.pos);
		var box = this.blocksBoard.getBoundingBox();
		console.log(pressPos);
		if(box.contains(pressPos)){
			//console.log("在矩形内部");
			var selectIdx = this.getNearBlock(pressPos);
			if(selectIdx >= 0 && selectIdx <= 15){
				var sq = GData.ConvertToMapSpace(selectIdx);
				if(GData.numMap[sq] != 0 && GData.numNodeMap[sq] != 0){
					//如果找到选择的格子 则取消监听事件
					var self = this;
					var selectNode = GData.numNodeMap[sq];
					var selectPos = selectNode.getPosition();
					var propHammerGuide = GData.gameRunTimeScene['PBHammerGuide'];
					propHammerGuide.getComponent("PropHammerEffect").hammerOneNum(selectNode,function(){
						selectNode.removeFromParent();
						selectNode.destroy();
						GData.numNodeMap[sq] = 0;
						GData.numMap[sq] = 0;
						var block = self.blocksBoard.children[selectIdx];
						block.getComponent("BlockBoard").shadowSprite.active = false;
						self.destroyGameBoard('PBHammerGuide');
						GData.GamePropParam.useNum['DJHammer'] += 1;
						GData.GamePropParam.bagNum['DJHammer'] -= 1;
						self.propFreshNum('DJHammer');
						WxBannerAd.showBannerAd();
					});
				}
			}
		}else{
			console.log("在矩形外部");
		}
	},
	propBombAction(num){
		if(this.boardItem != null){
			this.boardItem.removeFromParent();
			this.boardItem.destroy();
			this.boardItem = null;
		}
		
		this.boardItem = cc.instantiate(GData.assets["PBNumObject"]);
		this.boardItem.getComponent("NumObject").scaleShow(num,this.voiceManager);
		this.boardItem.on(cc.Node.EventType.TOUCH_START, this.eventTouchStart,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_MOVE, this.eventTouchMove,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_END, this.eventTouchEnd,this);
		this.boardItem.on(cc.Node.EventType.TOUCH_CANCEL, this.eventTouchCancel,this);
		this.node.addChild(this.boardItem);
		var blockBoardPos = this.blockBoard.getPosition();
		this.boardItem.setPosition(cc.v2(blockBoardPos.x,blockBoardPos.y - 3));
		console.log("refeshNumObject",GData.GRunTimeParam.stepNum);
	},
	//道具个数发生变化
	propFreshNum(prop){
		if(prop == 'DJFresh'){
			this.gamePropFresh.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJFresh'];
		}else if(prop == 'DJHammer'){
			if(GData.GamePropParam.bagNum['DJHammer'] > 0){
				this.gamePropClear.getChildByName("add").active = false;
				this.gamePropClear.getChildByName("numLabel").active = true;
				this.gamePropClear.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJHammer'];
			}else{
				var addNode = this.gamePropClear.getChildByName("add");
				var propBag = PropManager.getPropBag(prop);
				//判断是否到达使用上限
				if(propBag.useNum >= 0){
					if(GData.GamePropParam.useNum[prop] >= propBag.useNum){
						addNode.active = false;
						this.gamePropClear.getChildByName("numLabel").active = true;
						this.gamePropClear.getChildByName("numLabel").getComponent(cc.Label).string = "x" + 0;
						return;
					}
				}
				var propType = PropManager.getShareOrADKey(prop);
				this.propConfig[prop] = propType;
				if(propType == 'DJShare'){
					addNode.getComponent(cc.Sprite).spriteFrame = GData.assets['getsba'];
				}else if(propType == 'DJAV'){
					addNode.getComponent(cc.Sprite).spriteFrame = GData.assets['video'];
				}
				addNode.active = true;
				this.gamePropClear.getChildByName("numLabel").active = false;
			}
		}else if(prop == 'DJBomb'){
			console.log(GData.GamePropParam);
			if(GData.GamePropParam.bagNum['DJBomb'] > 0){
				this.gamePropBomb.getChildByName("add").active = false;
				this.gamePropBomb.getChildByName("numLabel").active = true;
				this.gamePropBomb.getChildByName("numLabel").getComponent(cc.Label).string = "x" + GData.GamePropParam.bagNum['DJBomb'];
			}else{
				var addNode = this.gamePropBomb.getChildByName("add");
				var propBag = PropManager.getPropBag(prop);
				//判断是否到达使用上限
				if(propBag.useNum >= 0){
					if(GData.GamePropParam.useNum[prop] >= propBag.useNum){
						addNode.active = false;
						this.gamePropBomb.getChildByName("numLabel").active = true;
						this.gamePropBomb.getChildByName("numLabel").getComponent(cc.Label).string = "x" + 0;
						return;
					}
				}
				var propType = PropManager.getShareOrADKey(prop);
				this.propConfig[prop] = propType;
				
				if(propType == 'DJShare'){
					addNode.getComponent(cc.Sprite).spriteFrame = GData.assets['getsba'];
				}else if(propType == 'DJAV'){
					addNode.getComponent(cc.Sprite).spriteFrame = GData.assets['video'];
				}
				this.gamePropBomb.getChildByName("add").active = true;
				this.gamePropBomb.getChildByName("numLabel").active = false;
			}
		}
	},
	update(dt){
		if(this.touchMoveTF == true){
			this.moveIdx = -1;
			var movePos = this.boardItem.getPosition();
			var box = this.blocksBoard.getBoundingBox();
			if(box.contains(movePos)){
				this.moveIdx = this.getNearBlock(movePos);
				if(this.moveIdx >= 0 && this.moveIdx <= 15){
					if(this.shadowBlok != null){
						this.shadowBlok.getComponent("BlockBoard").shadowSprite.active = false;
					}
					this.shadowBlok = this.blocksBoard.children[this.moveIdx];
					var sq = GData.ConvertToMapSpace(this.moveIdx);
					var myNum = GData.numMap[sq];
					if(myNum != 0){
						this.shadowBlok.getComponent("BlockBoard").shadowSprite.active = false;
					}else{
						this.shadowBlok.getComponent("BlockBoard").shadowSprite.active = true;
					}
				}else{
					this.moveIdx = -1;
				}
			}
		}
	}
});
