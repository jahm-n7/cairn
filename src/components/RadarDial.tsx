import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Capsule } from '../data/capsules';

type TrackedCapsule = Capsule & { here: boolean; distance: string };

type Props = {
  trackedCapsules: TrackedCapsule[];
  primaryId: string | null;
  onSelect: (id: string) => void;
};

const SIZE = 280;
const CENTER = SIZE / 2;
const RR = 100;

export default function RadarDial({ trackedCapsules, primaryId, onSelect }: Props) {
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 4000, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const rotate = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.wrap}>
      <View style={styles.dial}>
        <View style={[styles.ringInset, { top: 0, left: 0, right: 0, bottom: 0 }]} />
        <View style={[styles.ringInset, { top: 52, left: 52, right: 52, bottom: 52 }]} />
        <View style={[styles.ringInset, { top: 104, left: 104, right: 104, bottom: 104 }]} />

        <Animated.View style={[styles.sweepWrap, { transform: [{ rotate }] }]}>
          <View style={styles.sweepWedge} />
        </Animated.View>

        <View style={styles.center} />

        {trackedCapsules.map((c) => {
          const a = (c.bearing * Math.PI) / 180;
          const dx = Math.sin(a) * c.rad * RR;
          const dy = -Math.cos(a) * c.rad * RR;
          const isPrimary = c.id === primaryId;
          const size = isPrimary ? 18 : 14;
          const color = isPrimary ? colors.gold : colors.accent;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelect(c.id)}
              style={[
                styles.dotTouch,
                { left: CENTER + dx, top: CENTER + dy },
              ]}
            >
              {isPrimary && <View style={styles.dotPulse} />}
              <View
                style={[
                  styles.dot,
                  { width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color },
                ]}
              />
              <Text style={styles.dotInitials}>{c.initials}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  dial: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(44,32,72,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.2)',
    overflow: 'hidden',
  },
  ringInset: {
    position: 'absolute',
    borderRadius: SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.15)',
  },
  sweepWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sweepWedge: {
    width: 2,
    height: SIZE / 2,
    backgroundColor: 'rgba(255,92,138,0.5)',
    position: 'absolute',
    top: 0,
    left: SIZE / 2 - 1,
  },
  center: {
    position: 'absolute',
    top: CENTER - 6.5,
    left: CENTER - 6.5,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: colors.textPrimary,
    borderWidth: 3,
    borderColor: '#1b1338',
  },
  dotTouch: { position: 'absolute', alignItems: 'center', transform: [{ translateX: -14 }, { translateY: -14 }], padding: 6 },
  dotPulse: {
    position: 'absolute',
    top: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,212,92,0.5)',
  },
  dot: { shadowOpacity: 0.6, shadowRadius: 8 },
  dotInitials: { fontSize: 9.5, fontWeight: '700', color: colors.gold, marginTop: 3 },
});
