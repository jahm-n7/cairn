import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { profile, MyCapsule } from '../data/profile';
import { useCapsules } from '../data/capsulesStore';
import { useFriends } from '../data/friendsStore';
import { useI18n } from '../i18n';
import { useSettings } from '../settings';
import { TAB_BAR_HEIGHT } from '../components/TabBar';
import FriendsPanel from '../components/FriendsPanel';
import { FriendsTarget } from './FriendsFlow';
import { PayRequest } from './PayScreen';

const H_PAD = 24;

export default function ProfileScreen({
  onOpenSettings,
  onOpenFriends,
  onOpenCapsule,
  onPay,
}: {
  onOpenSettings: () => void;
  onOpenFriends: (target: FriendsTarget) => void;
  onOpenCapsule: (c: MyCapsule) => void;
  onPay: (r: PayRequest) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { account } = useSettings();
  const { myCapsules, capsulesLeft } = useCapsules();
  const { friends } = useFriends();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const slides = [
    { num: capsulesLeft, label: t('prof_left') },
    { num: profile.capsulesFound, label: t('prof_found') },
    { num: friends.length, label: t('prof_friends_count') },
  ];
  const cur = slides[Math.min(page, slides.length - 1)];
  const slideTitle = cur.label.charAt(0).toUpperCase() + cur.label.slice(1);

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const pagePad = { paddingHorizontal: H_PAD, paddingBottom: Math.max(insets.bottom, 14) + TAB_BAR_HEIGHT + 24 };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      {/* header */}
      <View style={[styles.headerRow, { paddingHorizontal: H_PAD }]}>
        <LinearGradient colors={['#5a2d70', '#7a3da0']} style={styles.avatar}>
          <Text style={styles.avatarText}>{account.name.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
        <Text style={styles.slideTitle} numberOfLines={1}>{slideTitle}</Text>
        <Pressable onPress={onOpenSettings} style={styles.gearBtn}>
          <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={12} cy={12} r={3.1} />
            <Path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
          </Svg>
        </Pressable>
      </View>

      {/* page dots */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <Pressable key={i} onPress={() => goTo(i)} hitSlop={10}>
            <View style={[styles.dot, i === page && styles.dotActive]} />
          </Pressable>
        ))}
      </View>

      {/* swipeable slides — each led by its stat */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}
      >
        {/* Slide 1 — capsules laissées */}
        <View style={{ width }}>
          <ScrollView contentContainerStyle={pagePad} showsVerticalScrollIndicator={false}>
            <StatTop num={slides[0].num} />
            <View style={{ gap: 10 }}>
              {myCapsules.map((c) => (
                <CapCard key={c.id} c={c} onOpen={() => onOpenCapsule(c)} t={t} />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Slide 2 — capsules trouvées */}
        <View style={{ width }}>
          <ScrollView contentContainerStyle={pagePad} showsVerticalScrollIndicator={false}>
            <StatTop num={slides[1].num} />
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIcon}>
                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx={12} cy={12} r={9} />
                  <Polyline points="15.5 8.5 11 11 8.5 15.5 13 13" fill={colors.accent} stroke="none" />
                </Svg>
              </View>
              <Text style={styles.emptyText}>{t('prof_found_empty')}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Slide 3 — amis & accès (inline) */}
        <View style={{ width }}>
          <ScrollView contentContainerStyle={pagePad} showsVerticalScrollIndicator={false}>
            <StatTop num={slides[2].num} />
            <FriendsPanel
              onOpenFriend={(id) => onOpenFriends({ type: 'friend', id })}
              onOpenCircle={(id) => onOpenFriends({ type: 'circle', id })}
              onNewCircle={() => onOpenFriends({ type: 'newCircle' })}
              onPay={onPay}
            />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

function StatTop({ num }: { num: number }) {
  return (
    <View style={styles.statTop}>
      <Text style={styles.statTopNum}>{num}</Text>
    </View>
  );
}

function CapCard({ c, onOpen, t }: { c: MyCapsule; onOpen: () => void; t: (k: any, v?: any) => string }) {
  return (
    <View style={styles.capCard}>
      <Pressable style={styles.capTop} onPress={onOpen}>
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
            <Text style={styles.capOpenText}>
              {t('ouvrable_le')} {c.openAt}
            </Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slideTitle: { flex: 1, minWidth: 0, textAlign: 'center', fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
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

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 18, marginBottom: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(125,118,160,0.32)' },
  dotActive: { width: 22, backgroundColor: colors.accent },

  statTop: { alignItems: 'center', marginTop: 14, marginBottom: 20 },
  statTopNum: { fontFamily: fonts.display, fontSize: 54, color: colors.gold, lineHeight: 58 },
  statTopLabel: { fontSize: 13.5, color: colors.textSecondary, marginTop: 2, fontFamily: fonts.bodyMedium },

  emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 16 },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: colors.accentDimSoft,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', maxWidth: 250, lineHeight: 20, fontFamily: fonts.body },

  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, justifyContent: 'center' },
  miniAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  miniAvatarText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 15 },

  accessBtn: { ...card, paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  friendsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.accentDimSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsLabel: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14.5 },
  friendsSub: { color: colors.textSecondary, fontSize: 12, marginTop: 3, fontFamily: fonts.body, lineHeight: 16 },
  badge: { backgroundColor: colors.accent, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, color: colors.onAccent, fontFamily: fonts.bodyBold },

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
