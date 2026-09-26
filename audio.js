export class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.context = null;
    this.lastLine = '';
  }
  speak(text) {
    this.lastLine = text;
    if (!this.settings.voice || !('speechSynthesis' in globalThis)) return;
    try {
      speechSynthesis.cancel();
      const line = new SpeechSynthesisUtterance(text);
      line.rate = 0.88;
      line.pitch = 1.08;
      line.volume = 0.85;
      speechSynthesis.speak(line);
    } catch { /* Captions always remain available. */ }
  }
  stopVoice() { try { speechSynthesis?.cancel(); } catch {} }
  tone(kind = 'tap') {
    if (!this.settings.effects) return;
    try {
      this.context ||= new AudioContext();
      this.context.resume();
      const notes = { tap: [360], flip: [420], match: [660, 880], splash: [260, 390], moo: [170, 125], cluck: [520, 610], baa: [260, 310], bloom: [620, 780, 980] }[kind] || [440];
      notes.forEach((frequency, index) => {
        const start = this.context.currentTime + index * 0.09;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = kind === 'moo' || kind === 'baa' ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.07, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(start); oscillator.stop(start + 0.27);
      });
    } catch { /* Audio never gates play. */ }
  }
}
