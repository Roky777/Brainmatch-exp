# Hindi narration production brief

Status: **recording/generation not completed**. The current release uses device speech. The asset-production CLI and a voice-generation provider are not available in this workspace.

## Creative direction

An original warm, expressive adult Hindi preschool narrator. Friendly smile in the voice; clear everyday Hindi; natural pauses that give a child time to respond. Playful enthusiasm on a match, calm reassurance after a mistake. Speak to one child, not to a classroom. No exaggerated baby voice, artificial pitch shifting, shouting, or impersonation of a recognizable performer.

Use the user's preschool-animation references for warmth and production polish, not for copying a character voice.

## Recordings

Record each prompt separately, with the same narrator, room/microphone treatment and loudness. Deliver clean MP3 or AAC clips without background music, long lead-in silence or clipped word endings. Retain high-quality masters; do not degrade speech to satisfy an arbitrary 20 KB limit.

Spoken content remains Hindi; visible captions are English. The exact cue lines live in:

- `narration.js`: matching, encouragement, hints and memory-preview prompts.
- `script.js`: four tutorial prompts, six relationship explanations, level-completion and garden-completion prompts.
- `game-data.js`: six chapter-specific directions.

Before generating paid audio, the account owner must authorize the provider and spend ceiling. No credentials should be committed to this static site. A hired narrator or service must allow the resulting audio to be used in the game.

## Integration and review

1. Review pronunciation, warmth, pace and consistent volume before admitting clips.
2. Store approved clips under `assets/voice/`.
3. Map the **exact Hindi spoken line** to its relative audio URL in `VOICE_CLIPS` in `narration.js`.
4. The player prioritizes recorded clips at normal playback speed. Missing recordings use the device voice. Pause, mute, screen changes and new prompts cancel old narration.
5. Verify on mobile Safari and Chrome with headphones and a phone speaker. Confirm every tutorial cue, interruption, replay and audio-error fallback.

The empty clip map is deliberate: no unproduced assets are represented as finished narration.
