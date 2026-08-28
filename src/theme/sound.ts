import { AudioPlayer, createAudioPlayer } from 'expo-audio';

// A soft UI click, gated by the "Sons" setting. App.tsx keeps `enabled` in sync.
// The single preloaded player is rewound and replayed on each tap.
let enabled = false;
let player: AudioPlayer | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (on && !player) {
    try {
      player = createAudioPlayer(require('../../assets/click.wav'));
      player.volume = 0.4;
    } catch {
      player = null;
    }
  }
}

export function playClick() {
  if (!enabled || !player) return;
  try {
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // audio unavailable — ignore
  }
}
