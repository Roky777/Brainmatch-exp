// Original Hindi prompts. Uses a locally available Hindi voice, never imitates a performer.
export class HindiVoice {
 constructor(){this.engine=globalThis.speechSynthesis;this.enabled=true;this.last='';this.voice=null;this.pick=()=>{const voices=this.engine?.getVoices()||[];this.voice=voices.find(v=>/^hi\b/i.test(v.lang)&&/swara|lekha|google/i.test(v.name))||voices.find(v=>/^hi\b/i.test(v.lang));};this.pick();this.engine?.addEventListener('voiceschanged',this.pick);}
 say(text){this.last=text;this.stop();this.pick();if(!this.enabled||!this.voice||document.hidden)return;const u=new SpeechSynthesisUtterance(text);u.voice=this.voice;u.lang='hi-IN';u.rate=.86;u.pitch=1.16;u.volume=.9;this.current=u;this.engine.speak(u);}
 replay(){this.say(this.last);}
 stop(){this.engine?.cancel();}
 setEnabled(enabled){this.enabled=enabled;if(!enabled)this.stop();}
}
