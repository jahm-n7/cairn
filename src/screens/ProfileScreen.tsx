import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { profile, myCapsules, MyCapsule } from '../data/profile';
import { useI18n } from '../i18n';

export default function ProfileScreen({
  onOpenSettings,
  onOpenFriends,
  onOpenCapsule,
}: {
  onOpenSettings: () => void;
  onOpenFriends: () => void;
  onOpenCapsule: (c: MyCapsule) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View style={styles.headerRow}>
        <LinearGradient colors={['#5a2d70', '#7a3da0']} style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.handle}>
            @{profile.handle} · {profile.loc}
          </Text>
        </View>
        <Pressable onPress={onOpenSettings} style={styles.gearBtn}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={12} cy={12} r={3.1} />
            <Path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
          </Svg>
        </Pressable>
      </View>

      {/* stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{profile.capsulesLeft}</Text>
          <Text style={styles.statLabel}>{t('prof_left')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{profile.capsulesFound}</Text>
          <Text style={styles.statLabel}>{t('prof_found')}</Text>
        </View>
        <Pressable style={styles.statCard} onPress={onOpenFriends}>
          <Text style={styles.statNum}>5</Text>
          <Text style={styles.statLabel}>{t('prof_friends_count')}</Text>
        </Pressable>
      </View>

      {/* friends & access */}
      <Pressable style={styles.friendsLink} onPress={onOpenFriends}>
        <View style={styles.friendsIcon}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={9} cy={8} r={3.2} />
            <Path d="M3 19c0-3 3-4.5 6-4.5s6 1.5 6 4.5" />
            <Path d="M16 5.5a3 3 0 0 1 0 5.6" />
            <Path d="M18 14.5c2 .6 3 1.9 3 4.5" />
          </Svg>
        </View>
        <Text style={styles.friendsLabel}>{t('prof_friends_link')}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('prof_request', { n: profile.pendingRequests })}</Text>
        </View>
        <Chevron />
      </Pressable>

      {/* my capsules */}
      <Text style={styles.sectionLabel}>{t('prof_my_caps')}</Text>
      <View style={{ marginTop: 10, gap: 10 }}>
        {myCapsules.map((c) => (
          <View key={c.id} style={styles.capCard}>
            <Pressable style={styles.capTop} onPress={() => onOpenCapsule(c)}>
              <LinearGradient colors={c.gradient} style={styles.capThumb} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.capPlace} numberOfLines={1}>
                  {c.place}
                </Text>
                <View style={styles.capOpenRow}>
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx={12} cy={12} r={9} />
                    <Polyline points="12 7 12 12 15 14" />
                  </Svg>
                  <Text style={styles.capOpenText}>{t('ouvrable_le')} {c.openAt}</Text>
                </View>
              </View>
              <Chevron />
            </Pressable>
            <View style={styles.capBtns}>
              <Pressable style={{ flex: 1 }}>
                <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.capBtnPrimary}>
                  <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx={12} cy={12} r={9} />
                    <Polyline points="12 7 12 12 15 14" />
                  </Svg>
                  <Text style={styles.capBtnPrimaryText}>{t('btn_open_now')}</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.capBtnSecondary}>
                <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
                  <Circle cx={12} cy={9} r={2.4} />
                </Svg>
                <Text style={styles.capBtnSecondaryText}>{t('btn_open_here')}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Chevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.chevron} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 6 15 12 9 18" />
    </Svg>
  );
}

const card = {
  borderRadius: 16,
  backgroundColor: colors.panelSoft,
  borderWidth: 1,
  borderColor: colors.panelBorder,
} as const;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 15 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.25)',
  },
  avatarText: { fontFamily: fonts.display, fontSize: 30, color: colors.gold },
  headerInfo: { flex: 1, minWidth: 0, paddingTop: 3 },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary, lineHeight: 28 },
  handle: { fontSize: 13, color: colors.textSecondary, marginTop: 3, fontFamily: fonts.body },
  gearBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  statCard: { ...card, flex: 1, padding: 14, alignItems: 'center' },
  statNum: { fontFamily: fonts.display, fontSize: 26, color: colors.gold },
  statLabel: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2, textAlign: 'center', fontFamily: fonts.body },
  friendsLink: { ...card, marginTop: 14, paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  friendsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.accentDimSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsLabel: { flex: 1, minWidth: 0, color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14.5 },
  badge: { backgroundColor: colors.accent, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, color: colors.onAccent, fontFamily: fonts.bodyBold },
  sectionLabel: { marginTop: 22, fontSize: 12, color: colors.textMuted, fontFamily: fonts.bodyBold, letterSpacing: 0.7 },
  langRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  langBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 13,
    alignItems: 'center',
    backgroundColor: colors.panelSoft,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  langBtnActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  langText: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.bodyBold },
  langTextActive: { color: colors.gold },
  capCard: { ...card, paddingVertical: 14, paddingHorizontal: 15 },
  capTop: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  capThumb: { width: 40, height: 40, borderRadius: 12 },
  capPlace: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14.5 },
  capOpenRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  capOpenText: { color: colors.textViolet, fontSize: 12, fontFamily: fonts.body },
  capBtns: { flexDirection: 'row', gap: 9, marginTop: 13 },
  capBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 13,
  },
  capBtnPrimaryText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 13 },
  capBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: colors.accentDimSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(255,92,138,0.32)',
  },
  capBtnSecondaryText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13 },
});
