import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { MyCapsule } from '../data/profile';
import { mediaKey } from '../data/capsules';
import { useI18n, TKey } from '../i18n';
import { PayRequest } from './PayScreen';

type T = (key: TKey, vars?: Record<string, string | number>) => string;

function untilOpen(iso: string, t: T): { openable: boolean; label: string } {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { openable: true, label: t('until_now') };
  const day = 86400000;
  const days = Math.floor(diff / day);
  if (days >= 60) {
    const m = Math.round(days / 30.4);
    return { openable: false, label: t('until_in') + m + t('until_months') };
  }
  if (days >= 1) {
    const h = Math.floor((diff - days * day) / 3600000);
    return { openable: false, label: t('until_in') + days + t('until_days') + h + t('until_hours') };
  }
  const h = Math.floor(diff / 3600000);
  const min = Math.floor((diff - h * 3600000) / 60000);
  return { openable: false, label: t('until_in') + h + t('until_hours') + min + t('until_mins') };
}

export default function MyCapDetailScreen({ capsule, onClose, onPay }: { capsule: MyCapsule; onClose: () => void; onPay: (r: PayRequest) => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const until = untilOpen(capsule.openDate, t);
  const payCtx = { gradient: capsule.gradient, place: capsule.place, sub: capsule.sub };

  return (
    <View style={[styles.fill, styles.bg]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 22 }}>
          <Pressable onPress={onClose} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d6cde8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Polyline points="15 6 9 12 15 18" />
            </Svg>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 28, paddingTop: 16 }}>
          <View style={styles.headerRow}>
            <LinearGradient colors={capsule.gradient} style={styles.thumb} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.place}>{capsule.place}</Text>
              <Text style={styles.sub}>{capsule.sub}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: capsule.statusDot }]} />
            <Text style={styles.statusText}>{capsule.status}</Text>
          </View>

          <View style={{ marginTop: 20, gap: 11 }}>
            <InfoCard label={t('lbl_content')}>
              <Text style={styles.cardValue}>{t(mediaKey(capsule.media as any) as any)}</Text>
              <Text style={styles.message}>{capsule.message}</Text>
            </InfoCard>
            <InfoCard label={t('lbl_access')}>
              <Text style={styles.cardValue}>{capsule.opens}</Text>
            </InfoCard>
            <InfoCard label={t('lbl_conditions')}>
              <Text style={styles.cardValue}>{capsule.condition}</Text>
            </InfoCard>
            <InfoCard label={t('lbl_opening')}>
              <View style={styles.openingRow}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  <Circle cx={12} cy={12} r={9} />
                  <Polyline points="12 7 12 12 15 14" />
                </Svg>
                <Text style={styles.cardValue}>{capsule.openAt}</Text>
              </View>
              <View style={styles.untilBadge}>
                <Text style={styles.untilLabel}>{t('time_until')}</Text>
                <Text style={styles.untilValue}>{until.label}</Text>
              </View>
            </InfoCard>
          </View>

          {!until.openable && (
            <>
              <Pressable style={{ marginTop: 18 }} onPress={() => onPay({ mode: 'both', ...payCtx })}>
                <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.openBtn}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx={12} cy={12} r={9} />
                    <Polyline points="12 7 12 12 15 14" />
                  </Svg>
                  <Text style={styles.openBtnText}>{t('btn_open_both')}</Text>
                </LinearGradient>
              </Pressable>
              <Text style={styles.openSub}>{t('mycap_open_sub')}</Text>
            </>
          )}

          <Pressable style={styles.modifyBtn} onPress={() => onPay({ mode: 'edit', ...payCtx })}>
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#ff9ec0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M12 20h9" />
              <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
            </Svg>
            <Text style={styles.modifyText}>{t('btn_modify')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  bg: { backgroundColor: '#1b1338' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  thumb: { width: 58, height: 58, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)' },
  place: { fontFamily: fonts.display, fontSize: 25, color: colors.textPrimary, lineHeight: 28 },
  sub: { fontSize: 12.5, color: colors.textMuted, marginTop: 3, fontFamily: fonts.body },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 16 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13.5, color: '#d6cde8', fontFamily: fonts.bodyBold },
  card: { borderRadius: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid, paddingVertical: 14, paddingHorizontal: 16 },
  cardLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.6, fontFamily: fonts.bodyBold },
  cardValue: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 4 },
  message: { color: colors.textSoft, fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 17, marginTop: 8, lineHeight: 24 },
  openingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  untilBadge: { marginTop: 10, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.accentDimSoft, borderWidth: 1, borderColor: 'rgba(255,92,138,0.22)', borderRadius: 11, paddingVertical: 7, paddingHorizontal: 12 },
  untilLabel: { fontSize: 11, color: colors.textViolet, letterSpacing: 0.4, fontFamily: fonts.body },
  untilValue: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13.5 },
  openBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, borderRadius: 16 },
  openBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 15 },
  openSub: { marginTop: 9, textAlign: 'center', fontSize: 12, color: colors.chevron, fontFamily: fonts.body },
  modifyBtn: { marginTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderStrong, paddingVertical: 14, borderRadius: 16 },
  modifyText: { color: '#e7dcff', fontFamily: fonts.bodyBold, fontSize: 14.5 },
});
