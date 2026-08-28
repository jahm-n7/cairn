import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { useI18n } from '../i18n';
import { useSettings } from '../settings';
import { successHaptic, tapHaptic } from '../theme/haptics';

const CREAM = '#fff0f6';

// Brand cairn (stacked stones) emblem reused from the loading screen.
function Emblem() {
  const stones = [
    { w: 92, h: 42, bottom: 6 },
    { w: 66, h: 37, bottom: 44 },
    { w: 43, h: 29, bottom: 76 },
  ];
  return (
    <View style={styles.emblem}>
      <Svg width={190} height={190} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="ob" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#ff5c8a" stopOpacity={0.55} />
            <Stop offset="0.66" stopColor="#ff5c8a" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={190} height={190} fill="url(#ob)" />
      </Svg>
      {stones.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: '50%', bottom: s.bottom, marginLeft: -s.w / 2 }}>
          <Svg width={s.w} height={s.h}>
            <Ellipse cx={s.w / 2} cy={s.h / 2} rx={s.w / 2} ry={s.h / 2} fill={CREAM} />
          </Svg>
        </View>
      ))}
    </View>
  );
}

function Field({ value, onChange, placeholder, prefix, keyboardType, autoCap }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  prefix?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCap?: 'none' | 'words' | 'sentences';
}) {
  return (
    <View style={styles.fieldWrap}>
      {!!prefix && <Text style={styles.fieldPrefix}>{prefix}</Text>}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.fieldInput}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCap ?? 'sentences'}
        autoCorrect={false}
      />
    </View>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.toggleTrack}>
      {on ? (
        <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.toggleFill, { alignItems: 'flex-end' }]}>
          <View style={styles.toggleKnob} />
        </LinearGradient>
      ) : (
        <View style={[styles.toggleFill, { backgroundColor: 'rgba(125,118,160,0.22)', alignItems: 'flex-start' }]}>
          <View style={styles.toggleKnob} />
        </View>
      )}
    </Pressable>
  );
}

function PrefRow({ icon, title, sub, on, onToggle }: { icon: React.ReactNode; title: string; sub: string; on: boolean; onToggle: () => void }) {
  return (
    <View style={styles.prefRow}>
      <View style={styles.prefIcon}>{icon}</View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.prefTitle}>{title}</Text>
        <Text style={styles.prefSub}>{sub}</Text>
      </View>
      <Toggle on={on} onPress={onToggle} />
    </View>
  );
}

