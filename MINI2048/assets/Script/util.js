let util = {
	getRandomIndexForArray(array){
		if(array == null || array.length == 0){
			return -1;
		}
		var random = Math.floor(Math.random()*array.length);
		return random;
	},
	//节点距离计算欧式公式
	euclDist:function(pos1,pos2){
		var a = pos1.x - pos2.x;
		var b = pos1.y - pos2.y;
		var dist = Math.sqrt(a * a + b * b);
		return dist;
	},
	reSetPropShareOrADRate(){
		console.log('reSetPropShareOrADRate');
		for(var key in GlobalData.cdnPropParam.PropShareOrADRate){
			var item = GlobalData.cdnPropParam.PropShareOrADRate[key];
			//cary or normal
			for(var key2 in item){
				//4,31,default
				var item2 = item[key2];
				for(var key3 in item2){
					if(key3 == 'PropSAB'){
						item2[key3].PropShare = GlobalData.cdnGameConfig.PropShare;
						item2[key3].PropAV = GlobalData.cdnGameConfig.PropAV;
					}
				}
			}
		}
	},
	//获取随机数
	getRandomNum:function(rateType){
		var randomNumber = Math.random();
		var startRate = 0.0;
		//console.log("getRandomNum",randomNumber);
		for(var num in rateType){
			var rateTmp = rateType[num];
			if(randomNumber > startRate && randomNumber <= startRate + rateTmp){
				//console.log("getRandomNum",num);
				return num;
			}
			startRate += rateTmp;
		}
		
		//这里返回2 避免rateType设置错误导致无效
		return -1;
	},
	getRandomArray:function(length){
		var res = new Array();
		var dst = new Array();
		for(var i = 0;i < length;i++){
			res.push(i);
		}
		for(var i = length;i > 0;i--){
			var idx = Math.floor(Math.random() * i);
			dst.push(res[idx]);
			res.splice(idx,1);
		}
		console.log('getRandomArray',dst);
		return dst;
	},
	refreshOneNum(scaleFlag = 0){
		var enabled = false;
		if(scaleFlag == 1){
			enabled = Math.random() <= GlobalData.cdnGameConfig.PropFreshEnableRate;
		}else if(scaleFlag == 2){
			enabled = Math.random() <= GlobalData.cdnGameConfig.NoDeadRate;
		}
		if(enabled == true){
			var selectNum = new Array();
			for(var i = GlobalData.RANK_TOP;i < 6;i++){
				for(var j = GlobalData.FILE_LEFT;j < 6;j++){
					var fsq = GlobalData.COORD_XY(i,j);
					if(GlobalData.numMap[fsq] == 0){
						for(var m = 0;m < GlobalData.moveStep.length;m++){
							var step = GlobalData.moveStep[m];
							var tsq = GlobalData.COORD_XY(i + step[0],j + step[1]);
							if(GlobalData.numMap[tsq] != 0){
								selectNum.push(GlobalData.numMap[tsq]);
							}
						}
					}
				}
			}
			var length = selectNum.length;
			console.log('refreshOneNum',selectNum);
			if(length > 0){
				var num = selectNum[Math.floor(length * Math.random())];
				return num;
			}
		}
		var num = -1;//test[GlobalData.gameRunTimeParam.stepNum % test.length];
		var numRateMap = GlobalData.cdnNumRate;
		if(GlobalData.gameRunTimeParam.juNum > GlobalData.cdnGameConfig.NumRateJuNum){
			numRateMap = GlobalData.cdnNumRate15;
		}
		while(num == -1){
			var lastKey = 'default';
			for(var key in numRateMap){
				if(GlobalData.gameRunTimeParam.stepNum <= key){
					lastKey = key;
					break;
				}
			}
			num = this.getRandomNum(numRateMap[lastKey]);
		}
		return num;
	},
	isArrayFn:function(value){
		if (typeof Array.isArray === "function") {
			return Array.isArray(value);
		}else{
			return Object.prototype.toString.call(value) === "[object Array]";
		}
	},
	//复制对象，如果存在属性则更新
	updateObj:function (newObj,obj,copyKeys) {
		if(typeof obj !== 'object'){
			console.log('not a object data');
			return;
		}
		//如果是一个数组对象则直接复制
		for(var key in obj){
			if(copyKeys.includes(key)){
				newObj[key] = obj[key];
			}else if(newObj[key] == null){
				newObj[key] = obj[key];
			}else if(typeof obj[key] !== 'object'){
				newObj[key] = obj[key];
			}else if(this.isArrayFn(obj[key])){
				newObj[key] = obj[key];
			}else if(typeof obj[key] == 'object'){
				this.updateObj(newObj[key],obj[key],copyKeys);
			}
		}
	},
	httpGET:function(url,param,cb){
		var xhr = cc.loader.getXMLHttpRequest();
		if(param == null){
			xhr.open("GET", url,false);
		}else{
			xhr.open("GET", url + "?" + param,false);
		}
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
				var result = JSON.parse(xhr.responseText);
				cb(xhr.status,result);
			}else{
				cb({"code":xhr.status,"message":xhr.message});
			}
		};
		xhr.send(null);
	},
	getPhoneModel:function(){
		var size = cc.view.getFrameSize();
		console.log('getFrameSize:',size);
		if(size.width / size.height == 1125 / 2436){
			return 'IphoneX';
		}else if(size.width / size.height == 828 / 1792){
			return 'IphoneXR'
		}
	},
	customScreenAdapt(pthis){
		var DesignWidth = 640;
		var DesignHeight = 1136;
		let size = cc.view.getFrameSize();
		if (this.getPhoneModel() == 'IphoneX'){ //判断是不是iphonex
			cc.view.setDesignResolutionSize(1125, 2436, cc.ResolutionPolicy.FIXED_WIDTH);
			pthis.node.scaleX = 1125 / 640;
			pthis.node.scaleY = 2436 / 1136;
			let openDataContext = wx.getOpenDataContext();
			let sharedCanvas = openDataContext.canvas;
			sharedCanvas.width = 640;
			sharedCanvas.height = 1136;
			pthis.mainGameBoard.setPosition(cc.v2(0,-40));
			GlobalData.phoneModel = 'IphoneX';
		}else if(this.getPhoneModel() == 'IphoneXR'){
			cc.view.setDesignResolutionSize(828, 1792, cc.ResolutionPolicy.FIXED_WIDTH);
			pthis.node.scaleX = 828 / 640;
			pthis.node.scaleY = 1792 / 1136;
			let openDataContext = wx.getOpenDataContext();
			let sharedCanvas = openDataContext.canvas;
			sharedCanvas.width = 640;
			sharedCanvas.height = 1136;
			pthis.mainGameBoard.setPosition(cc.v2(0,-40));
			GlobalData.phoneModel = 'IphoneXR';
		}else{
			GlobalData.phoneModel = 'Normal';
		}
	},
	compareVersion:function(v1, v2) {
		v1 = v1.split('.')
		v2 = v2.split('.')
		const len = Math.max(v1.length, v2.length)
		while (v1.length < len) {
			v1.push('0')
		}
		while (v2.length < len) {
			v2.push('0')
		}
		for (let i = 0; i < len; i++) {
			const num1 = parseInt(v1[i])
			const num2 = parseInt(v2[i])
			if (num1 > num2) {
				return 1
			} else if (num1 < num2) {
				return -1
			}
		}
		return 0
	}
};
module.exports = util;