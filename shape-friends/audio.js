// Populate with approved local recordings without changing any gameplay code.
// Keys are caption text; values are URLs relative to this module.
export const VOICE_CLIPS = {};
export const EFFECT_CLIPS = {};

export class GameAudio {
  constructor(settings, { engine = globalThis.speechSynthesis, clips = VOICE_CLIPS, createAudio = src => new Audio(src), utterance = text => new SpeechSynthesisUtterance(text) } = {}) {
    this.settings = settings; this.engine = engine; this.clips = clips;
    this.createAudio = createAudio; this.utterance = utterance;
    this.context = null; this.clip = null; this.generation = 0;
  }
  unlock() { try { this.context ||= new AudioContext(); this.context.resume().catch(() => {}); } catch {} }
  stop() { this.generation++; try { this.engine?.cancel(); this.clip?.pause(); } catch {} this.clip = null; }
  say(text) {
    this.stop();
    if (!this.settings.voice) return;
    const generation = this.generation;
    let attempted = false;
    const fallback = () => {
      if (attempted || generation !== this.generation || !this.settings.voice) return;
      attempted = true;
      try {
        if (!this.engine) return;
        const line = this.utterance(text), voices = this.engine.getVoices();
        line.voice = voices.find(voice => /^en/.test(voice.lang) && /Samantha|Karen|Moira|Google.*female/i.test(voice.name)) || voices.find(voice => /^en/.test(voice.lang)) || null;
        line.lang = 'en-IN'; line.rate = .9; line.pitch = 1.12; line.volume = .85;
        this.engine.speak(line);
      } catch { /* Speech availability cannot block the game. */ }
    };
    const path = this.clips[text];
    if (!path) { fallback(); return; }
    try {
      this.clip = this.createAudio(new URL(path, import.meta.url).href);
      this.clip.onerror = fallback;
      Promise.resolve(this.clip.play()).catch(fallback);
    } catch { fallback(); }
  }
  effect(kind = 'flip') {
    if (!this.settings.effects) return;
    this.unlock(); if (!this.context) return;
    const notes = { flip: [430], match: [523, 659, 784], finish: [523, 659, 784, 1047], bounce: [240, 350], party: [700, 890], pour: [350, 280, 240], chime: [880, 1174], open: [400, 530], roll: [200, 280], slide: [360], spin: [500, 700] }[kind] || [440];
    try { notes.forEach((frequency, i) => {
      const time = this.context.currentTime + i * .085, oscillator = this.context.createOscillator(), gain = this.context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, time);
      gain.gain.setValueAtTime(.001, time); gain.gain.exponentialRampToValueAtTime(.045, time + .012); gain.gain.exponentialRampToValueAtTime(.001, time + .24);
      oscillator.connect(gain).connect(this.context.destination); oscillator.start(time); oscillator.stop(time + .25);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }); } catch {}
  }
}
