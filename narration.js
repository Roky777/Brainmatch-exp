// Screen language and spoken language are intentionally independent.
export const CUES = {
 find: {text: 'Find a pair!', spoken: 'जोड़ी ढूँढो!'},
 remember: {text: 'Take a look!', spoken: 'तस्वीरें याद कर लो। फिर तीर वाला बटन दबाओ।'},
 friends: {text: 'A pair of friends!', spoken: 'ये दोनों दोस्त हैं!'},
 yourTurn: {text: 'Your turn!', spoken: 'अब दो कार्ड छुओ। जोड़ी ढूँढो!'},
 peek: {text: 'Have a peek!', spoken: 'एक बार देख लो!'},
 again: {text: 'Find them again!', spoken: 'फिर से ढूँढो!'},
 hint: {text: 'Look here!', spoken: 'चमकता हुआ कार्ड देखो। यह इसका दोस्त है।'},
 matched: {text: 'A match!', spoken: 'जोड़ी मिल गई!'},
 tryAgain: {text: 'Try again!', spoken: 'कोई बात नहीं। इन तस्वीरों को याद रखो।'},
 help: {text: 'Pip can help!', spoken: 'पिप मदद करेगा!'},
};

// Add only reviewed, licensed Hindi recordings. Empty means device-voice fallback.
// Keys are the exact Hindi spoken line; values are relative audio URLs.
// Example shape: { 'जोड़ी मिल गई!': './assets/voice/matched.mp3' }
// No missing/placeholder audio URLs are requested by the game.
export const VOICE_CLIPS = {};
