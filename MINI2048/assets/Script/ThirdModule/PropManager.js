let PropManager = {
	//获取道具
	getProp(mergeNum){
		//获取 刷新/宝箱的概率
		var mergeParam = this.getParamByJuShu(GData.cdnPropParam.MergeParam);
		var propsRate = mergeParam[mergeNum];
		//随机获取一个道具 刷新或者宝箱
		var prop = this.getRandomRateKey(propsRate);
		if(prop == null){
			return null;
		}
		//随机的刷新道具
		if(prop == "DJFresh"){
			//并且道具已经开锁
			if(GData.cdnPropParam.PropUnLock[prop] <= GData.GRunTimeParam.juNum){
				return prop;
			}
		}else if(prop == "DJSAB"){
			//确定宝箱是否解锁
			if(GData.cdnPropParam.PropUnLock['DJSAB'] > GData.GRunTimeParam.juNum){
				//没有解锁 直接获取 刷新道具
				return "DJFresh";
			}
			prop = this.getShareOrADKey(prop);
			//如果是分享则判断是否解锁
			if(GData.cdnPropParam.PropUnLock[prop] > GData.GRunTimeParam.juNum){
				return null;
			}
			propsRate = GData.cdnPropParam.SABOpenRate;
			var secondProp = this.getRandomRateKey(propsRate);;
			if(GData.cdnPropParam.PropUnLock[secondProp] <= GData.GRunTimeParam.juNum){
				return prop + "_" + secondProp;;
			}
		}
		return null;
	},
	getPropRelive(){
		//如果没有解锁 不可用
		//GData.GamePropParam.bagNum.DJRelive += 1;
		//return 'DJShare';
		if(GData.cdnPropParam.PropUnLock.DJRelive > GData.GRunTimeParam.juNum){
			console.log('getPropRelive unLock');
			return null;
		}
		//判断是否到达使用上限
		var propBag = this.getPropBag('DJRelive');
		if(GData.GamePropParam.useNum['DJRelive'] >= propBag.useNum){
			return null;
		}
		//如果有道具了 就不获取了
		if(GData.GamePropParam.bagNum.DJRelive > 0){
			var prop = this.getShareOrADKey('DJRelive');
			console.log("getPropRelive",prop);
			return prop;
		}
		if(GData.GamePropParam.bagNum.DJRelive == 0){
			var random = Math.random();
			var reliveRate = this.getParamByJuShu(GData.cdnPropParam.DJReliveRate);
			console.log("getPropRelive",random,reliveRate);
			if(random <= reliveRate){
				GData.GamePropParam.bagNum.DJRelive += 1;
				return this.getShareOrADKey('DJRelive');
			}else{
				return null;
			}
		}
	},
	getPropStart(){
		//如果没有解锁 不可用
		if(GData.cdnPropParam.PropUnLock.DJRelive > GData.GRunTimeParam.juNum){
			return null;
		}
		//如果有道具了 就不获取了
		var propBag = this.getPropBag('DJRelive');
		if(GData.GamePropParam.useNum['DJRelive'] >= propBag.useNum){
			return null;
		}
		if(GData.GamePropParam.bagNum.DJRelive > 0){
			var prop = this.getShareOrADKey('DJRelive');
			return prop;
		}
		return null;
	},
	getShareOrADKey(prop){
		var trate = GData.cdnPropParam.PropShareOrADRate[GData.cdnGameConfig.gameModel];
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
		if(prop == 'DJFresh'){
			return GData.cdnPropParam.PropParam[prop];
		}else{
			var bag = GData.cdnPropParam.PropParam[prop];
			for(var key in bag){
				if(GData.GRunTimeParam.juNum <= key){
					return bag[key];
				}
			}
			return bag['default'];
		}
	},
	/*根据局数获取对应的参数 包括标记局*/
	getParamByJuShu(data){
		for(var key in data){
			if(GData.GRunTimeParam.juNum <= key){
				return data[key];
			}
		}
		return data['default'];
	}
};
module.exports = PropManager;