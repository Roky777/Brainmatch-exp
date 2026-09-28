// Populate with approved local recordings without changing any gameplay code.
// Keys are caption text; values are URLs relative to this module.
export const VOICE_CLIPS = {
  "Let’s practise! You pick. I’ll cheer!": "voice/renders/practice-start-v1.mp3",
  "Ready to play against me? You go first!": "voice/renders/challenge-start-v1.mp3",
  "Hmm… what could go with that?": "voice/renders/wonder-v1.mp3",
  "Oh, wow! You remembered!": "voice/renders/match-wow-v1.mp3",
  "Almost! I’m cheering for you. Try again!": "voice/renders/miss-kind-v1.mp3",
  "Oops! I forgot that one!": "voice/renders/sparky-oops-v1.mp3",
  "You beat me! That was brilliant!": "voice/renders/win-v1.mp3",
  "I won this time! Shall we play again?": "voice/renders/lose-v1.mp3",
  "A tie! We make a great team!": "voice/renders/tie-v1.mp3",
  "You found them all! High five!": "voice/renders/practice-done-v1.mp3",
  "I found a pair!": "voice/renders/sparky-found-v1.mp3",
  "I remember these two! Try them.": "voice/renders/hint-known-v1.mp3",
  "Let’s try a new card!": "voice/renders/hint-look-v1.mp3",
  "Let’s find shape friends! Pick two.": "voice/renders/welcome-v1.mp3",
  "Your turn! Pick two.": "voice/renders/your-turn-v1.mp3",
  "My turn! Hmm… this one?": "voice/renders/my-turn-v1.mp3",
  "You found shape friends! Hooray!": "voice/renders/match-v1.mp3",
  "Not quite! Let’s remember them.": "voice/renders/remember-v1.mp3",
  "More shape friends! You go first.": "voice/renders/next-v1.mp3",
  "Hi, friend! Let’s find a pair.": "voice/renders/hello-v1.mp3",
  "Shape friends for our picnic!": "voice/renders/sparky-match-v1.mp3"
};
export const EFFECT_CLIPS = {};

export class GameAudio {
  constructor(settings, { engine = globalThis.speechSynthesis, clips = VOICE_CLIPS, createAudio = src => new Audio(src), utterance = text => new SpeechSynthesisUtterance(text) } = {}) {
    this.settings = settings; this.engine = engine; this.clips = clips;
    this.createAudio = createAudio; this.utterance = utterance;
    this.context = null; this.clip = null; this.generation = 0;
  }
  unlock() { try { this.context ||= new AudioContext(); this.context.resume().catch(() => {}); } catch {} }
  remainingMs() { return this.settings.voice && this.clip && !this.clip.paused && Number.isFinite(this.clip.duration) ? Math.max(0, Math.min(4000, (this.clip.duration-this.clip.currentTime)*1000)) : 0; }
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
