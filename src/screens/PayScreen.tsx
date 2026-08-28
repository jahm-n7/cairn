import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { useI18n } from '../i18n';

export type PayMode = 'here' | 'time' | 'circle' | 'friend' | 'both' | 'edit';

export type PayRequest = {
  mode: PayMode;
  gradient?: [string, string];
  place?: string;
  sub?: string;
  units?: number; // for friend mode: number of extra people being paid for
  onProceed?: () => void;
};

// Title/sub are kept French (hardcoded in the prototype); the description line is translated.
const TITLES: Record<PayMode, string> = {
  edit: 'Modifier la capsule',
  both: 'Ouvrir maintenant, où que vous soyez',
  friend: 'Ajouter un ami',
  circle: 'Ajouter un cercle',
  here: 'Ouvrir à distance',
  time: "Ouvrir avant l'heure",
};
const SUBS: Record<PayMode, string> = {
  edit: 'Modification du contenu',
  both: 'Déterrage immédiat',
  friend: '6ᵉ ami',
  circle: '6ᵉ cercle',
  here: 'Ouverture à distance',
  time: 'Ouverture anticipée',
};

export default function PayScreen({ request, onClose }: { request: PayRequest; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [confirmKind, setConfirmKind] = useState<'pay' | 'edit' | null>(null);

  const { mode } = request;
  const units = Math.max(1, request.units ?? 1);
  const fmtEur = (n: number) => n.toFixed(2).replace('.', ',') + ' €';
  const price =
    mode === 'both' || mode === 'edit' ? '4,99 €' : mode === 'friend' ? fmtEur(units * 1.99) : '2,99 €';
  const place =
    mode === 'friend'
      ? units > 1
        ? `${units} amis supplémentaires`
        : 'Ami supplémentaire'
      : mode === 'circle'
      ? 'Cercle supplémentaire'
      : request.place || 'Capsule';
  const sub =
    mode === 'friend'
      ? units > 1
        ? `${units} personnes en plus`
        : '6ᵉ ami'
      : mode === 'circle'
      ? SUBS.circle
      : request.sub || SUBS[mode];
  const desc =
    mode === 'here' ? t('pay_here') : mode === 'friend' ? t('pay_friend') : mode === 'circle' ? t('pay_circle') : mode === 'both' ? t('pay_both') : mode === 'edit' ? t('pay_edit') : t('pay_time');
  const ctaLabel = mode === 'edit' ? t('pay_cta_edit') : mode === 'circle' || mode === 'friend' ? t('pay_cta_add') : t('pay_cta_open');
  const gradient = request.gradient ?? (['#5a2d70', '#7a3da0'] as [string, string]);

  const proceed = () => {
    setConfirmKind(null);
    request.onProceed?.();
    onClose();
  };

  return (
    <View style={styles.fill}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 22 }}>
          <Pressable onPress={onClose} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d6cde8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Polyline points="15 6 9 12 15 18" />
            </Svg>
          </Pressable>
        </View>

        <View style={styles.body}>
          <LinearGradient colors={goldPinkGradient} style={styles.orb}>
            <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
              <Circle cx={12} cy={12} r={9} />
              <Polyline points="12 7 12 12 15 14" />
            </Svg>
          </LinearGradient>

          <Text style={styles.title}>{TITLES[mode]}</Text>
          <Text style={styles.desc}>{desc}</Text>

          <View style={styles.itemCard}>
            <LinearGradient colors={gradient} style={styles.itemThumb} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.itemPlace} numberOfLines={1}>{place}</Text>
              <Text style={styles.itemSub}>{sub}</Text>
            </View>
            <Text style={styles.price}>{price}</Text>
          </View>

          <Pressable onPress={() => setConfirmKind(mode === 'edit' ? 'edit' : 'pay')} style={{ width: '100%', maxWidth: 320, marginTop: 24 }}>
            <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.payBtn}>
              <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Rect x={2} y={5} width={20} height={14} rx={2.5} />
                <Line x1={2} y1={10} x2={22} y2={10} />
              </Svg>
              <Text style={styles.payBtnText}>{ctaLabel}</Text>
            </LinearGradient>
          </Pressable>
          <Text style={styles.once}>{t('pay_once')}</Text>
        </View>
      </ScrollView>

      {confirmKind && (
        <Pressable style={styles.confirmScrim} onPress={() => setConfirmKind(null)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]} onPress={() => {}}>
            <View style={styles.warnIcon}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M10.3 4.3 2.5 18a1.6 1.6 0 0 0 1.4 2.4h16.2a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0z" />
                <Line x1={12} y1={9} x2={12} y2={13.5} />
                <Line x1={12} y1={17} x2={12} y2={17} />
              </Svg>
            </View>
            <Text style={styles.confirmTitle}>{t('confirm_title')}</Text>
            <Text style={styles.confirmMsg}>{confirmKind === 'edit' ? t('confirm_msg_edit') : t('confirm_msg_pay')}</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{t('confirm_amount_lbl')}</Text>
              <Text style={styles.amountValue}>{price}</Text>
            </View>
            <Pressable onPress={proceed}>
              <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmBtn}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
                  <Polyline points="5 13 10 18 19 6" />
                </Svg>
                <Text style={styles.confirmBtnText}>{confirmKind === 'edit' ? t('confirm_cta_edit') : t('confirm_cta_pay')}</Text>
              </LinearGradient>
            </Pressable>
            <Pressable onPress={() => setConfirmKind(null)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>{t('btn_cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 110, backgroundColor: '#1b1338' },
  scroll: { flexGrow: 1 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingTop: 10, paddingBottom: 30 },
  orb: { width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.textPrimary, marginTop: 28, lineHeight: 34, textAlign: 'center' },
  desc: { fontSize: 14.5, color: colors.textSoft, marginTop: 10, lineHeight: 22, textAlign: 'center', maxWidth: 300, fontFamily: fonts.body },
  itemCard: { marginTop: 26, width: '100%', maxWidth: 320, borderRadius: 20, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid, paddingVertical: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemThumb: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)' },
  itemPlace: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15 },
  itemSub: { color: colors.textMuted, fontSize: 12.5, marginTop: 2, fontFamily: fonts.body },
  price: { fontFamily: fonts.display, fontSize: 24, color: colors.gold },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: 16, borderRadius: 17 },
  payBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 16 },
  once: { marginTop: 14, fontSize: 12.5, color: colors.chevron, fontFamily: fonts.body },

  confirmScrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(12,8,24,0.72)', justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 360, borderRadius: 26, backgroundColor: '#1b1338', borderWidth: 1, borderColor: 'rgba(255,92,138,0.2)', paddingTop: 26, paddingHorizontal: 24 },
  warnIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.accentDim, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  confirmTitle: { fontFamily: fonts.display, fontSize: 23, color: colors.textPrimary, textAlign: 'center', marginTop: 16 },
  confirmMsg: { fontSize: 13.5, color: colors.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 20, fontFamily: fonts.body },
  amountRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 15, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid, paddingVertical: 14, paddingHorizontal: 16 },
  amountLabel: { fontSize: 13.5, color: '#c9bfe0', fontFamily: fonts.bodyBold },
  amountValue: { fontFamily: fonts.display, fontSize: 20, color: colors.gold },
  confirmBtn: { marginTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingVertical: 15, borderRadius: 16 },
  confirmBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 15.5 },
  cancelBtn: { marginTop: 10, paddingVertical: 11, alignItems: 'center' },
  cancelText: { fontSize: 14, color: colors.textSoft, fontFamily: fonts.bodyBold },
});
