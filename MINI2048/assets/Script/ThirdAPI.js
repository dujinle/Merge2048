var WxGlobal = require('WxAPI');
var util = require('util');
if (typeof wx !== 'undefined') {
    //启动微信初始化
	console.log("load times");
    WxGlobal.initOnEnter();
}

let ThirdAPI = {
    "loadLocalData_storageName": '2048merge-data', //分数和金币相关
    "loadLocalData_gameInfoName": '2048merge-gameInfoData', //游戏数据相关
    "loadLocalData_reviveShareName": "2048merge-reviveData", //复活相关

	//加载本地分数等数据并填充到全局变量
    loadLocalData: function () {
        //存储在云端的数据结构
        try {
            let storage = cc.sys.localStorage.getItem(ThirdAPI.loadLocalData_storageName);
            console.log('storage data : ' + storage);
			if(storage != null && storage != ""){
				let localData = JSON.parse(storage);
                //兼容新添加的数据
				util.updateObj(GlobalData,localData,GlobalData.cdnCopyKeys);
				console.log('loadLocalData',GlobalData);
            }
        } catch (error) {
			console.log(error);
		}
    },
    loadCDNData:function(callback){
		try{
			wx.cloud.init({ env:'test-b1697d'});
			const db = wx.cloud.database()
			db.collection('MINI2048').where({
				FileName:GlobalData.cdnFileDefaultPath
			}).get({
				success(res) {
					// res.data 包含该记录的数据
					console.log(res.data);
					if(res.data.length > 0){
						var data = res.data[0];
						util.updateObj(GlobalData,data,GlobalData.cdnCopyKeys);
						if(callback){
							callback();
						}
					}
				},
				fail(err){
				  console.log(err);
				}
			});
		}catch(err){
			console.log(err);
		}
	},
	//更新游戏云端数据
    updataGameInfo: function () {
		if (typeof wx !== 'undefined') {
			WxGlobal.saveCloudData();
		}
        //云端数据再存储一份在本地
        try {
			var dataDic = {
				"gameRunTimeParam":GlobalData.gameRunTimeParam,
				"numMap":GlobalData.numMap,
				"GamePropParam":GlobalData.GamePropParam
			};
			console.log('updataGameInfo',dataDic);
            let data = JSON.stringify(dataDic);
            cc.sys.localStorage.setItem(ThirdAPI.loadLocalData_storageName, data);	
        } catch (error) {
            console.error(error);
        }
    },
    //分享游戏
    shareGame: function (parmas) {
        if (typeof wx !== 'undefined') {
            WxGlobal.shareGame(parmas);
        }
    },

    //根据类型来获取不同排行榜
    getRank: function (parmas) {
        if (typeof wx !== 'undefined') {
            //console.log('canshu：', parmas, parmas.type);
            switch (parmas.type) {
                case "gameOverUIRank":
                    WxGlobal.getGameOverUIRank(parmas);
                    break;
                case "rankUIFriendRank":
                    WxGlobal.getFriendRank(parmas);
                    break;
				case "rankUIPageUpDown":
                    WxGlobal.getRankPageUpDown(parmas);
                    break;
                case "rankUIGroupRank":
                    WxGlobal.getGroupRank(parmas);
                    break;
                case 'battleUIRank':
                    WxGlobal.getNextFriendRank(parmas);
                    break;
                case 'initFriendRank':
                    WxGlobal.getInitFriendRank(parmas);
                    break;
                default:
                    break;
            }
        }
    }
};
module.exports = ThirdAPI;