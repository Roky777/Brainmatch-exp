// The face is the original supplied artwork, never a generated replacement.
// The generated image contributes only the explorer costume below the neck.
export function sparkyArt(prefix='sparky') {
  return `<svg class="sparky-puppet" viewBox="0 0 260 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="${prefix}-costume"><path d="M0 216H260V360H0Z"/></clipPath></defs><g class="puppet-body"><image href="assets/explorer-costume.webp" x="0" y="-26" width="260" height="390" clip-path="url(#${prefix}-costume)"/><g class="puppet-head"><svg x="31" y="7" width="204" height="219" viewBox="20 30 145 155" overflow="hidden"><image href="assets/sparky/idle.webp" width="724" height="543"/></svg></g></g></svg>`;
}
export class Sparky {
  constructor(element) {
    this.element=element; this.until=0; element.innerHTML=sparkyArt(); element.style.backgroundImage='none'; this.set('idle');
    this.interval=setInterval(()=>{if(document.hidden)return;if(this.until&&performance.now()>=this.until)this.set('idle');if(performance.now()>=this.talkingUntil)element.classList.remove('talking');},100);
  }
  set(pose,duration=0) {
    this.pose=pose;this.until=duration?performance.now()+duration:0;this.element.dataset.pose=pose;
    this.element.setAttribute('aria-label',pose==='thinking'?'Sparky thinks about the cards':pose==='happy'?'Sparky celebrates with you':'Sparky, your little explorer friend');
  }
  speak(text){this.talkingUntil=performance.now()+Math.min(2300,text.length*45);this.element.classList.add('talking');}
  look(x){this.element.style.setProperty('--head-look',`${Math.max(-3,Math.min(3,x))}deg`);}
}
