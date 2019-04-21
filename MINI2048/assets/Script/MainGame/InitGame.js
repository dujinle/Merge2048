var util = require('util');
var WxBannerAd = require('WxBannerAd');
var WxVideoAd = require('WxVideoAd');
var ThirdAPI = require('ThirdAPI');
var PropManager = require('PropManager');
var EventManager = require('EventManager');
cc.Class({
    extends: cc.Component,

    properties: {
		mainGame:cc.Node,
		startGame:cc.Node,
		voiceManager:null,
    },
    onLoad () {
		//自动适配屏幕
		util.customScreenAdapt(this);
		//异步加载动态数据
		this.rate = 0;
		this.resLength = 6;
		GData.assets = {};
		var self = this;
		this.loadUpdate = function(){
			console.log("this.rate:" + self.rate);
			if(self.rate >= self.resLength){
				self.startGame.getComponent("StartGame").finishLoad(self.voiceManager);
				self.mainGame.getComponent("MainGame").finishLoad(self.voiceManager);
				self.unschedule(self.loadUpdate);
			}
		};
		cc.loader.loadRes("dynamicPlist", cc.SpriteAtlas, function (err, atlas) {
			for(var key in atlas._spriteFrames){
				console.log("load res :" + key);
				GData.assets[key] = atlas._spriteFrames[key];
			}
			self.rate = self.rate + 1;
		});
		cc.loader.loadResDir("initPrefabs",function (err, assets) {
			for(var i = 0;i < assets.length;i++){
				GData.assets[assets[i].name] = assets[i];
				self.rate = self.rate + 1;
				if(assets[i].name == 'PBAudioSources'){
					self.voiceManager = cc.instantiate(assets[i]);
				}
				console.log("load res prefab:" + assets[i].name);
			}
		});
		this.schedule(this.loadUpdate,0.1);
		GData.GRunTimeParam.juNum = 1;
		ThirdAPI.loadLocalData();
		
	},
    start () {
		//加载游戏开始界面
		this.mainGame.getComponent("MainGame").initLoad();
		this.startGame.getComponent("StartGame").showStart();

		var self = this;
		ThirdAPI.loadCDNData(function(){
			self.startGame.getComponent("StartGame").refreshGame();
		});
		
		EventManager.on(this.gameUIControll,this);
		EventManager.onPress(this.propPressCallBack,this);
		EventManager.onLogic(this.gameLogicControll,this);
    },
	showPBGameBoard(pnode,type){
		var scene = GData.gameSceneDic[type];
		if(scene != null){
			if(GData.assets[type] != null){
				var sceneNode = cc.instantiate(GData.assets[type]);
				pnode.addChild(sceneNode);
				sceneNode.setPosition(cc.v2(0,0));
				sceneNode.getComponent(scene[1]).show();
				GData.gameRunTimeScene[type] = sceneNode;
			}else{
				cc.loader.loadRes(scene[0], function (err, prefab) {
					GData.assets[type] = prefab;
					var sceneNode = cc.instantiate(prefab);
					pnode.addChild(sceneNode);
					sceneNode.setPosition(cc.v2(0,0));
					sceneNode.getComponent(scene[1]).show();
					GData.gameRunTimeScene[type] = sceneNode;
				});
			}
		}
	},
	
	creatPBGameBoard(pnode,type,cb){
		var scene = GData.gameSceneDic[type];
		if(scene != null){
			if(GData.assets[type] != null){
				var sceneNode = cc.instantiate(GData.assets[type]);
				pnode.addChild(sceneNode);
				sceneNode.setPosition(cc.v2(0,0));
				GData.gameRunTimeScene[type] = sceneNode;
				cb(sceneNode);
			}else{
				cc.loader.loadRes(scene[0], function (err, prefab) {
					GData.assets[type] = prefab;
					var sceneNode = cc.instantiate(prefab);
					pnode.addChild(sceneNode);
					sceneNode.setPosition(cc.v2(0,0));
					GData.gameRunTimeScene[type] = sceneNode;
					cb(sceneNode);
				});
			}
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
	propPressCallBack(data){
		console.log(data);
		//取消按钮的传递
		if(data.type == 'HammerCancle'){
			this.destroyGameBoard('PBHammerGuide');
			WxBannerAd.showBannerAd();
			return;
		}else if(data.type == 'BombCancle'){
			this.destroyGameBoard('PBBombGuide');
			this.mainGame.getComponent('MainGame').propBombAction(GData.GRunTimeParam.lastFreshNum);
			GData.GamePropParam.useNum['DJBomb'] -= 1;
			GData.GamePropParam.bagNum['DJBomb'] += 1;
			this.mainGame.getComponent('MainGame').propFreshNum('DJBomb');
			WxBannerAd.showBannerAd();
			return;
		}
		else if(data.type == 'HammerTouch'){
			this.mainGame.getComponent('MainGame').useHammer(data);
		}
	},
	gameUIControll(data){
		var self = this;
		//var data = event.getUserData();
		console.log('dispatchMyEvent',data);
		if(data.type != 'ReliveBack' && data.type != 'PropShareSuccess'){
			this.voiceManager.getComponent("AudioManager").play(GData.AudioParam.AudioButton);
		}
		if(data.type == 'RankView'){
			WxBannerAd.hideBannerAd();
			var finishGameBoard = GData.gameRunTimeScene['PBFinishGameBoard'];
			if(finishGameBoard != null){
				finishGameBoard.getComponent("FinishGame").isDraw = false;
			}
			this.showPBGameBoard(this.node,'PBRankGameBoard');
		}
		if(data.type == 'OpenPropScene'){
			this.creatPBGameBoard(this.node,'PBPropGameBoard',function(node){
				node.getComponent("PropGame").initLoad(data.pos,data.openType,data.propKey);
			});
		}
		if(data.type == 'OpenReliveGame'){
			this.creatPBGameBoard(this.node,'PBReliveGameBoard',function(node){
				node.getComponent('ReliveGame').waitCallBack(1,data.propRelive,function(){
					self.destroyGameBoard('PBReliveGameBoard');
					self.mainGame.getComponent('MainGame').finishGame();
				});
			});
		}
		if(data.type == 'OpenPauseGame'){
			this.showPBGameBoard(this.node,'PBPauseGameBoard');
		}
		if(data.type == 'OpenHammerGuide'){
			this.showPBGameBoard(this.node,'PBHammerGuide');
		}
		if(data.type == 'OpenBombGuide'){
			this.showPBGameBoard(this.node,'PBBombGuide');
		}
		if(data.type == 'OpenFinishGame'){
			this.showPBGameBoard(this.node,'PBFinishGameBoard');
		}
		/*
		else if(data.type == 'PropGameCancle'){
			var finishGameBoard = GData.gameRunTimeScene['PBFinishGameBoard'];
			if(finishGameBoard != null){
				WxBannerAd.showBannerAd();
			}
		}
		*/
	},
    gameLogicControll(data){
		var self = this;
		this.voiceManager.getComponent("AudioManager").play(GData.AudioParam.AudioButton);
		if(data.type == 'StartGame'){
			if(GData.GRunTimeParam.gameStatus == 1){
				this.showPBGameBoard(this.node,'PBContinueGameBoard');
			}else{
				var propRelive = PropManager.getPropStart();
				if(propRelive != null){
					this.startGame.getComponent("StartGame").hideStaticStart(function(){
						self.creatPBGameBoard(self.node,'PBReliveGameBoard',function(node){
							node.getComponent('ReliveGame').waitCallBack(0,propRelive,function(){
								self.destroyGameBoard('PBReliveGameBoard');
								self.mainGame.getComponent('MainGame').startGame();
								console.log("ReliveGame cancle");
							});
						});
					});
				}else{
					this.startGame.getComponent("StartGame").hideStart(function(){
						self.mainGame.getComponent('MainGame').startGame();
					});
				}
			}
		}
		//归档回调
		if(data.type == "ContinueGame"){
			this.destroyGameBoard('PBContinueGameBoard');
			this.startGame.getComponent("StartGame").hideStaticStart(function(){
				self.mainGame.getComponent('MainGame').resumeGame();
			});
		}
		if(data.type == "ResetGame"){
			//重新开始游戏
			this.destroyGameBoard('PBContinueGameBoard');
			this.startGame.getComponent("StartGame").hideStaticStart(function(){
				self.mainGame.getComponent('MainGame').startGame();
			});
		}
		if(data.type == "PauseContinue"){
			var pauseGameBoard = GData.gameRunTimeScene['PBPauseGameBoard'];
			pauseGameBoard.getComponent("PauseGame").hidePause(function(){
				self.destroyGameBoard('PBPauseGameBoard');
			});
		}
		if(data.type == 'FinishGoHome'){
			WxBannerAd.hideBannerAd();
			this.destroyGameBoard('PBFinishGameBoard');
			this.mainGame.getComponent('MainGame').exitGame(true);
			this.startGame.getComponent("StartGame").showStart();
			//以上操作会改变游戏状态所以更新信息
			ThirdAPI.updataGameInfo();
		}
		if(data.type == "PauseGoHome"){
			WxBannerAd.hideBannerAd();
			var pauseGameBoard = GData.gameRunTimeScene['PBPauseGameBoard'];
			pauseGameBoard.getComponent("PauseGame").hidePause(function(){
				self.destroyGameBoard('PBPauseGameBoard');
				self.mainGame.getComponent('MainGame').exitGame(false);
				self.startGame.getComponent("StartGame").showStart();
				//以上操作会改变游戏状态所以更新信息
				ThirdAPI.updataGameInfo();
			});
		}
		if(data.type == 'PauseRestart'){
			WxBannerAd.hideBannerAd();
			var pauseGameBoard = GData.gameRunTimeScene['PBPauseGameBoard'];
			pauseGameBoard.getComponent("PauseGame").hidePause(function(){
				self.destroyGameBoard('PBPauseGameBoard');
				self.mainGame.getComponent('MainGame').reStartGame();
			});
		}
		if(data.type == 'FinishRestart'){
			this.destroyGameBoard('PBFinishGameBoard');
			this.mainGame.getComponent('MainGame').reStartGame();
			GData.GRunTimeParam.juNum += 1;
			ThirdAPI.updataGameInfo();
		}
		if(data.type == 'PropShareSuccess'){
			this.destroyGameBoard('PBPropGameBoard');
			self.mainGame.getComponent('MainGame').getPropGameProp(data);
		}
		if(data.type == 'ReliveBack'){
			GData.GamePropParam.bagNum.DJRelive -= 1;
			GData.GamePropParam.useNum.DJRelive += 1;
			this.destroyGameBoard('PBReliveGameBoard');
			if(data.action == 1){
				this.mainGame.getComponent('MainGame').ReliveBack(data.action);
			}else{
				this.startGame.getComponent("StartGame").hideStaticStart(function(){
					self.mainGame.getComponent('MainGame').ReliveBack(data.action);
				});
			}
		}
		if(data.type == 'StartBattleSuccess'){
			this.startGame.getComponent("StartGame").hideStaticStart(function(){
				self.mainGame.getComponent('MainGame').startGame();
				self.mainGame.getComponent('MainGame').getPropGameProp(data);
			});
		}
	}
	// update (dt) {},
});
