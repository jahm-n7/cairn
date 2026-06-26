import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// The warm "ember" orb used for the audio recorder and the hold-to-unearth button:
// a glowing sphere (gold core → orange → pink/red edge) with a soft halo around it.
export default function EmberOrb({
  size,
  children,
  style,
}: {
  size: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const box = size * 1.6;
  const c = box / 2;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg
        width={box}
        height={box}
        style={{ position: 'absolute', left: -(box - size) / 2, top: -(box - size) / 2 }}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="emberGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#ff5c8a" stopOpacity={0.45} />
            <Stop offset="0.6" stopColor="#ff5c8a" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="emberCore" cx="0.5" cy="0.4" r="0.6">
            <Stop offset="0" stopColor="#ffe49a" />
            <Stop offset="0.45" stopColor="#ffaf5a" />
            <Stop offset="1" stopColor="#ff3d77" />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={box / 2} fill="url(#emberGlow)" />
        {/* faint concentric ripples radiating out from the ember */}
        <Circle cx={c} cy={c} r={size * 0.74} fill="none" stroke="#ff7fa3" strokeOpacity={0.1} strokeWidth={1} />
        <Circle cx={c} cy={c} r={size * 0.61} fill="none" stroke="#ff7fa3" strokeOpacity={0.16} strokeWidth={1} />
        <Circle cx={c} cy={c} r={size / 2} fill="url(#emberCore)" />
      </Svg>
      {children}
    </View>
  );
}