const STEP_COUNT = 4;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { account, setAccount, settings, setSetting, completeOnboarding } = useSettings();
  const [step, setStep] = useState(0);

  // Draft identity — pre-fill blank so the user types their own.
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailConsent, setEmailConsent] = useState(false);

  const hasEmail = email.trim().length > 0;
  const canNext = step !== 1 || name.trim().length > 0;

  const finish = () => {
    const patch: Partial<typeof account> = {};
    if (name.trim()) patch.name = name.trim();
    if (handle.trim()) patch.handle = handle.trim().replace(/^@/, '');
    if (email.trim()) patch.email = email.trim();
    if (phone.trim()) patch.phone = phone.trim();
    if (Object.keys(patch).length) setAccount(patch);
    setSetting('emailUpdates', hasEmail && emailConsent);
    successHaptic();
    completeOnboarding();
  };

  const next = () => {
    if (step < STEP_COUNT - 1) {
      tapHaptic();
      setStep((s) => s + 1);
    } else finish();
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <LinearGradient colors={[colors.bgRadialTop, colors.bgRadialMid, colors.bg]} style={styles.fill}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
          {/* progress */}
          <View style={styles.progress}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <View key={i} style={[styles.progressDot, i <= step && styles.progressDotOn]} />
            ))}
          </View>

          <View style={styles.body}>
            {step === 0 && (
              <View style={styles.centerBlock}>
                <Emblem />
                <Text style={styles.title}>{t('onb_welcome_title')}</Text>
                <Text style={styles.sub}>{t('onb_welcome_sub')}</Text>
              </View>
            )}

            {step === 1 && (
              <View style={styles.formBlock}>
                <Text style={styles.stepTitle}>{t('onb_identity_title')}</Text>
                <Text style={styles.stepSub}>{t('onb_identity_sub')}</Text>
                <View style={{ gap: 12, marginTop: 26 }}>
                  <Field value={name} onChange={setName} placeholder={t('onb_name_ph')} autoCap="words" />
                  <Field value={handle} onChange={setHandle} placeholder={t('onb_handle_ph')} prefix="@" autoCap="none" />
                </View>
              </View>
            )}

            {step === 2 && (
              <View style={styles.formBlock}>
                <Text style={styles.stepTitle}>{t('onb_contact_title')}</Text>
                <Text style={styles.stepSub}>{t('onb_contact_sub')}</Text>
                <View style={{ gap: 12, marginTop: 26 }}>
                  <Field value={email} onChange={setEmail} placeholder={t('onb_email_ph')} keyboardType="email-address" autoCap="none" />
                  <Field value={phone} onChange={setPhone} placeholder={t('onb_phone_ph')} keyboardType="phone-pad" />
                  {/* Email consent — only meaningful once an address is given. */}
                  <View style={[styles.consentRow, !hasEmail && styles.consentRowOff]} pointerEvents={hasEmail ? 'auto' : 'none'}>
                    <View style={styles.prefIcon}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                        <Rect x={3} y={5} width={18} height={14} rx={2.5} />
                        <Path d="M4 7l8 6 8-6" />
                      </Svg>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.prefTitle}>{t('onb_email_consent_title')}</Text>
                      <Text style={styles.prefSub}>{t('onb_email_consent_sub')}</Text>
                    </View>
                    <Toggle on={emailConsent} onPress={() => setEmailConsent((v) => !v)} />
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.formBlock}>
                <Text style={styles.stepTitle}>{t('onb_prefs_title')}</Text>
                <Text style={styles.stepSub}>{t('onb_prefs_sub')}</Text>
                <View style={{ gap: 12, marginTop: 26 }}>
                  <PrefRow
                    on={settings.liveLocation}
                    onToggle={() => setSetting('liveLocation', !settings.liveLocation)}
                    title={t('onb_loc_title')}
                    sub={t('onb_loc_sub')}
                    icon={
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                        <Circle cx={12} cy={10} r={2.6} />
                      </Svg>
                    }
                  />
                  <PrefRow
                    on={settings.notifNearby}
                    onToggle={() => setSetting('notifNearby', !settings.notifNearby)}
                    title={t('onb_notif_title')}
                    sub={t('onb_notif_sub')}
                    icon={
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                        <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
                      </Svg>
                    }
                  />
                </View>
              </View>
            )}
          </View>

          {/* actions */}
          <View style={styles.actions}>
            <Pressable onPress={next} disabled={!canNext} style={{ opacity: canNext ? 1 : 0.5 }}>
              <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                <Text style={styles.ctaText}>
                  {step === 0 ? t('onb_start') : step === STEP_COUNT - 1 ? t('onb_finish') : t('onb_next')}
                </Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.subActions}>
              {step > 0 ? (
                <Pressable onPress={back} hitSlop={10}>
                  <Text style={styles.subActionText}>{t('onb_back')}</Text>
                </Pressable>
              ) : (
                <View />
              )}
              {step === 2 ? (
                <Pressable onPress={next} hitSlop={10}>
                  <Text style={styles.subActionText}>{t('onb_skip')}</Text>
                </Pressable>
              ) : (
                <View />
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 26 },
  progress: { flexDirection: 'row', gap: 7, justifyContent: 'center' },
  progressDot: { width: 26, height: 5, borderRadius: 3, backgroundColor: 'rgba(125,118,160,0.28)' },
  progressDotOn: { backgroundColor: colors.accent },

  body: { flex: 1, justifyContent: 'center' },
  centerBlock: { alignItems: 'center' },
  emblem: { width: 190, height: 190, marginBottom: 8 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.textPrimary, textAlign: 'center', letterSpacing: 0.5 },
  sub: { fontFamily: fonts.body, fontSize: 14.5, color: colors.textSecondary, textAlign: 'center', lineHeight: 21, marginTop: 12, maxWidth: 300 },

  formBlock: {},
  stepTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary },
  stepSub: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },

  fieldWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,92,138,0.2)', backgroundColor: 'rgba(20,13,40,0.6)', paddingHorizontal: 15 },
  fieldPrefix: { color: colors.textSecondary, fontSize: 15, fontFamily: fonts.body },
  fieldInput: { flex: 1, minWidth: 0, color: colors.textPrimary, fontSize: 15.5, paddingVertical: 14, fontFamily: fonts.body },

  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.panelSoft, padding: 15 },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 16, borderWidth: 1, borderColor: colors.panelBorder, backgroundColor: colors.panelSoft, padding: 13, marginTop: 4 },
  consentRowOff: { opacity: 0.4 },
  prefIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)', alignItems: 'center', justifyContent: 'center' },
  prefTitle: { color: colors.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 15 },
  prefSub: { color: colors.textSecondary, fontSize: 12.5, marginTop: 2, fontFamily: fonts.body, lineHeight: 16 },

  toggleTrack: { width: 46, height: 28 },
  toggleFill: { width: 46, height: 28, borderRadius: 16, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f3ecff' },

  actions: { gap: 14 },
  cta: { alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  ctaText: { color: colors.onAccent, fontFamily: fonts.bodyExtra, fontSize: 16 },
  subActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 20, paddingHorizontal: 6 },
  subActionText: { color: colors.textSoft, fontFamily: fonts.bodyBold, fontSize: 14 },
});
