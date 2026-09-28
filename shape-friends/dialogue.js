// Short context-specific lines, with rotating variants instead of constant narration.
export const LINES = {
  practice: ['Let’s practise! You pick. I’ll cheer!'],
  challenge: ['Ready to play against me? You go first!'],
  first: ['Hmm… what could go with that?'],
  match: ['You found shape friends! Hooray!', 'Oh, wow! You remembered!'],
  miss: ['Not quite! Let’s remember them.', 'Almost! I’m cheering for you. Try again!'],
  sparkyMiss: ['Oops! I forgot that one!'],
  win: ['You beat me! That was brilliant!'],
  lose: ['I won this time! Shall we play again?'],
  tie: ['A tie! We make a great team!'],
  done: ['You found them all! High five!'],
};
export class Dialogue {
  constructor() { this.counts = new Map(); }
  next(event) {
    const lines = LINES[event]; if (!lines) throw Error(`Unknown dialogue event: ${event}`);
    const count = this.counts.get(event) || 0; this.counts.set(event, count + 1);
    return lines[count % lines.length];
  }
}
