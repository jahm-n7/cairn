import * as Haptics from 'expo-haptics';
import { playClick } from './sound';

// Interaction feedback: a haptic (gated by "Vibrations") plus a click sound
// (gated by "Sons"), each independent. App.tsx keeps the flag in sync. Haptics
// are no-ops on devices without an engine (e.g. the iOS simulator).
let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

function haptic(fire: () => Promise<void>) {
  if (!enabled) return;
  try {
    fire().catch(() => {});
  } catch {
    // no haptic engine (e.g. simulator) — ignore
  }
}

// Vibration only, no click sound — used for the floating tab buttons.
export function vibrate() {
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// Light tap — buttons, shutter (vibration + click sound).
export function tapHaptic() {
  haptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  playClick();
}

// Selection change — toggles, segments, tracking a capsule.
export function selectHaptic() {
  haptic(() => Haptics.selectionAsync());
  playClick();
}

// Success — burying a capsule, completing onboarding.
export function successHaptic() {
  haptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  playClick();
}
