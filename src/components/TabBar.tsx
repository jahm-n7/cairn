import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { colors } from '../theme/colors';
import { vibrate } from '../theme/haptics';

export type Tab = 'discover' | 'create' | 'profile';

// Size of each floating icon button (used by screens to clear their bottom content).
export const TAB_BAR_HEIGHT = 60;

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  bottomInset: number;
};

export default function TabBar({ active, onChange, bottomInset }: Props) {
  const stroke = (tab: Tab) => (active === tab ? colors.gold : '#bca9d6');
  const go = (tab: Tab) => {
    vibrate();
    onChange(tab);
  };

  return (
    <View style={[styles.bar, { bottom: Math.max(bottomInset, 14) }]} pointerEvents="box-none">
      <Pressable
        onPress={() => go('discover')}
        style={[styles.fab, active === 'discover' && styles.fabActive]}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={stroke('discover')} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={9} />
          <Polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill={stroke('discover')} stroke="none" />
        </Svg>
      </Pressable>

      <Pressable
        onPress={() => go('create')}
        style={[styles.fab, active === 'create' && styles.fabActive]}
      >
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={stroke('create')} strokeWidth={2.2} strokeLinecap="round">
          <Line x1={12} y1={5} x2={12} y2={19} />
          <Line x1={5} y1={12} x2={19} y2={12} />
        </Svg>
      </Pressable>

      <Pressable
        onPress={() => go('profile')}
        style={[styles.fab, active === 'profile' && styles.fabActive]}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={stroke('profile')} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={8} r={3.6} />
          <Path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 26,
    right: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fab: {
    width: TAB_BAR_HEIGHT,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24,15,44,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.16)',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  fabActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
});
