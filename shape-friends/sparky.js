// Frame-by-frame atlas playback. No CSS puppet transforms or face/costume collage.
export const SPARKY_CLIPS = Object.freeze({
  idle: { sheet:'wave', frames:[0,1,0], times:[3100,130,700], loop:true },
  greeting: { sheet:'wave', frames:[0,2,3,2,3,0], times:[160,210,210,210,210,300], loop:false },
  thinking: { sheet:'think', frames:[0,1], times:[180,600], loop:false },
  'present-right': { sheet:'think', frames:[0,2,3], times:[100,160,600], loop:false },
  happy: { sheet:'cheer', frames:[0,1,2,3], times:[180,260,300,230], loop:true },
  'thumbs-up': { sheet:'cheer', frames:[0,1,2,3], times:[180,260,300,230], loop:false },
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
    this.images=['wave','think','cheer'].map(sheet=>{const i=new Image();i.src=`assets/animation/${sheet}.webp`;return i;});
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
    this.element.style.setProperty('--sprite-sheet',`url('assets/animation/${sheet}.webp')`);
    this.element.style.backgroundPosition=`${frame/3*100}% 100%`;
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
