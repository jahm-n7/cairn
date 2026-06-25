import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme/colors';
import { Capsule, accessKey, mediaKey } from '../data/capsules';
import { useI18n } from '../i18n';

type Props = {
  capsule: Capsule & { here: boolean; distance: string };
  isTracked: boolean;
  onOpen: () => void;
  onToggleTrack: () => void;
};

export default function CapsuleSheet({ capsule, isTracked, onOpen, onToggleTrack }: Props) {
  const { t } = useI18n();
  const distanceLabel = capsule.here ? t('dist_here') : t('dist_far', { d: capsule.distance });

  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={styles.row}>
        <LinearGradient colors={capsule.gradient} style={styles.avatar}>
          <Text style={styles.avatarText}>{capsule.initials}</Text>
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.title}>
            {t('capsule_of')} {capsule.author}
          </Text>
          <Text style={styles.subtitle}>
            {t(mediaKey(capsule.media) as any)} · {t(capsule.dateKey as any)}
          </Text>
        </View>
        <View style={styles.chevronWrap}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.accessBadge}>
          <Text style={styles.accessBadgeText}>{t(accessKey(capsule.accessType) as any)}</Text>
        </View>
        <Text style={styles.distanceText}>{distanceLabel}</Text>
      </View>

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onToggleTrack();
        }}
        style={[
          styles.trackBtn,
          isTracked
            ? { backgroundColor: colors.accentDim, borderColor: colors.accent }
            : { backgroundColor: 'rgba(44,32,72,0.5)', borderColor: 'rgba(255,92,138,0.2)' },
        ]}
      >
        <Svg width={16} height={16} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={9} stroke={isTracked ? colors.gold : colors.textPrimary} strokeWidth={1.9} fill="none" />
          <Circle cx={12} cy={12} r={3.4} stroke={isTracked ? colors.gold : colors.textPrimary} strokeWidth={1.9} fill="none" />
        </Svg>
        <Text style={[styles.trackLabel, { color: isTracked ? colors.gold : colors.textPrimary }]}>
          {isTracked ? t('track_btn_active') : t('track_btn')}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 24,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.25)',
  },
  avatarText: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
  info: { flex: 1, minWidth: 0 },
  title: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15.5 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.body, fontSize: 12.5, marginTop: 2 },
  chevronWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentDimSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: { color: colors.accent, fontSize: 20, fontWeight: '700', marginTop: -2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  accessBadge: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 5 },
  accessBadgeText: { fontSize: 11, color: colors.onAccent, fontFamily: fonts.bodyBold },
  distanceText: { fontSize: 12.5, color: colors.textSecondary, fontFamily: fonts.body },
  trackBtn: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  trackLabel: { fontSize: 13, fontFamily: fonts.bodyBold },
});
