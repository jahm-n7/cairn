import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polygon, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { Capsule, accessKey, mediaKey } from '../data/capsules';
import { useI18n, Lang } from '../i18n';

type FullCapsule = Capsule & { here: boolean; distance: string };
type Stage = 'detail' | 'unlock' | 'revealed';

const MONTHS: Record<Lang, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

function formatUntil(iso: string, lang: Lang): string {
  const d = new Date(iso);
  const m = MONTHS[lang][d.getMonth()];
  if (lang === 'en') return `${m} ${d.getDate()}, ${d.getFullYear()}`;
  return `${d.getDate()} ${m} ${d.getFullYear()}`;
}

const RING_R = 68;
const RING_C = 2 * Math.PI * RING_R;

export default function CapsuleDetailFlow({
  capsule,
  onClose,
}: {
  capsule: FullCapsule;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useI18n();
  const [stage, setStage] = useState<Stage>('detail');
  const [solvedRiddle, setSolvedRiddle] = useState(false);
  const [riddleInput, setRiddleInput] = useState('');
  const [riddleError, setRiddleError] = useState(false);
  const [hold, setHold] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (holdTimer.current) clearInterval(holdTimer.current); }, []);

  const here = capsule.here;
  const timeLocked = !!capsule.openDate && new Date(capsule.openDate).getTime() > Date.now();
  const mineBoth = !!capsule.mine && !here && timeLocked;
  const mineLocked = !!capsule.mine && here && timeLocked;
  const needsRiddle = !mineBoth && !mineLocked && capsule.accessType === 'riddle' && !solvedRiddle;
  const tooFar = !mineBoth && !mineLocked && !here;
  const canUnearth = !mineBoth && !mineLocked && here && !needsRiddle;

  const untilLabel = capsule.openDate ? formatUntil(capsule.openDate, lang) : '';
  const remaining = `${Math.max(0, capsule.dm - 5)} m`;
  const farLine = `${t('far_at')}${capsule.distance} · ${t('far_still', { n: remaining })}`;
  const accessLabel = t(accessKey(capsule.accessType) as any);
  const mediaLabel = t(mediaKey(capsule.media) as any);
  const dateLabel = t(capsule.dateKey as any);

  const startUnlock = () => {
    setHold(0);
    setStage('unlock');
  };

  const submitRiddle = () => {
    const ok =
      !!capsule.riddleA && riddleInput.trim().toLowerCase().includes(capsule.riddleA.toLowerCase());
    if (ok) {
      setSolvedRiddle(true);
      setRiddleError(false);
    } else {
      setRiddleError(true);
    }
  };

  const startHold = () => {
    if (holdTimer.current) return;
    holdTimer.current = setInterval(() => {
      setHold((h) => {
        const next = Math.min(100, h + 3.2);
        if (next >= 100) {
          if (holdTimer.current) clearInterval(holdTimer.current);
          holdTimer.current = null;
          setTimeout(() => {
            setHold(0);
            setStage('revealed');
          }, 240);
          return 100;
        }
        return next;
      });
    }, 26);
  };

  const endHold = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setHold((h) => (h < 100 ? 0 : h));
  };

  // ---------- REVEALED ----------
  if (stage === 'revealed') {
    return (
      <View style={[styles.fill, styles.revealedBg]}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 22 }}>
            <BackBtn onPress={onClose} dark />
          </View>
          <View style={{ paddingHorizontal: 28, paddingTop: 14 }}>
            <LinearGradient colors={['#7a3da0', '#2a0e2a']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.revealMedia}>
              <View style={styles.revealPlayBtn}>
                <Svg width={26} height={26} viewBox="0 0 24 24" fill={colors.gold}>
                  <Polygon points="8 5 19 12 8 19" />
                </Svg>
              </View>
              <Text style={styles.revealMediaTag}>{mediaLabel} · 0:42</Text>
            </LinearGradient>

            <View style={styles.revealAuthorRow}>
              <LinearGradient colors={capsule.gradient} style={styles.revealAvatar}>
                <Text style={styles.revealAvatarText}>{capsule.initials}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.revealAuthor}>{capsule.author}</Text>
                <Text style={styles.revealSub}>{t('left_this')} · {dateLabel}</Text>
              </View>
            </View>

            <Text style={styles.revealMessage}>{capsule.message}</Text>

            <Pressable style={styles.replyBtn}>
              <Text style={styles.replyBtnText}>{t('leave_reply')}</Text>
            </Pressable>
            <Pressable onPress={onClose}>
              <Text style={styles.goBack}>{t('go_back')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------- UNLOCK (hold to unearth) ----------
  if (stage === 'unlock') {
    const dashoffset = RING_C * (1 - hold / 100);
    return (
      <View style={[styles.fill, styles.unlockBg]}>
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 22 }}>
          <BackBtn onPress={() => setStage('detail')} dark />
        </View>
        <View style={styles.unlockHeader}>
          <Text style={styles.unlockEyebrow}>{t('unlock_eyebrow')}</Text>
          <Text style={styles.unlockMessage}>{capsule.message}</Text>
        </View>

        <View style={[styles.holdArea, { paddingBottom: insets.bottom + 64 }]}>
          <Pressable onPressIn={startHold} onPressOut={endHold} style={styles.holdBtn}>
            <Svg width={144} height={144} style={StyleSheet.absoluteFill}>
              <Circle cx={72} cy={72} r={RING_R} stroke="rgba(255,92,138,0.15)" strokeWidth={6} fill="none" />
              <Circle
                cx={72}
                cy={72}
                r={RING_R}
                stroke={colors.gold}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashoffset}
                transform="rotate(-90 72 72)"
              />
            </Svg>
            <LinearGradient colors={goldPinkGradient} style={styles.holdOrb}>
              <Svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M3 21h18" />
                <Path d="M6 21V11l6-5 6 5v10" />
              </Svg>
              <Text style={styles.holdOrbText}>{t('unearth_hold')}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.holdLead}>
            {t('hold_lead')}
            {'\n'}
            <Text style={styles.holdHint}>{t('hold_hint')}</Text>
          </Text>
        </View>
      </View>
    );
  }

  // ---------- DETAIL ----------
  return (
    <View style={[styles.fill, styles.detailBg]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 22 }}>
          <BackBtn onPress={onClose} />
        </View>
        <View style={{ paddingHorizontal: 28, paddingTop: 18 }}>
          <View style={styles.detailHead}>
            <LinearGradient colors={capsule.gradient} style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>{capsule.initials}</Text>
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.detailTitle}>{t('capsule_of')} {capsule.author}</Text>
              <Text style={styles.detailSub}>{mediaLabel} · {dateLabel}</Text>
            </View>
          </View>
          <View style={styles.accessRow}>
            <View style={styles.accessBadge}>
              <Text style={styles.accessBadgeText}>{accessLabel}</Text>
            </View>
          </View>

          {mineBoth && (
            <View style={styles.stateCard}>
              <ClockIcon />
              <Text style={styles.stateTitle}>{t('detail_both_title')}</Text>
              <Text style={styles.stateSub}>
                {t('ouvrable_le')} <Text style={styles.goldText}>{untilLabel}</Text> · {capsule.distance}.{'\n'}
                {t('detail_both_sub')}
              </Text>
              <PrimaryBtn label={t('btn_open_both')} icon="clock" onPress={startUnlock} />
              <View style={styles.sepRow}>
                <View style={styles.sepLine} />
                <Text style={styles.sepText}>{t('detail_sep')}</Text>
                <View style={styles.sepLine} />
              </View>
              <View style={styles.dualRow}>
                <SecondaryBtn label={t('btn_open_now')} icon="clock" onPress={startUnlock} />
                <SecondaryBtn label={t('btn_open_here')} icon="pin" onPress={startUnlock} />
              </View>
            </View>
          )}

          {mineLocked && (
            <View style={styles.stateCard}>
              <ClockIcon />
              <Text style={styles.stateTitle}>{t('detail_locked_title')}</Text>
              <Text style={styles.stateSub}>
                {t('detail_locked_sub')}{'\n'}
                {t('ouvrable_le')} <Text style={styles.goldText}>{untilLabel}</Text>.
              </Text>
              <PrimaryBtn label={t('btn_open_now')} icon="clock" onPress={startUnlock} />
            </View>
          )}

          {tooFar && (
            <View style={styles.stateCard}>
              <View style={[styles.stateIcon, { backgroundColor: 'rgba(125,118,160,0.14)' }]}>
                <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                  <Circle cx={12} cy={10} r={2.4} />
                </Svg>
              </View>
              <Text style={styles.stateTitle}>{t('detail_far_title')}</Text>
              <Text style={styles.stateSub}>{t('far_detail')}{'\n'}{farLine}.</Text>
              {!!capsule.mine && <PrimaryBtn label={t('btn_open_here')} icon="pin" onPress={startUnlock} />}
            </View>
          )}

          {needsRiddle && (
            <View style={styles.riddleCard}>
              <Text style={styles.riddleEyebrow}>{t('riddle_section')}</Text>
              <Text style={styles.riddleQ}>{capsule.riddleQ}</Text>
              <TextInput
                value={riddleInput}
                onChangeText={(v) => {
                  setRiddleInput(v);
                  setRiddleError(false);
                }}
                placeholder={t('riddle_placeholder')}
                placeholderTextColor={colors.placeholder}
                style={[styles.riddleInput, riddleError && { borderColor: '#ff5a6e' }]}
              />
              {riddleError && <Text style={styles.riddleError}>{t('riddle_wrong')}</Text>}
              <Pressable onPress={submitRiddle}>
                <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.riddleSubmit}>
                  <Text style={styles.riddleSubmitText}>{t('riddle_submit')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {canUnearth && (
            <View style={styles.unearthWrap}>
              <Text style={styles.unearthLead}>{t('here_title')}{'\n'}{t('here_sub')}</Text>
              <View style={styles.rangePill}>
                <View style={styles.rangeDot} />
                <Text style={styles.rangeText}>À {capsule.distance} · {t('here_range')}</Text>
              </View>
              <Pressable onPress={startUnlock}>
                <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.unearthBtn}>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M3 21h18" />
                    <Path d="M6 21V11l6-5 6 5v10" />
                  </Svg>
                  <Text style={styles.unearthBtnText}>{t('unearth_btn')}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function BackBtn({ onPress, dark }: { onPress: () => void; dark?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.backBtn, dark && { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d6cde8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="15 6 9 12 15 18" />
      </Svg>
    </Pressable>
  );
}

function ClockIcon() {
  return (
    <View style={styles.stateIcon}>
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx={12} cy={12} r={9} />
        <Polyline points="12 7 12 12 15 14" />
      </Svg>
    </View>
  );
}

function PrimaryBtn({ label, icon, onPress }: { label: string; icon: 'clock' | 'pin'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginTop: 22 }}>
      <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
        <BtnIcon icon={icon} stroke={colors.onAccent} />
        <Text style={styles.primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryBtn({ label, icon, onPress }: { label: string; icon: 'clock' | 'pin'; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryBtn}>
      <BtnIcon icon={icon} stroke={colors.gold} />
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

function BtnIcon({ icon, stroke }: { icon: 'clock' | 'pin'; stroke: string }) {
  if (icon === 'pin') {
    return (
      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
        <Circle cx={12} cy={9} r={2.4} />
      </Svg>
    );
  }
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx={12} cy={12} r={9} />
      <Polyline points="12 7 12 12 15 14" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  detailBg: { backgroundColor: '#1b1338' },
  unlockBg: { backgroundColor: '#2a0e2a' },
  revealedBg: { backgroundColor: '#2a0e2a' },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // detail header
  detailHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.25)',
  },
  detailAvatarText: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary },
  detailTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary, lineHeight: 28 },
  detailSub: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontFamily: fonts.body },
  accessRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  accessBadge: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  accessBadgeText: { fontSize: 11.5, color: colors.onAccent, fontFamily: fonts.bodyBold },

  // state cards
  stateCard: {
    marginTop: 30,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.panelBorderMid,
    backgroundColor: colors.panelFaint,
  },
  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.accentDimSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: { fontFamily: fonts.display, fontSize: 23, color: colors.textPrimary, marginTop: 18, textAlign: 'center' },
  stateSub: { fontSize: 13.5, color: colors.textSecondary, marginTop: 8, lineHeight: 20, textAlign: 'center', fontFamily: fonts.body },
  goldText: { color: colors.gold, fontFamily: fonts.bodyBold },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 26, borderRadius: 16 },
  primaryBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 15 },
  sepRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14, alignSelf: 'stretch' },
  sepLine: { flex: 1, height: 1, backgroundColor: colors.panelBorderMid },
  sepText: { fontSize: 11.5, color: colors.chevron, fontFamily: fonts.body },
  dualRow: { flexDirection: 'row', gap: 9, marginTop: 14, alignSelf: 'stretch' },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: colors.accentDimSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(255,92,138,0.32)',
  },
  secondaryBtnText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13 },

  // riddle
  riddleCard: {
    marginTop: 26,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: colors.panelFaint,
  },
  riddleEyebrow: { fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.accent, fontFamily: fonts.bodyBold },
  riddleQ: { fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 21, color: colors.textPrimary, marginTop: 8, lineHeight: 28 },
  riddleInput: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: 'rgba(20,13,40,0.6)',
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontFamily: fonts.body,
  },
  riddleError: { fontSize: 12.5, color: '#ff5a6e', marginTop: 8, fontFamily: fonts.body },
  riddleSubmit: { marginTop: 14, paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  riddleSubmitText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 15 },

  // can unearth
  unearthWrap: { marginTop: 30, alignItems: 'center' },
  unearthLead: { fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 22, color: colors.textPrimary, lineHeight: 31, textAlign: 'center', paddingHorizontal: 10 },
  rangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(110,154,110,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(110,154,110,0.35)',
  },
  rangeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#7fc77f' },
  rangeText: { fontSize: 12, color: '#9ecb9e', fontFamily: fonts.bodyBold },
  unearthBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 26, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 17 },
  unearthBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 16 },

  // unlock
  unlockHeader: { alignItems: 'center', paddingHorizontal: 36, paddingTop: 18 },
  unlockEyebrow: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.accent, fontFamily: fonts.bodyBold },
  unlockMessage: { fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 24, color: colors.textPrimary, marginTop: 8, lineHeight: 34, textAlign: 'center' },
  holdArea: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 26 },
  holdBtn: { width: 144, height: 144, alignItems: 'center', justifyContent: 'center' },
  holdOrb: { width: 126, height: 126, borderRadius: 63, alignItems: 'center', justifyContent: 'center' },
  holdOrbText: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.onAccent, marginTop: 3 },
  holdLead: { color: colors.textMuted, fontSize: 13, textAlign: 'center', fontFamily: fonts.body, lineHeight: 19 },
  holdHint: { color: colors.placeholder, fontSize: 11.5, fontFamily: fonts.body },

  // revealed
  revealMedia: { height: 320, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  revealPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(18,10,30,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealMediaTag: { position: 'absolute', bottom: 14, left: 16, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: fonts.body },
  revealAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20 },
  revealAvatar: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  revealAvatarText: { fontFamily: fonts.display, fontSize: 19, color: colors.textPrimary },
  revealAuthor: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15 },
  revealSub: { color: colors.textMuted, fontSize: 12.5, fontFamily: fonts.body },
  revealMessage: { fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 24, color: colors.textPrimary, lineHeight: 35, marginTop: 20 },
  replyBtn: { marginTop: 26, backgroundColor: colors.accentDimSoft, paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  replyBtnText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 14 },
  goBack: { textAlign: 'center', marginTop: 14, color: colors.textSecondary, fontSize: 13.5, fontFamily: fonts.body },
});
