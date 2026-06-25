import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';
import Slider from '@react-native-community/slider';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { profile } from '../data/profile';
import { useI18n, Lang, TKey } from '../i18n';

type SettingsState = {
  reqFrom: string;
  profilePublic: boolean;
  liveLocation: boolean;
  fuzzyLocation: boolean;
  highAccuracy: boolean;
  discoverRadius: number;
  notifNearby: boolean;
  notifFriend: boolean;
  notifUnearth: boolean;
  notifReminder: boolean;
  sound: boolean;
  haptics: boolean;
  defaultView: string;
  units: string;
  radarPulse: boolean;
  textSize: number;
  reduceMotion: boolean;
  offline: boolean;
};

const DEFAULTS: SettingsState = {
  reqFrom: 'amisamis',
  profilePublic: true,
  liveLocation: false,
  fuzzyLocation: true,
  highAccuracy: true,
  discoverRadius: 800,
  notifNearby: true,
  notifFriend: true,
  notifUnearth: true,
  notifReminder: false,
  sound: true,
  haptics: true,
  defaultView: 'map',
  units: 'm',
  radarPulse: true,
  textSize: 100,
  reduceMotion: false,
  offline: false,
};

type Row =
  | { type: 'toggle'; key: keyof SettingsState; label: string; sub?: string }
  | { type: 'segment'; key: keyof SettingsState; label: string; options: { label: string; v: string }[] }
  | { type: 'slider'; key: keyof SettingsState; label: string; min: number; max: number; step: number; fmt: (v: number) => string }
  | { type: 'link'; label: string; sub?: string; value?: string };

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useI18n();
  const [s, setS] = useState<SettingsState>(DEFAULTS);
  const [acctName, setAcctName] = useState(profile.name);
  const [acctHandle, setAcctHandle] = useState(profile.handle);
  const [acctEmail, setAcctEmail] = useState('toi@exemple.fr');
  const [acctPhone, setAcctPhone] = useState('+33 6 12 34 56 78');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ name: false, email: false, phone: false });

  const set = (key: keyof SettingsState, v: any) => setS((prev) => ({ ...prev, [key]: v }));
  const toggleExp = (k: string) => setExpanded((e) => ({ ...e, [k]: !e[k] }));

  const sections: { title: string; rows: Row[] }[] = [
    {
      title: t('sec_privacy'),
      rows: [
        { type: 'segment', key: 'reqFrom', label: t('sett_req_from'), options: [
          { label: t('opt_req_all'), v: 'tous' },
          { label: t('opt_req_fof'), v: 'amisamis' },
          { label: t('opt_req_none'), v: 'personne' },
        ] },
        { type: 'toggle', key: 'profilePublic', label: t('sett_profile_public'), sub: t('sett_profile_public_sub') },
        { type: 'toggle', key: 'liveLocation', label: t('sett_live_loc'), sub: t('sett_live_loc_sub') },
        { type: 'toggle', key: 'fuzzyLocation', label: t('sett_fuzzy'), sub: t('sett_fuzzy_sub') },
      ],
    },
    {
      title: t('sec_location'),
      rows: [
        { type: 'toggle', key: 'highAccuracy', label: t('sett_gps'), sub: t('sett_gps_sub') },
        { type: 'slider', key: 'discoverRadius', label: t('sett_radius'), min: 200, max: 2000, step: 100, fmt: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace('.0', '')} km` : `${v} m`) },
      ],
    },
    {
      title: t('sec_notif'),
      rows: [
        { type: 'toggle', key: 'notifNearby', label: t('sett_notif_nearby'), sub: t('sett_notif_nearby_sub') },
        { type: 'toggle', key: 'notifFriend', label: t('sett_notif_friend') },
        { type: 'toggle', key: 'notifUnearth', label: t('sett_notif_unearth'), sub: t('sett_notif_unearth_sub') },
        { type: 'toggle', key: 'notifReminder', label: t('sett_notif_remind'), sub: t('sett_notif_remind_sub') },
        { type: 'toggle', key: 'sound', label: t('sett_sound') },
        { type: 'toggle', key: 'haptics', label: t('sett_haptics') },
      ],
    },
    {
      title: t('sec_map'),
      rows: [
        { type: 'segment', key: 'defaultView', label: t('sett_default_view'), options: [
          { label: t('str_map'), v: 'map' },
          { label: t('str_radar'), v: 'radar' },
        ] },
        { type: 'segment', key: 'units', label: t('sett_units'), options: [
          { label: t('opt_meters'), v: 'm' },
          { label: t('opt_feet'), v: 'ft' },
        ] },
        { type: 'toggle', key: 'radarPulse', label: t('sett_radar_pulse'), sub: t('sett_radar_pulse_sub') },
      ],
    },
    {
      title: t('sec_appear'),
      rows: [
        { type: 'slider', key: 'textSize', label: t('sett_text_size'), min: 80, max: 130, step: 5, fmt: (v) => `${v} %` },
        { type: 'toggle', key: 'reduceMotion', label: t('sett_reduce_motion') },
      ],
    },
    {
      title: t('sec_data'),
      rows: [
        { type: 'toggle', key: 'offline', label: t('sett_offline'), sub: t('sett_offline_sub') },
        { type: 'link', label: t('sett_download'), sub: t('sett_download_sub') },
        { type: 'link', label: t('sett_cache'), value: '42 Mo' },
      ],
    },
    {
      title: t('sett_help'),
      rows: [
        { type: 'link', label: t('sett_help_center') },
        { type: 'link', label: t('sett_terms') },
        { type: 'link', label: t('sett_privacy') },
        { type: 'link', label: t('sett_version'), value: '2.4.0' },
      ],
    },
  ];

  const langOptions: { label: string; v: Lang }[] = [
    { label: 'Français', v: 'fr' },
    { label: 'English', v: 'en' },
    { label: 'Español', v: 'es' },
  ];

  return (
    <View style={styles.fill}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingTop: insets.top + 6, paddingHorizontal: 22, paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={onClose} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d6cde8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Polyline points="15 6 9 12 15 18" />
            </Svg>
          </Pressable>
          <Text style={styles.title}>{t('sett_title')}</Text>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>{t('sett_account')}</Text>
        <View style={styles.card}>
          <View style={styles.photoRow}>
            <View style={styles.photoAvatar}>
              <LinearGradient colors={['#5a2d70', '#7a3da0']} style={styles.photoAvatarBg}>
                <Text style={styles.photoAvatarText}>{acctName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.photoBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M5 8h2.5l1.2-2h6.6l1.2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
                  <Circle cx={12} cy={13} r={3} />
                </Svg>
              </View>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.rowLabel}>{t('sett_profile_photo')}</Text>
              <Text style={styles.rowSub}>{t('sett_photo_sub')}</Text>
            </View>
            <Pressable style={styles.editBtn}>
              <Text style={styles.editBtnText}>{t('sett_photo_edit')}</Text>
            </Pressable>
          </View>

          <AccountField label={t('acct_name')} expanded={expanded.name} collapsedValue={`${acctName} · @${acctHandle}`} onToggle={() => toggleExp('name')}>
            <FieldInput value={acctName} onChange={setAcctName} placeholder={t('ph_your_name')} />
            <FieldInput value={acctHandle} onChange={setAcctHandle} placeholder={t('ph_handle')} prefix="@" />
          </AccountField>
          <AccountField label={t('acct_email')} expanded={expanded.email} collapsedValue={acctEmail} onToggle={() => toggleExp('email')}>
            <FieldInput value={acctEmail} onChange={setAcctEmail} placeholder={t('acct_email')} />
          </AccountField>
          <AccountField label={t('acct_phone')} expanded={expanded.phone} collapsedValue={acctPhone} onToggle={() => toggleExp('phone')}>
            <FieldInput value={acctPhone} onChange={setAcctPhone} placeholder={t('acct_phone')} />
          </AccountField>
        </View>

        {/* generated sections */}
        {sections.map((sec) => (
          <View key={sec.title}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            <View style={styles.card}>
              {sec.rows.map((row, i) => (
                <View key={i} style={[styles.rowWrap, i > 0 && styles.rowDivider]}>
                  {row.type === 'toggle' && (
                    <View style={styles.toggleRow}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        {!!row.sub && <Text style={styles.rowSub}>{row.sub}</Text>}
                      </View>
                      <Toggle on={!!s[row.key]} onPress={() => set(row.key, !s[row.key])} />
                    </View>
                  )}
                  {row.type === 'segment' && (
                    <View>
                      <Text style={styles.rowLabel}>{row.label}</Text>
                      <Segment options={row.options} value={String(s[row.key])} onSelect={(v) => set(row.key, v)} />
                    </View>
                  )}
                  {row.type === 'slider' && (
                    <View>
                      <View style={styles.sliderHead}>
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        <Text style={styles.sliderValue}>{row.fmt(Number(s[row.key]))}</Text>
                      </View>
                      <Slider
                        style={{ width: '100%', height: 34, marginTop: 6 }}
                        minimumValue={row.min}
                        maximumValue={row.max}
                        step={row.step}
                        value={Number(s[row.key])}
                        minimumTrackTintColor={colors.accent}
                        maximumTrackTintColor="rgba(125,118,160,0.3)"
                        thumbTintColor={colors.gold}
                        onValueChange={(v) => set(row.key, v)}
                      />
                    </View>
                  )}
                  {row.type === 'link' && (
                    <Pressable style={styles.linkRow}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowLabel}>{row.label}</Text>
                        {!!row.sub && <Text style={styles.rowSub}>{row.sub}</Text>}
                      </View>
                      {!!row.value && <Text style={styles.linkValue}>{row.value}</Text>}
                      <Chevron />
                    </Pressable>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* APPEARANCE language (drives i18n) */}
        <Text style={styles.sectionTitle}>{t('sett_lang').toUpperCase()}</Text>
        <View style={styles.card}>
          <View style={styles.rowWrap}>
            <Text style={styles.rowLabel}>{t('sett_lang')}</Text>
            <Segment options={langOptions} value={lang} onSelect={(v) => setLang(v as Lang)} />
          </View>
        </View>

        {/* actions */}
        <View style={{ marginTop: 26, gap: 11 }}>
          <Pressable onPress={onClose} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t('sett_logout')}</Text>
          </Pressable>
          <Pressable style={styles.deleteBtn}>
            <Text style={styles.deleteText}>{t('sett_delete')}</Text>
          </Pressable>
        </View>
        <Text style={styles.footer}>{t('sett_footer')}</Text>
      </ScrollView>
    </View>
  );
}

function AccountField({ label, collapsedValue, expanded, onToggle, children }: { label: string; collapsedValue: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.rowDivider}>
      <Pressable onPress={onToggle} style={styles.acctHead}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {!expanded && <Text style={styles.rowSub} numberOfLines={1}>{collapsedValue}</Text>}
        </View>
        <View style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}>
          <Chevron />
        </View>
      </Pressable>
      {expanded && <View style={styles.acctInputs}>{children}</View>}
    </View>
  );
}

function FieldInput({ value, onChange, placeholder, prefix }: { value: string; onChange: (v: string) => void; placeholder: string; prefix?: string }) {
  return (
    <View style={styles.fieldInputWrap}>
      {!!prefix && <Text style={styles.fieldPrefix}>{prefix}</Text>}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        style={styles.fieldInput}
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

function Segment({ options, value, onSelect }: { options: { label: string; v: string }[]; value: string; onSelect: (v: string) => void }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <Pressable key={o.v} onPress={() => onSelect(o.v)} style={[styles.segmentBtn, on && styles.segmentBtnActive]}>
            <Text style={[styles.segmentText, on && styles.segmentTextActive]} numberOfLines={1}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Chevron() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={colors.chevron} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 6 15 12 9 18" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: colors.bg },
  screen: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary },
  sectionTitle: { marginTop: 22, fontSize: 12, color: colors.textMuted, fontFamily: fonts.bodyBold, letterSpacing: 0.7 },
  card: { marginTop: 10, borderRadius: 18, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder, overflow: 'hidden' },

  photoRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  photoAvatar: { width: 52, height: 52 },
  photoAvatarBg: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)' },
  photoAvatarText: { fontFamily: fonts.display, fontSize: 25, color: colors.gold },
  photoBadge: { position: 'absolute', bottom: -3, right: -3, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, borderWidth: 2, borderColor: '#241845', alignItems: 'center', justifyContent: 'center' },
  editBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 11, backgroundColor: colors.accentDim, borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)' },
  editBtnText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 13 },

  acctHead: { padding: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  acctInputs: { paddingHorizontal: 16, paddingBottom: 15, gap: 9 },
  fieldInputWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,92,138,0.2)', backgroundColor: 'rgba(20,13,40,0.6)', paddingHorizontal: 13 },
  fieldPrefix: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.body },
  fieldInput: { flex: 1, minWidth: 0, color: colors.textPrimary, fontSize: 14.5, paddingVertical: 11, fontFamily: fonts.body },

  rowWrap: { padding: 13, paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: 'rgba(255,92,138,0.08)' },
  rowLabel: { color: colors.textPrimary, fontFamily: fonts.bodyMedium, fontSize: 14.5 },
  rowSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2, fontFamily: fonts.body, lineHeight: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  toggleTrack: { width: 46, height: 28 },
  toggleFill: { width: 46, height: 28, borderRadius: 16, padding: 3, justifyContent: 'center' },
  toggleKnob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#f3ecff' },

  segment: { flexDirection: 'row', backgroundColor: 'rgba(20,13,40,0.5)', borderWidth: 1, borderColor: 'rgba(255,92,138,0.1)', borderRadius: 12, padding: 3, marginTop: 11 },
  segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 9 },
  segmentBtnActive: { backgroundColor: colors.accentDim },
  segmentText: { fontSize: 12.5, fontFamily: fonts.bodyBold, color: colors.textSecondary },
  segmentTextActive: { color: colors.gold },

  sliderHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sliderValue: { color: colors.gold, fontFamily: fonts.display, fontSize: 19 },

  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkValue: { color: colors.textMuted, fontSize: 13, fontFamily: fonts.body },

  logoutBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 15, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder },
  logoutText: { color: '#d6cde8', fontFamily: fonts.bodyBold, fontSize: 14.5 },
  deleteBtn: { alignItems: 'center', paddingVertical: 14, borderRadius: 15, backgroundColor: 'rgba(255,90,110,0.08)', borderWidth: 1, borderColor: 'rgba(255,90,110,0.28)' },
  deleteText: { color: '#ff5a6e', fontFamily: fonts.bodyBold, fontSize: 14.5 },
  footer: { textAlign: 'center', color: colors.placeholder, fontSize: 11.5, marginTop: 18, fontFamily: fonts.body },
});
