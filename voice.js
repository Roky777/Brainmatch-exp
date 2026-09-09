import {VOICE_CLIPS} from './narration.js';

// Recorded narration keeps the same performance on every device.
// Device speech remains an explicit fallback, not a studio-voice substitute.
export class HindiVoice {
 constructor({
  engine=globalThis.speechSynthesis,
  clips=VOICE_CLIPS,
  createAudio=src=>new Audio(src),
  createUtterance=text=>new SpeechSynthesisUtterance(text),
  isHidden=()=>document.hidden,
 }={}){
  this.engine=engine;this.clips=clips;this.createAudio=createAudio;
  this.createUtterance=createUtterance;this.isHidden=isHidden;
  this.enabled=true;this.last='';this.voice=null;this.audio=null;this.generation=0;
  this.pick=()=>{
   const voices=this.engine?.getVoices()||[];
   this.voice=voices.find(v=>/^hi\b/i.test(v.lang)&&/swara|lekha|google/i.test(v.name))
    ||voices.find(v=>/^hi\b/i.test(v.lang));
  };
  this.pick();this.engine?.addEventListener('voiceschanged',this.pick);
 }
 say(text){
  this.last=text;this.stop();
  if(!this.enabled||this.isHidden())return;
  const src=this.clips[text],generation=this.generation;
  if(!src){this.speakFallback(text);return;}
  try{
   const audio=this.createAudio(src);this.audio=audio;
   audio.volume=.9;audio.playbackRate=1;
   Promise.resolve(audio.play()).catch(()=>{
    if(generation===this.generation&&this.enabled&&!this.isHidden()){
     this.audio=null;this.speakFallback(text);
    }
   });
  }catch{this.speakFallback(text);}
 }
 speakFallback(text){
  this.pick();if(!this.enabled||!this.voice||this.isHidden())return;
  const utterance=this.createUtterance(text);
  utterance.voice=this.voice;utterance.lang='hi-IN';
  utterance.rate=.95;utterance.pitch=1;utterance.volume=.9;
  this.current=utterance;this.engine.speak(utterance);
 }
 replay(){if(this.last)this.say(this.last);}
 stop(){
  this.generation++;this.engine?.cancel();
  if(this.audio){this.audio.pause();this.audio=null;}
 }
 setEnabled(enabled){this.enabled=enabled;if(!enabled)this.stop();}
}
