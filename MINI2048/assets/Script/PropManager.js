let PropManager = {
	//获取道具
	getProp(mergeNum){
		//获取 刷新/宝箱的概率
		var mergeParam = this.getParamByJuShu(GlobalData.cdnPropParam.MergeParam);
		var propsRate = mergeParam[mergeNum];
		//随机获取一个道具 刷新或者宝箱
		var prop = this.getRandomRateKey(propsRate);
		if(prop == null){
			return null;
		}
		//随机的刷新道具
		if(prop == "PropFresh"){
			//并且道具已经开锁
			if(GlobalData.cdnPropParam.PropUnLock[prop] <= GlobalData.gameRunTimeParam.juNum){
				return prop;
			}
		}else if(prop == "PropSAB"){
			//确定宝箱是否解锁
			if(GlobalData.cdnPropParam.PropUnLock['PropSAB'] > GlobalData.gameRunTimeParam.juNum){
				//没有解锁 直接获取 刷新道具
				return "PropFresh";
			}
			prop = this.getShareOrADKey(prop);
			//如果是分享则判断是否解锁
			if(GlobalData.cdnPropParam.PropUnLock[prop] > GlobalData.gameRunTimeParam.juNum){
				return null;
			}
			propsRate = GlobalData.cdnPropParam.SABOpenRate;
			var secondProp = this.getRandomRateKey(propsRate);;
			if(GlobalData.cdnPropParam.PropUnLock[secondProp] <= GlobalData.gameRunTimeParam.juNum){
				return prop + "_" + secondProp;;
			}
		}
		return null;
	},
	getPropRelive(){
		//如果没有解锁 不可用
		//GlobalData.GamePropParam.bagNum.PropRelive += 1;
		//return 'PropShare';
		if(GlobalData.cdnPropParam.PropUnLock.PropRelive > GlobalData.gameRunTimeParam.juNum){
			console.log('getPropRelive unLock');
			return null;
		}
		//判断是否到达使用上限
		var propBag = this.getPropBag('PropRelive');
		if(GlobalData.GamePropParam.useNum['PropRelive'] >= propBag.useNum){
			return null;
		}
		//如果有道具了 就不获取了
		if(GlobalData.GamePropParam.bagNum.PropRelive > 0){
			var prop = this.getShareOrADKey('PropRelive');
			console.log("getPropRelive",prop);
			return prop;
		}
		if(GlobalData.GamePropParam.bagNum.PropRelive == 0){
			var random = Math.random();
			var reliveRate = this.getParamByJuShu(GlobalData.cdnPropParam.PropReliveRate);
			console.log("getPropRelive",random,reliveRate);
			if(random <= reliveRate){
				GlobalData.GamePropParam.bagNum.PropRelive += 1;
				return this.getShareOrADKey('PropRelive');
			}else{
				return null;
			}
		}
	},
	getPropStart(){
		//如果没有解锁 不可用
		if(GlobalData.cdnPropParam.PropUnLock.PropRelive > GlobalData.gameRunTimeParam.juNum){
			return null;
		}
		//如果有道具了 就不获取了
		var propBag = this.getPropBag('PropRelive');
		if(GlobalData.GamePropParam.useNum['PropRelive'] >= propBag.useNum){
			return null;
		}
		if(GlobalData.GamePropParam.bagNum.PropRelive > 0){
			var prop = this.getShareOrADKey('PropRelive');
			return prop;
		}
		return null;
	},
	getShareOrADKey(prop){
		var trate = GlobalData.cdnPropParam.PropShareOrADRate[GlobalData.cdnGameConfig.gameModel];
		var propRate = this.getParamByJuShu(trate);
		var propsRate = propRate[prop];
		console.log(propsRate,prop);
		var netProp = this.getRandomRateKey(propsRate);
		return netProp;
	},
	getRandomRateKey(propsRate){
		var prop = null;
		var random = Math.random();
		var randomTmp = 0;
		for(var key in propsRate){
			//console.log(key,propsRate[key]);
			if(random > randomTmp && random <= propsRate[key] + randomTmp){
				prop = key;
			}
			randomTmp = randomTmp + propsRate[key];
		}
		console.log("PropManager.getProp",random,propsRate,prop);
		return prop;
	},
	getPropBag(prop){
		if(prop == 'PropFresh'){
			return GlobalData.cdnPropParam.PropParam[prop];
		}else{
			var bag = GlobalData.cdnPropParam.PropParam[prop];
			for(var key in bag){
				if(GlobalData.gameRunTimeParam.juNum <= key){
					return bag[key];
				}
			}
			return bag['default'];
		}
	},
	/*根据局数获取对应的参数 包括标记局*/
	getParamByJuShu(data){
		for(var key in data){
			if(GlobalData.gameRunTimeParam.juNum <= key){
				return data[key];
			}
		}
		return data['default'];
	}
};
module.exports = PropManager;