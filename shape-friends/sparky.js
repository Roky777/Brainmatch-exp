// The user's 4 x 3 kimono sheets keep Sparky's face and costume together.
export const SPARKY_CLIPS = Object.freeze({
  idle: { sheet:'peek', frames:[11,10,11], times:[2400,200,1200], loop:true },
  greeting: { sheet:'expressions', frames:[4,5,6,7,4], times:[220,220,220,250,650], loop:false },
  thinking: { sheet:'expressions', frames:[8,9,10,11], times:[220,350,380,450], loop:true },
  'present-right': { sheet:'reach', frames:[0,1,2,3], times:[110,130,150,580], loop:false },
  happy: { sheet:'reactions', frames:[0,1,2,3,4,5], times:[140,180,180,200,210,240], loop:true },
  'thumbs-up': { sheet:'reactions', frames:[4,5,6,7], times:[170,180,180,400], loop:false },
});
export function spriteFrame(pose, elapsed, reduced=false) {
  const clip=SPARKY_CLIPS[pose] || SPARKY_CLIPS.idle;
  if(reduced) return {sheet:clip.sheet, frame:pose==='idle'?0:clip.frames.at(-1)};
  const total=clip.times.reduce((a,b)=>a+b,0);
  let remaining=clip.loop ? Math.max(0,elapsed)%total : Math.min(Math.max(0,elapsed),total-1);
  for(let i=0;i<clip.frames.length;i++) { if(remaining<clip.times[i])return {sheet:clip.sheet,frame:clip.frames[i]}; remaining-=clip.times[i]; }
  return {sheet:clip.sheet,frame:clip.frames.at(-1)};
}
export function sparkyArt(){return '<span class="sparky-mini-frame" aria-hidden="true"></span>';}
export class Sparky {
  constructor(element) {
    this.element=element;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.elapsed=0;this.duration=0;this.paused=false;this.last=performance.now();
    this.images=['peek','expressions','reach','reactions'].map(sheet=>{const i=new Image();i.src=`assets/sparky/kimono-${sheet}-v1.webp`;return i;});
    element.replaceChildren();this.set('idle');
    this.timer=setInterval(()=>this.tick(performance.now()),40);
  }
  tick(now) {
    const delta=Math.min(100,now-this.last);this.last=now;
    if(this.paused||document.hidden)return;
    this.elapsed+=delta;
    if(this.duration&&this.elapsed>=this.duration)this.set('idle');
    this.paint();
  }
  paint() {
    const {sheet,frame}=spriteFrame(this.pose,this.elapsed,this.reduced.matches);
    this.element.style.setProperty('--sprite-sheet',`url('assets/sparky/kimono-${sheet}-v1.webp')`);
    this.element.style.setProperty('background-position',`${frame%4/3*100}% ${Math.floor(frame/4)/2*100}%`,'important');
    this.element.dataset.sheet=sheet;this.element.dataset.frame=String(frame);
  }
  set(pose,duration=0) {
    this.pose=SPARKY_CLIPS[pose]?pose:'idle';this.elapsed=0;this.duration=duration;
    this.element.dataset.pose=this.pose;this.paint();
  }
  pause(value){this.paused=value;this.last=performance.now();}
  speak(){/* Gestures follow game state; do not pretend to lip-sync device speech. */}
  look(){/* The pointing strip includes a drawn eye glance toward the board. */}
  destroy(){clearInterval(this.timer);}
}
