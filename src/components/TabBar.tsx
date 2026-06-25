import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';
import { colors, fonts } from '../theme/colors';
import { useI18n } from '../i18n';

export type Tab = 'discover' | 'create' | 'profile';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  bottomInset: number;
};

export default function TabBar({ active, onChange, bottomInset }: Props) {
  const { t } = useI18n();
  const color = (tab: Tab) => (active === tab ? colors.accent : '#6a7480');

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(bottomInset, 12) }]}>
      <Pressable style={styles.item} onPress={() => onChange('discover')}>
        <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={color('discover')} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={9} />
          <Polygon points="15.5 8.5 11 11 8.5 15.5 13 13" fill={color('discover')} stroke="none" />
        </Svg>
        <Text style={[styles.label, { color: color('discover') }]}>{t('tab_discover')}</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => onChange('create')}>
        <View style={[styles.plusRing, { borderColor: color('create') }]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color('create')} strokeWidth={2.4} strokeLinecap="round">
            <Line x1={12} y1={6} x2={12} y2={18} />
            <Line x1={6} y1={12} x2={18} y2={12} />
          </Svg>
        </View>
        <Text style={[styles.label, { color: color('create') }]}>{t('tab_deposit')}</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => onChange('profile')}>
        <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={color('profile')} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={8} r={3.6} />
          <Path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
        </Svg>
        <Text style={[styles.label, { color: color('profile') }]}>{t('tab_profile')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 11,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(18,11,34,0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,92,138,0.1)',
  },
  item: { alignItems: 'center', gap: 5 },
  plusRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontFamily: fonts.bodyBold },
});
