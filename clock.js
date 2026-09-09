export class TurnClock {
 constructor(){this.task=null;}
 schedule(callback,ms){this.cancel();this.task={callback,remaining:ms,handle:null,start:0};this.resume();}
 pause(){const t=this.task;if(!t||t.handle===null)return;clearTimeout(t.handle);t.remaining=Math.max(0,t.remaining-(performance.now()-t.start));t.handle=null;}
 resume(){const t=this.task;if(!t||t.handle!==null)return;t.start=performance.now();t.handle=setTimeout(()=>{this.task=null;t.callback();},t.remaining);}
 cancel(){if(this.task)clearTimeout(this.task.handle);this.task=null;}
}
