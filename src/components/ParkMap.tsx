import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { Capsule } from '../data/capsules';
import { useI18n } from '../i18n';

type Props = {
  capsules: (Capsule & { here: boolean; distance: string })[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function ParkMap({ capsules, selectedId, onSelect }: Props) {
  const { t } = useI18n();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 378 440" style={StyleSheet.absoluteFill}>
        <Path
          d="M64,30 C170,8 300,26 348,92 C378,150 366,300 300,386 C214,440 110,430 74,360 C44,300 52,110 64,30 Z"
          fill={colors.parkland}
        />
        <Path
          d="M0,0 L60,0 C48,90 70,170 54,250 C42,330 64,400 52,440 L0,440 Z"
          fill={colors.river}
        />
        <Path
          d="M60,0 C48,90 70,170 54,250 C42,330 64,400 52,440"
          fill="none"
          stroke="rgba(150,130,200,0.16)"
          strokeWidth={1.2}
        />
        <Path
          d="M214,116 C266,104 306,138 294,182 C284,220 232,232 200,210 C172,190 176,130 214,116 Z"
          fill={colors.water}
          stroke="rgba(150,130,200,0.18)"
          strokeWidth={1.2}
        />
        <Path
          d="M-5,34 C120,58 250,46 383,72"
          fill="none"
          stroke="rgba(196,182,220,0.12)"
          strokeWidth={6}
        />
        <Path
          d="M30,432 C150,400 260,412 386,396"
          fill="none"
          stroke="rgba(196,182,220,0.12)"
          strokeWidth={6}
        />
        <Path
          d="M70,402 C150,322 184,250 250,196"
          fill="none"
          stroke="rgba(196,182,220,0.18)"
          strokeWidth={3.4}
        />
        <Path
          d="M120,86 C168,150 150,252 122,360"
          fill="none"
          stroke="rgba(196,182,220,0.1)"
          strokeWidth={1.5}
          strokeDasharray="4 7"
        />
        <Path
          d="M300,118 C322,196 300,300 256,384"
          fill="none"
          stroke="rgba(196,182,220,0.1)"
          strokeWidth={1.5}
          strokeDasharray="4 7"
        />
        <Circle cx={108} cy={178} r={6} fill={colors.treeline} />
        <Circle cx={150} cy={304} r={7} fill={colors.treeline} />
        <Circle cx={304} cy={330} r={6} fill={colors.treeline} />
        <Circle cx={92} cy={120} r={5} fill={colors.treeline} />
        <Circle cx={330} cy={246} r={6} fill={colors.treeline} />
        <Circle cx={248} cy={300} r={5} fill="rgba(90,72,120,0.45)" />
      </Svg>

      <Text style={[styles.label, { left: '62%', top: '32%', color: '#7e7095' }]}>LAC</Text>
      <Text
        style={[
          styles.label,
          { left: '5%', top: '40%', color: '#6a6088', transform: [{ rotate: '-90deg' }] },
        ]}
      >
        LE RHÔNE
      </Text>
      <Text
        style={[
          styles.label,
          { left: '30%', top: '58%', color: '#8a6e9a', transform: [{ rotate: '-34deg' }] },
        ]}
      >
        GRANDE ALLÉE
      </Text>

      <View style={styles.compass}>
        <Text style={styles.compassN}>N</Text>
        <Text style={styles.compassDot}>✦</Text>
      </View>

      <View style={[styles.hereWrap, { left: '46%', top: '74%' }]}>
        <Animated.View
          style={[
            styles.herePulse,
            { opacity: pulseOpacity, transform: [{ scale: pulseScale }] },
          ]}
        />
        <View style={styles.hereDot} />
        <Text style={styles.hereLabel}>{t('str_you_here')}</Text>
      </View>

      {capsules.map((c) => {
        const isSel = c.id === selectedId;
        const size = isSel ? 18 : c.here ? 13 : 10;
        const color = isSel ? colors.gold : c.here ? colors.accent : colors.textViolet;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            style={[styles.dotTouch, { left: c.x, top: c.y }]}
          >
            {isSel && <View style={styles.dotSelPulse} />}
            <View
              style={[
                styles.dot,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: color,
                  shadowColor: color,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', overflow: 'hidden' },
  label: {
    position: 'absolute',
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '600',
  },
  compass: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(196,182,220,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassN: { position: 'absolute', top: 2, color: colors.accent, fontSize: 9, fontWeight: '700' },
  compassDot: { fontSize: 8, color: colors.placeholder },
  hereWrap: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -12 }, { translateY: -12 }] },
  herePulse: {
    position: 'absolute',
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(140,190,235,0.4)',
  },
  hereDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.here,
    borderWidth: 3,
    borderColor: '#1b1338',
    shadowColor: '#96c8f0',
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  hereLabel: { marginTop: 5, fontSize: 9.5, color: colors.hereLabel, fontWeight: '600', width: 80, textAlign: 'center' },
  dotTouch: { position: 'absolute', padding: 10, transform: [{ translateX: -10 }, { translateY: -10 }] },
  dotSelPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginTop: -10,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,212,92,0.5)',
  },
  dot: { shadowOpacity: 0.6, shadowRadius: 8 },
});
