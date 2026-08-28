import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';

// App-wide text scaling driven by the "Taille du texte" setting. Screens import
// this Text instead of React Native's; it multiplies any explicit fontSize by
// the current scale. App.tsx sets the scale before rendering, and a settings
// change re-renders the tree so every Text repaints at the new size.
let scale = 1;

export function setTextScale(next: number) {
  scale = next;
}

export function Text(props: TextProps) {
  if (scale === 1) return React.createElement(RNText, props);
  const flat = (StyleSheet.flatten(props.style) || {}) as { fontSize?: number };
  if (typeof flat.fontSize !== 'number') return React.createElement(RNText, props);
  return React.createElement(RNText, {
    ...props,
    style: [props.style, { fontSize: Math.round(flat.fontSize * scale) }],
  });
}
