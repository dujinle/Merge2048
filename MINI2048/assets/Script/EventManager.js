var EventManager = {
	eventType:{
		GameEvent:'game-event',
		PressEvent:'press-event'
	},
	on:function(func,pthis){
		cc.director.on(this.eventType.GameEvent,func,pthis);
	},
	off:function(func,pthis){
		cc.director.off(this.eventType.GameEvent,func,pthis);
	},
	emit:function(data){
		cc.director.emit(this.eventType.GameEvent,data);
	},
	onPress:function(func,pthis){
		cc.director.on(this.eventType.PressEvent,func,pthis);
	},
	offPress:function(func,pthis){
		cc.director.off(this.eventType.PressEvent,func,pthis);
	},
	emitPress:function(data){
		cc.director.emit(this.eventType.PressEvent,data);
	}
};
module.exports = EventManager;
