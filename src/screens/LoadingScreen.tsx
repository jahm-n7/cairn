import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Ellipse, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme/colors';

const CREAM = '#fff0f6';
const STONES = [
  { w: 104, h: 48, bottom: 8, delay: 0 },
  { w: 74, h: 42, bottom: 50, delay: 150 },
  { w: 48, h: 33, bottom: 86, delay: 300 },
];

function Stone({ w, h, bottom, delay }: { w: number; h: number; bottom: number; delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.ease), useNativeDriver: false }),
        Animated.delay(2200),
        Animated.timing(v, { toValue: 0, duration: 480, easing: Easing.in(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);

  const opacity = v;
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] });
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      style={[
        styles.stone,
        { width: w, height: h, bottom, marginLeft: -w / 2, opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <Svg width={w} height={h}>
        <Ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={CREAM} />
      </Svg>
    </Animated.View>
  );
}

function Dot({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0.25)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(v, { toValue: 0.25, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return <Animated.View style={[styles.dot, { opacity: v }]} />;
}

export default function LoadingScreen() {
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.85] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });

  return (
    <LinearGradient colors={['#2c2150', '#1b1338', '#140d28']} style={styles.fill}>
      <View style={styles.center}>
        <View style={styles.stack}>
          <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}>
            <Svg width={200} height={200}>
              <Defs>
                <RadialGradient id="g" cx="0.5" cy="0.5" r="0.5">
                  <Stop offset="0" stopColor="#ff5c8a" stopOpacity={0.6} />
                  <Stop offset="0.64" stopColor="#ff5c8a" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width={200} height={200} fill="url(#g)" />
            </Svg>
          </Animated.View>
          {STONES.map((st, i) => (
            <Stone key={i} {...st} />
          ))}
        </View>

        <Text style={styles.title}>Cairn</Text>
        <Text style={styles.tagline}>Vos souvenirs, là où vous les avez laissés.</Text>

        <View style={styles.dots}>
          <Dot delay={0} />
          <Dot delay={180} />
          <Dot delay={360} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stack: { width: 150, height: 150 },
  glow: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
  },
  stone: { position: 'absolute', left: '50%' },
  title: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.textPrimary,
    letterSpacing: 1.4,
    marginTop: 38,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 9,
    maxWidth: 230,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: fonts.body,
  },
  dots: { position: 'absolute', bottom: 54, flexDirection: 'row', gap: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
