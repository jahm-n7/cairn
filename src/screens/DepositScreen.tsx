import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { friends as ALL_FRIENDS, circles as ALL_CIRCLES } from '../data/profile';
import { useI18n, TKey } from '../i18n';

type Media = 'Audio' | 'Photo' | 'Vidéo';
type CamMode = 'Photo' | 'Vidéo';
type Access = 'private' | 'friends' | 'public';

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

type Draft = {
  media: Media | null;
  captured: boolean;
  message: string;
  access: Access | null;
  friends: string[];
  circles: string[];
  useDate: boolean;
  date: string;
  useRiddle: boolean;
  riddleQ: string;
  riddleA: string;
};

const emptyDraft = (): Draft => ({
  media: null,
  captured: false,
  message: '',
  access: null,
  friends: [],
  circles: [],
  useDate: false,
  date: '',
  useRiddle: false,
  riddleQ: '',
  riddleA: '',
});

const FREE_PEOPLE = 5;

export default function DepositScreen({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [buried, setBuried] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  // capture (step 1) local state
  const [camMode, setCamMode] = useState<CamMode>('Photo');
  const [audioMode, setAudioMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [audioDur, setAudioDur] = useState(3);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [playPos, setPlayPos] = useState(0);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  const clearTimers = () => {
    if (recTimer.current) clearInterval(recTimer.current);
    if (playTimer.current) clearInterval(playTimer.current);
    recTimer.current = null;
    playTimer.current = null;
  };

  useEffect(() => () => clearTimers(), []);

  const resetCapture = () => {
    clearTimers();
    setAudioMode(false);
    setRecording(false);
    setRecSeconds(0);
    setAudioPlaying(false);
    setPlayPos(0);
  };

  const reset = () => {
    setStep(1);
    setBuried(false);
    setDraft(emptyDraft());
    setCamMode('Photo');
    resetCapture();
  };

  const finish = () => {
    reset();
    onDone();
  };

  // --- capture handlers ---
  const shutter = () => {
    patch({ media: camMode, captured: true });
  };

  const startRec = () => {
    if (recording) return;
    setRecording(true);
    setRecSeconds(0);
    recTimer.current = setInterval(() => setRecSeconds((s) => s + 0.1), 100);
  };

  const stopRec = () => {
    if (!recording) return;
    if (recTimer.current) clearInterval(recTimer.current);
    recTimer.current = null;
    setRecording(false);
    setRecSeconds((held) => {
      if (held >= 0.4) {
        setAudioMode(false);
        setPlayPos(0);
        setAudioPlaying(false);
        setAudioDur(Math.max(1, Math.round(held)));
        patch({ media: 'Audio', captured: true });
      }
      return 0;
    });
  };

  const togglePlay = () => {
    if (audioPlaying) {
      if (playTimer.current) clearInterval(playTimer.current);
      playTimer.current = null;
      setAudioPlaying(false);
      return;
    }
    setAudioPlaying(true);
    setPlayPos(0);
    const stepInc = 0.1 / Math.max(1, audioDur);
    playTimer.current = setInterval(() => {
      setPlayPos((p) => {
        const next = p + stepInc;
        if (next >= 1) {
          if (playTimer.current) clearInterval(playTimer.current);
          playTimer.current = null;
          setAudioPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
  };

  const redoCapture = () => {
    clearTimers();
    setAudioMode(draft.media === 'Audio');
    setRecSeconds(0);
    setAudioPlaying(false);
    setPlayPos(0);
    patch({ captured: false });
  };

  if (buried) {
    return (
      <View style={[styles.successWrap, { paddingTop: insets.top }]}>
        <LinearGradient colors={goldPinkGradient} style={styles.successOrb}>
          <Svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="5 13 10 18 19 6" />
          </Svg>
        </LinearGradient>
        <Text style={styles.successTitle}>{t('cap_buried')}</Text>
        <Text style={styles.successSub}>{t('buried_sub')}</Text>
        <Pressable onPress={finish}>
          <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.successBtn}>
            <Text style={styles.successBtnText}>{t('btn_done')}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  const cCamera = step === 1 && !draft.captured && !audioMode;
  const cAudioRec = step === 1 && audioMode && !draft.captured;
  const cAudioDone = step === 1 && draft.captured && draft.media === 'Audio';
  const cCaptured = step === 1 && draft.captured && draft.media !== 'Audio';
  const canBack = (step === 1 && (draft.captured || audioMode)) || (step > 1 && step <= 4);
  const showContinue = step <= 3 && !(step === 1 && !draft.captured);

  const onBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (draft.captured) {
      redoCapture();
    } else if (audioMode) {
      resetCapture();
    }
  };

  const friendsAtMax = draft.friends.length >= FREE_PEOPLE;

  const toggleFriend = (name: string) =>
    setDraft((d) => {
      const has = d.friends.includes(name);
      if (!has && d.friends.length >= FREE_PEOPLE) return d;
      return { ...d, friends: has ? d.friends.filter((x) => x !== name) : [...d.friends, name] };
    });

  const toggleCircle = (cid: string) =>
    setDraft((d) => {
      const members = ALL_FRIENDS.filter((f) => f.circles.includes(cid)).map((f) => f.name);
      const on = d.circles.includes(cid);
      if (on) {
        return {
          ...d,
          circles: d.circles.filter((x) => x !== cid),
          friends: d.friends.filter((n) => !members.includes(n)),
        };
      }
      const friends = [...d.friends];
      members.forEach((n) => {
        if (!friends.includes(n) && friends.length < FREE_PEOPLE) friends.push(n);
      });
      return { ...d, circles: [...d.circles, cid], friends };
    });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 6 }]}>
      {/* header — just a back button */}
      <View style={styles.header}>
        {canBack && (
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Polyline points="15 6 9 12 15 18" />
            </Svg>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {cCamera && (
          <View style={{ flex: 1, gap: 16 }}>
            {/* viewfinder */}
            <View style={styles.viewfinder}>
              {/* rule-of-thirds grid */}
              <View style={[styles.gridLine, { left: '33.3%', top: 0, bottom: 0, width: 1 }]} />
              <View style={[styles.gridLine, { left: '66.6%', top: 0, bottom: 0, width: 1 }]} />
              <View style={[styles.gridLine, { top: '33.3%', left: 0, right: 0, height: 1 }]} />
              <View style={[styles.gridLine, { top: '66.6%', left: 0, right: 0, height: 1 }]} />
              {/* corner brackets */}
              <View style={[styles.bracket, { top: 16, left: 16, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 5 }]} />
              <View style={[styles.bracket, { top: 16, right: 16, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 5 }]} />
              <View style={[styles.bracket, { bottom: 16, left: 16, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 5 }]} />
              <View style={[styles.bracket, { bottom: 16, right: 16, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 5 }]} />
              {/* focus reticle */}
              <View style={styles.reticle} />
              {/* status pill */}
              <View style={styles.camStatusWrap}>
                <View style={styles.camStatusPill}>
                  {camMode === 'Vidéo' ? (
                    <View style={styles.recDot} />
                  ) : (
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                      <Circle cx={12} cy={10} r={2.4} />
                    </Svg>
                  )}
                  <Text style={styles.camStatusText}>
                    {camMode === 'Vidéo' ? t('cam_status_video') : t('cam_status_photo')}
                  </Text>
                </View>
              </View>
              <Text style={styles.camHint}>
                {camMode === 'Vidéo' ? t('cam_hint_video') : t('cam_hint_photo')}
              </Text>
            </View>

            {/* mode toggle */}
            <View style={styles.camModeToggle}>
              <Pressable onPress={() => setCamMode('Photo')} style={[styles.camPill, camMode === 'Photo' && styles.camPillActive]}>
                <Text style={[styles.camPillText, camMode === 'Photo' && styles.camPillTextActive]}>{t('media_photo')}</Text>
              </Pressable>
              <Pressable onPress={() => setCamMode('Vidéo')} style={[styles.camPill, camMode === 'Vidéo' && styles.camPillActive]}>
                <Text style={[styles.camPillText, camMode === 'Vidéo' && styles.camPillTextActive]}>{t('media_video')}</Text>
              </Pressable>
            </View>

            {/* controls: mic / shutter / flip */}
            <View style={styles.camControls}>
              <Pressable onPress={() => setAudioMode(true)} style={styles.camSideBtn}>
                <View style={styles.camSideCircle}>
                  <MediaIcon media="Audio" size={23} color="#ff9ec0" />
                </View>
                <Text style={styles.camSideLabel}>{t('media_audio')}</Text>
              </Pressable>

              <Pressable onPress={shutter} style={styles.shutter}>
                <View style={styles.shutterRing} />
                {camMode === 'Photo' ? (
                  <View style={styles.shutterInnerPhoto} />
                ) : (
                  <View style={styles.shutterInnerVideo} />
                )}
              </Pressable>

              <Pressable style={styles.camSideBtn}>
                <View style={[styles.camSideCircle, { borderColor: 'rgba(255,92,138,0.16)' }]}>
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#bca9d6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M3 7h13l-2.5-2.5M21 17H8l2.5 2.5" />
                  </Svg>
                </View>
                <Text style={[styles.camSideLabel, { color: colors.chevron }]}>{t('cam_flip')}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {cAudioRec && (
          <View style={styles.audioWrap}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.audioTitle}>{t('audio_title')}</Text>
              <Text style={styles.audioInstruction}>
                {recording ? t('audio_recording') : t('audio_hold')}
              </Text>
            </View>
            <Pressable
              onPressIn={startRec}
              onPressOut={stopRec}
              style={styles.recBtnWrap}
            >
              {recording && (
                <>
                  <View style={styles.recPulse} />
                  <View style={styles.recPulseInner} />
                </>
              )}
              <LinearGradient colors={goldPinkGradient} style={[styles.recOrb, recording && { transform: [{ scale: 1.08 }] }]}>
                <MediaIcon media="Audio" size={48} color={colors.onAccent} />
              </LinearGradient>
            </Pressable>
            <Text style={[styles.recTime, { color: recording ? colors.gold : colors.chevron }]}>
              {fmtTime(recSeconds)}
            </Text>
          </View>
        )}

        {cAudioDone && (
          <View style={styles.audioWrap}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.audioTitle}>{t('audio_title')}</Text>
              <Text style={styles.audioInstruction}>{t('audio_done_hint')}</Text>
            </View>
            <Pressable onPress={togglePlay} style={styles.recBtnWrap}>
              <View style={styles.playRing} />
              <LinearGradient colors={goldPinkGradient} style={styles.recOrb}>
                {audioPlaying ? (
                  <Svg width={42} height={42} viewBox="0 0 24 24" fill={colors.onAccent}>
                    <Rect x={6} y={5} width={4} height={14} rx={1} />
                    <Rect x={14} y={5} width={4} height={14} rx={1} />
                  </Svg>
                ) : (
                  <Svg width={46} height={46} viewBox="0 0 24 24" fill={colors.onAccent}>
                    <Polygon points="8 5 19 12 8 19" />
                  </Svg>
                )}
              </LinearGradient>
            </Pressable>
            <Text style={[styles.recTime, { color: colors.gold }]}>
              {fmtTime(audioPlaying ? playPos * audioDur : audioDur)}
            </Text>
            <Pressable onPress={redoCapture} style={styles.redoPill}>
              <MediaIcon media="Audio" size={16} color={colors.textPrimary} />
              <Text style={styles.redoPillText}>{t('redo_capture')}</Text>
            </Pressable>
          </View>
        )}

        {cCaptured && (
          <View style={{ flex: 1, gap: 16 }}>
            <View style={styles.capturedCard}>
              <View style={styles.visualPreview}>
                <View style={styles.visualIcon}>
                  {draft.media === 'Photo' ? (
                    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <Rect x={4} y={5} width={16} height={14} rx={2} />
                      <Circle cx={9} cy={10} r={1.6} />
                      <Path d="M5 17l5-5 4 4 2-2 3 3" />
                    </Svg>
                  ) : (
                    <Svg width={26} height={26} viewBox="0 0 24 24" fill={colors.textPrimary}>
                      <Polygon points="9 7 18 12 9 17" />
                    </Svg>
                  )}
                </View>
              </View>
              <View style={styles.capturedFooter}>
                <View style={styles.capturedCheck}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Polyline points="5 13 10 18 19 6" />
                  </Svg>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.capturedTitle}>
                    {draft.media === 'Photo' ? t('cap_photo') : t('cap_video')}
                  </Text>
                  <Text style={styles.capturedMeta}>
                    {draft.media === 'Photo' ? t('cap_photo_meta') : t('cap_video_meta')}
                  </Text>
                </View>
                <Pressable onPress={redoCapture} style={styles.redoInline}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Polyline points="1 4 1 10 7 10" />
                    <Path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
                  </Svg>
                  <Text style={styles.redoInlineText}>{t('redo_capture')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 12 }}>
            <AccessCard
              selected={draft.access === 'private'}
              title={t('access_private')}
              sub={t('access_private_sub')}
              icon="lock"
              onPress={() => patch({ access: 'private' })}
            />
            <AccessCard
              selected={draft.access === 'friends'}
              title={t('access_friends')}
              sub={t('access_friends_sub')}
              icon="friends"
              onPress={() => patch({ access: 'friends' })}
            />
            {draft.access === 'friends' && (
              <View style={{ marginTop: 2 }}>
                <Text style={styles.miniLabel}>{t('open_to_circle')}</Text>
                <View style={styles.chipWrap}>
                  {ALL_CIRCLES.map((c) => {
                    const on = draft.circles.includes(c.id);
                    const count = ALL_FRIENDS.filter((f) => f.circles.includes(c.id)).length;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => toggleCircle(c.id)}
                        style={[styles.selChip, { backgroundColor: on ? colors.accentDim : colors.panelSoft, borderColor: on ? colors.accent : colors.panelBorderMid }]}
                      >
                        <Svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={on ? colors.gold : colors.textPrimary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                          <Circle cx={9} cy={8} r={3.2} />
                          <Path d="M3 19c0-3 3-4.5 6-4.5s6 1.5 6 4.5" />
                          <Path d="M16 5.5a3 3 0 0 1 0 5.6" />
                          <Path d="M18 14.5c2 .6 3 1.9 3 4.5" />
                        </Svg>
                        <Text style={[styles.selChipText, { color: on ? colors.gold : colors.textPrimary }]}>{c.name}</Text>
                        <Text style={styles.selChipCount}>
                          {count} {count > 1 ? t('member_plur') : t('member_sing')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.miniLabel}>{t('circle_section')}</Text>
                  <Text style={[styles.limitLabel, { color: friendsAtMax ? colors.accent : colors.textMuted }]}>
                    {draft.friends.length}/{FREE_PEOPLE}
                  </Text>
                </View>
                <View style={styles.chipWrap}>
                  {ALL_FRIENDS.map((f) => {
                    const on = draft.friends.includes(f.name);
                    const locked = friendsAtMax && !on;
                    return (
                      <Pressable
                        key={f.id}
                        onPress={() => toggleFriend(f.name)}
                        style={[styles.friendChip, { backgroundColor: on ? colors.accentDim : colors.panelSoft, borderColor: on ? colors.accent : colors.panelBorderMid, opacity: locked ? 0.4 : 1 }]}
                      >
                        <View style={[styles.friendChipAvatar, { backgroundColor: f.color }]}>
                          <Text style={styles.friendChipInitials}>{f.initials}</Text>
                        </View>
                        <Text style={styles.friendChipName}>{f.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            <AccessCard
              selected={draft.access === 'public'}
              title={t('access_public')}
              sub={t('access_public_sub')}
              icon="globe"
              onPress={() => patch({ access: 'public' })}
            />
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 15 }}>
            <View style={styles.condRow}>
              <View style={styles.condIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                  <Circle cx={12} cy={10} r={2.4} />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.condTitle}>{t('cond_location')}</Text>
                <Text style={styles.condSub}>Parc de la Tête d'Or · {t('loc_mandatory')}</Text>
              </View>
              <Text style={styles.condEnabled}>{t('cond_enabled')}</Text>
            </View>

            <View style={styles.condBlock}>
              <View style={styles.condBlockHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.condTitle}>{t('cond_date')}</Text>
                  <Text style={styles.condSub}>{t('cond_date_sub')}</Text>
                </View>
                <Toggle on={draft.useDate} onPress={() => patch({ useDate: !draft.useDate })} />
              </View>
              {draft.useDate && (
                <TextInput
                  value={draft.date}
                  onChangeText={(val) => patch({ date: val })}
                  placeholder={t('date_ph')}
                  placeholderTextColor={colors.placeholder}
                  style={styles.condInput}
                />
              )}
            </View>

            <View style={styles.condBlock}>
              <View style={styles.condBlockHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.condTitle}>{t('cond_riddle')}</Text>
                  <Text style={styles.condSub}>{t('cond_riddle_sub')}</Text>
                </View>
                <Toggle on={draft.useRiddle} onPress={() => patch({ useRiddle: !draft.useRiddle })} />
              </View>
              {draft.useRiddle && (
                <View style={{ gap: 10, marginTop: 13 }}>
                  <TextInput
                    value={draft.riddleQ}
                    onChangeText={(val) => patch({ riddleQ: val })}
                    placeholder={t('riddle_q_ph')}
                    placeholderTextColor={colors.placeholder}
                    style={styles.condInput}
                  />
                  <TextInput
                    value={draft.riddleA}
                    onChangeText={(val) => patch({ riddleA: val })}
                    placeholder={t('riddle_a_ph')}
                    placeholderTextColor={colors.placeholder}
                    style={styles.condInput}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 13 }}>
            <ReviewCard label={t('lbl_content')}>
              <Text style={styles.reviewValue}>
                {draft.media
                  ? t(draft.media === 'Audio' ? 'media_audio' : draft.media === 'Photo' ? 'media_photo' : 'media_video')
                  : t('no_media')}
              </Text>
              <View style={styles.wordRow}>
                <Text style={styles.miniLabel}>{t('word_to_leave')}</Text>
                <View style={styles.optionalChip}>
                  <Text style={styles.optionalText}>{t('rec_optional')}</Text>
                </View>
              </View>
              <TextInput
                value={draft.message}
                onChangeText={(val) => patch({ message: val })}
                placeholder={t('message_ph')}
                placeholderTextColor={colors.placeholder}
                multiline
                style={styles.reviewTextarea}
              />
            </ReviewCard>
            <ReviewCard label={t('lbl_access')}>
              <Text style={styles.reviewValue}>{accessReview(draft, t)}</Text>
            </ReviewCard>
            <ReviewCard label={t('lbl_conditions')}>
              <Text style={styles.reviewValue}>Parc de la Tête d'Or · {condReview(draft, t)}</Text>
            </ReviewCard>
          </View>
        )}
      </ScrollView>

      {/* footer */}
      <View style={[styles.footer, { paddingBottom: 16 }]}>
        {step === 4 ? (
          <Pressable onPress={() => setBuried(true)}>
            <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buryBtn}>
              <Text style={styles.buryText}>{t('btn_bury')}</Text>
            </LinearGradient>
          </Pressable>
        ) : showContinue ? (
          <Pressable onPress={() => setStep(Math.min(4, step + 1))} style={styles.continueBtn}>
            <Text style={styles.continueText}>{t('btn_continue')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

type T = (key: TKey, vars?: Record<string, string | number>) => string;

function accessReview(d: Draft, t: T): string {
  if (d.access === 'private') return t('ar_private');
  if (d.access === 'public') return t('ar_public');
  if (d.access === 'friends') {
    const circleNames = d.circles
      .map((cid) => ALL_CIRCLES.find((c) => c.id === cid)?.name)
      .filter(Boolean) as string[];
    return (
      t('ar_friends') +
      (d.friends.length ? d.friends.join(', ') : t('ar_none')) +
      (circleNames.length ? t('ar_circles') + circleNames.join(', ') : '')
    );
  }
  return t('ar_undefined');
}

function condReview(d: Draft, t: T): string {
  const parts: string[] = [];
  if (d.useDate) parts.push(d.date ? t('cond_since') + d.date : t('cond_datetime'));
  if (d.useRiddle) parts.push(t('cond_riddle_word'));
  return parts.length ? parts.join(' · ') : t('cond_presence');
}

function MediaIcon({ media, size, color }: { media: Media; size: number; color: string }) {
  if (media === 'Audio')
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={9} y={3} width={6} height={11} rx={3} />
        <Path d="M5 11a7 7 0 0 0 14 0" />
        <Line x1={12} y1={18} x2={12} y2={21} />
      </Svg>
    );
  if (media === 'Photo')
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={4} y={5} width={16} height={14} rx={2} />
        <Circle cx={9} cy={10} r={1.6} />
        <Path d="M5 17l5-5 4 4 2-2 3 3" />
      </Svg>
    );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={6} width={12} height={12} rx={2} />
      <Polygon points="16 9 21 7 21 17 16 15" />
    </Svg>
  );
}

function FormatCard({ title, sub, onPress, icon }: { title: string; sub: string; onPress: () => void; icon: 'audio' | 'photo' | 'video' }) {
  const media: Media = icon === 'audio' ? 'Audio' : icon === 'photo' ? 'Photo' : 'Vidéo';
  return (
    <Pressable onPress={onPress} style={styles.formatCard}>
      <View style={styles.formatIcon}>
        <MediaIcon media={media} size={27} color={colors.accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.formatTitle}>{title}</Text>
        <Text style={styles.formatSub}>{sub}</Text>
      </View>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.chevron} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="9 6 15 12 9 18" />
      </Svg>
    </Pressable>
  );
}

function AccessCard({ selected, title, sub, icon, onPress }: { selected: boolean; title: string; sub: string; icon: 'lock' | 'friends' | 'globe'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.accessCard, { backgroundColor: selected ? colors.accentDimSoft : colors.panelSoft, borderColor: selected ? colors.accent : colors.panelBorderMid }]}
    >
      <View style={styles.accessIcon}>
        {icon === 'lock' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Rect x={5} y={11} width={14} height={9} rx={2} />
            <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </Svg>
        )}
        {icon === 'friends' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={9} cy={8} r={3.2} />
            <Path d="M3 19c0-3 3-4.5 6-4.5s6 1.5 6 4.5" />
            <Path d="M16 5.5a3 3 0 0 1 0 5.6" />
            <Path d="M18 14.5c2 .6 3 1.9 3 4.5" />
          </Svg>
        )}
        {icon === 'globe' && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={12} cy={12} r={9} />
            <Path d="M3 12h18" />
            <Path d="M12 3c2.6 2.5 2.6 15 0 18M12 3c-2.6 2.5-2.6 15 0 18" />
          </Svg>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.accessTitle}>{title}</Text>
        <Text style={styles.accessSub}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggleTrack, { backgroundColor: on ? colors.accent : 'rgba(255,255,255,0.12)' }]}>
      <View style={[styles.toggleKnob, { left: on ? 22 : 3 }]} />
    </Pressable>
  );
}

function ReviewCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 22, paddingBottom: 10 },
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
  eyebrow: { fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: colors.accent, fontFamily: fonts.bodyBold },
  stepTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary, marginTop: 1, lineHeight: 27 },
  body: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 10 },

  // format cards
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    padding: 20,
    backgroundColor: colors.panelFaint,
    borderWidth: 1.5,
    borderColor: colors.panelBorderStrong,
  },
  formatIcon: { width: 54, height: 54, borderRadius: 17, backgroundColor: colors.accentDimSoft, alignItems: 'center', justifyContent: 'center' },
  formatTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.textPrimary },
  formatSub: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2, fontFamily: fonts.body },
  centerHint: { marginTop: 6, textAlign: 'center', fontSize: 12.5, color: colors.textSecondary, lineHeight: 19, fontFamily: fonts.body },

  // record
  recordCard: {
    borderRadius: 22,
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: colors.panelFaint,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    alignItems: 'center',
    gap: 16,
  },
  recordOrbWrap: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  recordOrb: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  recordOrbDone: { width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center' },
  recordHint: { fontSize: 13.5, color: colors.textSoft, lineHeight: 20, textAlign: 'center', maxWidth: 240, fontFamily: fonts.body },
  capturedTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.textPrimary },
  capturedMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1, fontFamily: fonts.body },
  redo: { fontSize: 13, color: colors.gold, fontFamily: fonts.bodyBold },

  // camera viewfinder
  viewfinder: {
    flex: 1,
    minHeight: 230,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#1d1238',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.2)',
  },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)' },
  bracket: { position: 'absolute', width: 24, height: 24, borderColor: 'rgba(255,212,92,0.55)' },
  reticle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 74,
    height: 74,
    marginTop: -37,
    marginLeft: -37,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 12,
  },
  camStatusWrap: { position: 'absolute', top: 14, left: 0, right: 0, alignItems: 'center' },
  camStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(20,13,40,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.2)',
    borderRadius: 30,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentDeep },
  camStatusText: { fontSize: 11.5, color: '#e9def7', fontFamily: fonts.bodyBold },
  camHint: { position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 11.5, color: 'rgba(233,222,247,0.55)', fontFamily: fonts.body },
  camModeToggle: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 30,
    padding: 4,
  },
  camPill: { paddingHorizontal: 22, paddingVertical: 8, borderRadius: 24 },
  camPillActive: { backgroundColor: colors.accentDim },
  camPillText: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.textSecondary },
  camPillTextActive: { color: colors.gold },
  camControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 4 },
  camSideBtn: { alignItems: 'center', gap: 6, width: 64 },
  camSideCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camSideLabel: { fontSize: 11, color: colors.textSoft, fontFamily: fonts.bodyBold },
  shutter: { width: 84, height: 84, alignItems: 'center', justifyContent: 'center' },
  shutterRing: { position: 'absolute', width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: 'rgba(255,255,255,0.92)' },
  shutterInnerPhoto: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  shutterInnerVideo: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.accentDeep },

  // audio record / play
  audioWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 34, paddingBottom: 10 },
  audioTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.textPrimary },
  audioInstruction: { fontSize: 13, color: colors.textSoft, marginTop: 5, fontFamily: fonts.body },
  recBtnWrap: { width: 172, height: 172, alignItems: 'center', justifyContent: 'center' },
  recPulse: { position: 'absolute', width: 172, height: 172, borderRadius: 86, backgroundColor: 'rgba(255,92,138,0.18)' },
  recPulseInner: { position: 'absolute', width: 136, height: 136, borderRadius: 68, backgroundColor: 'rgba(255,212,92,0.14)' },
  recOrb: { width: 124, height: 124, borderRadius: 62, alignItems: 'center', justifyContent: 'center' },
  playRing: { position: 'absolute', width: 172, height: 172, borderRadius: 86, borderWidth: 6, borderColor: 'rgba(255,92,138,0.18)' },
  recTime: { fontFamily: fonts.display, fontSize: 22, letterSpacing: 1 },
  redoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 30,
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderColor: colors.panelBorderMid,
  },
  redoPillText: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 13.5 },

  // captured visual preview
  capturedCard: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.panelFaint,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
  },
  visualPreview: { height: 200, backgroundColor: '#2d1e44', alignItems: 'center', justifyContent: 'center' },
  visualIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(20,13,40,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,92,138,0.14)',
  },
  capturedCheck: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  redoInline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  redoInlineText: { fontSize: 12.5, color: colors.gold, fontFamily: fonts.bodyBold },
  reviewTextarea: {
    marginTop: 8,
    minHeight: 76,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: 'rgba(20,13,40,0.6)',
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
    fontFamily: fonts.display,
    textAlignVertical: 'top',
  },

  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  miniLabel: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.bodyBold, letterSpacing: 0.5 },
  optionalChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  optionalText: { fontSize: 10, color: colors.textViolet, fontFamily: fonts.body },
  textarea: {
    marginTop: 8,
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.panelBorderMid,
    backgroundColor: colors.panelSoft,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
    fontFamily: fonts.display,
    textAlignVertical: 'top',
  },

  // access
  accessCard: { borderRadius: 18, padding: 18, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: 14 },
  accessIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.accentDimSoft, alignItems: 'center', justifyContent: 'center' },
  accessTitle: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15 },
  accessSub: { color: colors.textSecondary, fontSize: 12.5, marginTop: 1, fontFamily: fonts.body },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 9 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 0 },
  limitLabel: { fontSize: 12, fontFamily: fonts.bodyBold },
  selChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 30, borderWidth: 1.5 },
  selChipText: { fontSize: 13.5, fontFamily: fonts.bodyBold },
  selChipCount: { fontSize: 11.5, color: colors.textMuted, fontFamily: fonts.body },
  friendChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, paddingLeft: 7, paddingRight: 13, borderRadius: 30, borderWidth: 1.5 },
  friendChipAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  friendChipInitials: { color: colors.textPrimary, fontSize: 12, fontFamily: fonts.bodyBold },
  friendChipName: { fontSize: 13.5, color: colors.textPrimary, fontFamily: fonts.bodyMedium },

  // conditions
  condRow: { borderRadius: 18, padding: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid, flexDirection: 'row', alignItems: 'center', gap: 13 },
  condIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.accentDimSoft, alignItems: 'center', justifyContent: 'center' },
  condTitle: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14.5 },
  condSub: { color: colors.textSecondary, fontSize: 12, marginTop: 1, fontFamily: fonts.body },
  condEnabled: { fontSize: 11, color: colors.positive, fontFamily: fonts.bodyBold },
  condBlock: { borderRadius: 18, padding: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid },
  condBlockHead: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  condInput: {
    marginTop: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    backgroundColor: 'rgba(20,13,40,0.6)',
    color: colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontFamily: fonts.body,
  },
  toggleTrack: { width: 46, height: 27, borderRadius: 20, position: 'relative' },
  toggleKnob: { position: 'absolute', top: 3, width: 21, height: 21, borderRadius: 11, backgroundColor: '#fff' },

  // review
  reviewCard: { borderRadius: 18, padding: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorderMid },
  reviewLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.6, fontFamily: fonts.bodyBold },
  reviewValue: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 15, marginTop: 3 },
  reviewMessage: { color: colors.textSoft, fontFamily: fonts.displayRegular, fontStyle: 'italic', fontSize: 16, marginTop: 6 },

  // footer
  footer: { paddingHorizontal: 22, paddingTop: 12 },
  continueBtn: { backgroundColor: colors.accentDim, borderRadius: 17, paddingVertical: 16, alignItems: 'center' },
  continueText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 16 },
  buryBtn: { borderRadius: 17, paddingVertical: 16, alignItems: 'center' },
  buryText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 16 },

  // success
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  successOrb: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.textPrimary, marginTop: 30 },
  successSub: { fontSize: 14, color: colors.textSoft, marginTop: 8, lineHeight: 21, textAlign: 'center', fontFamily: fonts.body },
  successBtn: { marginTop: 30, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 40 },
  successBtnText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 15 },
});
