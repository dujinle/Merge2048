cc.Class({
    extends: cc.Component,

    properties: {
		audioSources:{
			type:cc.AudioSource,
			default:[]
		},
    },
	play(type){
		if(GlobalData.AudioSupport == true){
			this.audioSources[type].getComponent(cc.AudioSource).play();
		}
	}
});
