import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { friends as SEED_FRIENDS, circles as SEED_CIRCLES, pending as SEED_PENDING, Friend, Circle as CircleT, Pending } from '../data/profile';
import { useI18n } from '../i18n';
import { PayRequest } from './PayScreen';

type Stage = 'list' | 'friend' | 'circle';
type View2 = 'amis' | 'cercles';
const COLOR_OPTIONS = ['#7a3da0', '#2d9d8f', '#c43d7a', '#3a3060', '#6e5a90', '#4a3a60'];

export default function FriendsFlow({ onClose, onPay }: { onClose: () => void; onPay: (r: PayRequest) => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [friends, setFriends] = useState<Friend[]>(SEED_FRIENDS);
  const [pending, setPending] = useState<Pending[]>(SEED_PENDING);
  const [circles, setCircles] = useState<CircleT[]>(SEED_CIRCLES);
  const [view, setView] = useState<View2>('amis');
  const [stage, setStage] = useState<Stage>('list');
  const [friendId, setFriendId] = useState<string | null>(null);
  const [circleEditId, setCircleEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; color: string; members: string[] }>({ name: '', color: '#7a3da0', members: [] });

  // ----- actions -----
  const acceptPending = (id: string) => {
    const p = pending.find((x) => x.id === id);
    if (!p) return;
    setPending((prev) => prev.filter((x) => x.id !== id));
    setFriends((prev) => prev.concat([{ id: 'f' + Date.now(), name: p.name, initials: p.initials, color: p.color, since: '2026', shared: 0, received: 0, circles: [] }]));
  };
  const declinePending = (id: string) => setPending((prev) => prev.filter((x) => x.id !== id));
  const openFriend = (id: string) => { setFriendId(id); setStage('friend'); };
  const removeFriend = (id: string) => { setFriends((prev) => prev.filter((x) => x.id !== id)); setStage('list'); setFriendId(null); };
  const toggleBlock = (id: string) => setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, blocked: !f.blocked } : f)));
  const openNewCircle = () => { if (circles.length >= 5) return; setCircleEditId(null); setDraft({ name: '', color: '#7a3da0', members: [] }); setStage('circle'); };
  const openEditCircle = (id: string) => {
    const c = circles.find((x) => x.id === id);
    if (!c) return;
    setCircleEditId(id);
    setDraft({ name: c.name, color: c.color, members: friends.filter((f) => f.circles.includes(id)).map((f) => f.id) });
    setStage('circle');
  };
  const toggleMember = (fid: string) => setDraft((d) => ({ ...d, members: d.members.includes(fid) ? d.members.filter((x) => x !== fid) : d.members.concat([fid]) }));
  const saveCircle = () => {
    const name = draft.name.trim() || t('circle_new');
    let id = circleEditId;
    if (id) {
      setCircles((prev) => prev.map((c) => (c.id === id ? { ...c, name, color: draft.color } : c)));
    } else {
      id = 'cir' + Date.now();
      setCircles((prev) => prev.concat([{ id: id!, name, color: draft.color, desc: '' }]));
    }
    setFriends((prev) =>
      prev.map((f) => {
        const should = draft.members.includes(f.id);
        const has = f.circles.includes(id!);
        if (should && !has) return { ...f, circles: f.circles.concat([id!]) };
        if (!should && has) return { ...f, circles: f.circles.filter((x) => x !== id) };
        return f;
      })
    );
    setView('cercles');
    setStage('list');
    setCircleEditId(null);
  };
  const deleteCircle = () => {
    const id = circleEditId;
    if (id) {
      setCircles((prev) => prev.filter((c) => c.id !== id));
      setFriends((prev) => prev.map((f) => ({ ...f, circles: f.circles.filter((x) => x !== id) })));
    }
    setView('cercles');
    setStage('list');
    setCircleEditId(null);
  };

  const back = () => { if (stage === 'list') onClose(); else setStage('list'); };

  // ----- FRIEND DETAIL -----
  if (stage === 'friend') {
    const f = friends.find((x) => x.id === friendId) ?? friends[0];
    if (!f) { onClose(); return null; }
    return (
      <View style={[styles.fill, styles.pushBg]}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 22 }}><BackBtn onPress={back} /></View>
          <View style={{ paddingHorizontal: 28, paddingTop: 14 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={[styles.bigAvatar, { backgroundColor: f.color }]}>
                <Text style={styles.bigAvatarText}>{f.initials}</Text>
              </View>
              <Text style={styles.friendName}>{f.name}</Text>
              <Text style={styles.friendSince}>{t('friends_since')}{f.since}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{f.shared}</Text>
                <Text style={styles.statLabel}>{t('caps_left_by')} {f.name}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNum}>{f.received}</Text>
                <Text style={styles.statLabel}>{t('caps_opened_by')} {f.name}</Text>
              </View>
            </View>
            <Pressable onPress={() => removeFriend(f.id)} style={styles.dangerBtn}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#ff5a6e" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M16 17l5-5-5-5" /><Path d="M21 12H9" /><Path d="M9 21H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h3" />
              </Svg>
              <Text style={styles.dangerText}>{t('remove_friend')}</Text>
            </Pressable>
            <Pressable
              onPress={() => toggleBlock(f.id)}
              style={[styles.blockBtn, { borderColor: f.blocked ? 'rgba(255,92,138,0.3)' : 'rgba(125,118,160,0.28)', backgroundColor: f.blocked ? 'rgba(255,92,138,0.1)' : 'rgba(125,118,160,0.1)' }]}
            >
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={f.blocked ? colors.gold : '#a99fc0'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Circle cx={12} cy={12} r={9} /><Line x1={5.6} y1={5.6} x2={18.4} y2={18.4} />
              </Svg>
              <Text style={[styles.blockText, { color: f.blocked ? colors.gold : '#a99fc0' }]}>{f.blocked ? t('unblock') : t('block')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ----- CIRCLE EDITOR -----
  if (stage === 'circle') {
    return (
      <View style={[styles.fill, styles.pushBg]}>
        <View style={[styles.editorHeader, { paddingTop: insets.top + 6 }]}>
          <BackBtn onPress={back} />
          <Text style={styles.editorTitle}>{circleEditId ? t('circle_edit') : t('circle_new')}</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 18, paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.fieldLabel}>{t('circle_name_label')}</Text>
          <TextInput
            value={draft.name}
            onChangeText={(v) => setDraft((d) => ({ ...d, name: v }))}
            placeholder={t('circle_name_ph')}
            placeholderTextColor={colors.placeholder}
            style={styles.nameInput}
          />

          <Text style={[styles.fieldLabel, { marginTop: 20 }]}>{t('color_label')}</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((col) => {
              const sel = draft.color === col;
              return (
                <Pressable
                  key={col}
                  onPress={() => setDraft((d) => ({ ...d, color: col }))}
                  style={[styles.colorSwatch, { backgroundColor: col }, sel && styles.colorSwatchSel]}
                >
                  {sel && (
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <Polyline points="5 12 10 17 19 7" />
                    </Svg>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 20 }]}>{t('members_label')} · {draft.members.length}</Text>
          <View style={styles.chipWrap}>
            {friends.map((f) => {
              const on = draft.members.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() => toggleMember(f.id)}
                  style={[styles.memberChip, { backgroundColor: on ? colors.accentDim : colors.panelSoft, borderColor: on ? colors.accent : colors.panelBorderMid }]}
                >
                  <View style={[styles.chipAvatar, { backgroundColor: f.color }]}>
                    <Text style={styles.chipAvatarText}>{f.initials}</Text>
                  </View>
                  <Text style={styles.chipName}>{f.name}</Text>
                  {on && (
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                      <Polyline points="5 12 10 17 19 7" />
                    </Svg>
                  )}
                </Pressable>
              );
            })}
          </View>

          {circleEditId && (
            <Pressable onPress={deleteCircle} style={[styles.dangerBtn, { marginTop: 26 }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ff5a6e" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 7h16" /><Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><Path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
              </Svg>
              <Text style={styles.dangerText}>{t('delete_circle')}</Text>
            </Pressable>
          )}
        </ScrollView>
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16, paddingTop: 12 }}>
          <Pressable onPress={saveCircle}>
            <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
              <Text style={styles.saveText}>{t('save_circle')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  // ----- LIST (amis / cercles) -----
  const sharedTotal = friends.reduce((a, f) => a + f.shared, 0);
  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BackBtn onPress={back} />
          <Text style={styles.title}>{t('friends_title')}</Text>
        </View>

        <View style={styles.topStats}>
          <Stat n={friends.length} label={t('prof_friends_count')} />
          <Stat n={circles.length} label={t('friends_stat_circles')} />
          <Stat n={sharedTotal} label={t('friends_stat_shared')} />
        </View>

        <View style={styles.searchBar}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={11} cy={11} r={7} /><Line x1={21} y1={21} x2={16.5} y2={16.5} />
          </Svg>
          <Text style={styles.searchText}>{t('friends_search')}</Text>
        </View>

        <View style={styles.tabBar}>
          <Pressable onPress={() => setView('amis')} style={[styles.tabBtn, view === 'amis' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, view === 'amis' && styles.tabLabelActive]}>{t('friends_tab_friends')}</Text>
          </Pressable>
          <Pressable onPress={() => setView('cercles')} style={[styles.tabBtn, view === 'cercles' && styles.tabBtnActive]}>
            <Text style={[styles.tabLabel, view === 'cercles' && styles.tabLabelActive]}>{t('friends_tab_circles')}</Text>
          </Pressable>
        </View>

        {view === 'amis' ? (
          <View>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t('friends_pending')}</Text>
                <View style={{ marginTop: 10, gap: 10 }}>
                  {pending.map((p) => (
                    <View key={p.id} style={styles.pendingRow}>
                      <View style={[styles.rowAvatar, { backgroundColor: p.color }]}>
                        <Text style={styles.rowAvatarText}>{p.initials}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.rowName}>{p.name}</Text>
                        <Text style={styles.rowSub}>{p.mutualCount != null ? `${p.mutualCount}${t('mutual_amis')}` : p.mutualText}</Text>
                      </View>
                      <Pressable onPress={() => acceptPending(p.id)} style={styles.acceptBtn}>
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <Polyline points="5 12 10 17 19 7" />
                        </Svg>
                      </Pressable>
                      <Pressable onPress={() => declinePending(p.id)} style={styles.declineBtn}>
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#a99fc0" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                          <Line x1={6} y1={6} x2={18} y2={18} /><Line x1={18} y1={6} x2={6} y2={18} />
                        </Svg>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 22 }]}>{t('friends_list')}</Text>
            <View style={{ marginTop: 10, gap: 10 }}>
              {friends.map((f) => {
                const sub = f.shared + f.received === 0 ? t('no_caps_exchanged') : `${f.shared + f.received}${t('caps_exchanged')}`;
                return (
                  <Pressable key={f.id} onPress={() => openFriend(f.id)} style={styles.friendRow}>
                    <View style={[styles.rowAvatar, { backgroundColor: f.color }]}>
                      <Text style={styles.rowAvatarText}>{f.initials}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.rowName}>{f.name}</Text>
                      <Text style={styles.rowSub}>{sub}</Text>
                    </View>
                    <Chevron />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.circlesSub}>{t('circles_sub')}</Text>
            <View style={{ marginTop: 14, gap: 10 }}>
              {circles.map((c) => {
                const members = friends.filter((f) => f.circles.includes(c.id));
                const desc = c.desc || (members.length ? members.map((m) => m.name).join(', ') : t('no_members'));
                const countLabel = members.length === 0 ? t('empty') : members.length === 1 ? `1 ${t('member_sing')}` : `${members.length} ${t('member_plur')}`;
                return (
                  <Pressable key={c.id} onPress={() => openEditCircle(c.id)} style={styles.circleRow}>
                    <View style={[styles.circleIcon, { backgroundColor: c.color }]}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <Circle cx={9} cy={8} r={3.2} /><Path d="M3 19c0-3 3-4.5 6-4.5s6 1.5 6 4.5" /><Path d="M16 5.5a3 3 0 0 1 0 5.6" /><Path d="M18 14.5c2 .6 3 1.9 3 4.5" />
                      </Svg>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.rowName}>{c.name}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{desc}</Text>
                    </View>
                    <View style={styles.circleMeta}>
                      <View style={styles.avatarStack}>
                        {members.slice(0, 4).map((m, i) => (
                          <View key={m.id} style={[styles.stackAvatar, { backgroundColor: m.color, marginLeft: i === 0 ? 0 : -8 }]}>
                            <Text style={styles.stackAvatarText}>{m.initials}</Text>
                          </View>
                        ))}
                      </View>
                      <Text style={styles.countLabel}>{countLabel}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {circles.length < 5 ? (
              <Pressable onPress={openNewCircle} style={styles.addCircleBtn}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Line x1={12} y1={5} x2={12} y2={19} /><Line x1={5} y1={12} x2={19} y2={12} />
                </Svg>
                <Text style={styles.addCircleText}>{t('circle_new')}</Text>
              </Pressable>
            ) : (
              <Pressable style={{ marginTop: 12 }} onPress={() => onPay({ mode: 'circle' })}>
                <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.payCircleBtn}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <Line x1={12} y1={5} x2={12} y2={19} /><Line x1={5} y1={12} x2={19} y2={12} />
                  </Svg>
                  <Text style={styles.payCircleText}>{t('add_circle_paid')}</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.topStatCard}>
      <Text style={styles.topStatNum}>{n}</Text>
      <Text style={styles.topStatLabel}>{label}</Text>
    </View>
  );
}

function BackBtn({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backBtn}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#d6cde8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Polyline points="15 6 9 12 15 18" />
      </Svg>
    </Pressable>
  );
}

function Chevron() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.chevron} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 6 15 12 9 18" />
    </Svg>
  );
}

const card = { borderRadius: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder } as const;

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  pushBg: { backgroundColor: '#1b1338' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 26, color: colors.textPrimary },

  topStats: { flexDirection: 'row', gap: 10, marginTop: 16 },
  topStatCard: { flex: 1, borderRadius: 14, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder, paddingVertical: 12, alignItems: 'center' },
  topStatNum: { fontFamily: fonts.display, fontSize: 23, color: colors.gold },
  topStatLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 1, fontFamily: fonts.body },

  searchBar: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 15, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder, paddingVertical: 12, paddingHorizontal: 15 },
  searchText: { fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body },

  tabBar: { marginTop: 16, marginBottom: 4, flexDirection: 'row', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  tabBtnActive: { backgroundColor: colors.accentDim },
  tabLabel: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.textSecondary },
  tabLabelActive: { color: colors.gold },

  sectionLabel: { marginTop: 18, fontSize: 12, color: colors.textMuted, fontFamily: fonts.bodyBold, letterSpacing: 0.7 },
  pendingRow: { ...card, borderColor: colors.panelBorderMid, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14 },
  friendRow: { ...card, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 14 },
  rowAvatar: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  rowAvatarText: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 18 },
  rowName: { color: colors.textPrimary, fontFamily: fonts.bodyBold, fontSize: 14.5 },
  rowSub: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.body, marginTop: 1 },
  acceptBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  declineBtn: { width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(125,118,160,0.16)', alignItems: 'center', justifyContent: 'center' },

  circlesSub: { marginTop: 16, fontSize: 12.5, color: colors.textMuted, lineHeight: 19, fontFamily: fonts.body },
  circleRow: { ...card, flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 15 },
  circleIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  circleMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarStack: { flexDirection: 'row' },
  stackAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#140d28', alignItems: 'center', justifyContent: 'center' },
  stackAvatarText: { color: colors.textPrimary, fontSize: 11, fontFamily: fonts.bodyBold },
  countLabel: { fontSize: 11.5, color: colors.textSoft, fontFamily: fonts.body },
  addCircleBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,92,138,0.28)', paddingVertical: 15 },
  addCircleText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.accent },
  payCircleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 16, paddingVertical: 15 },
  payCircleText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.onAccent },

  // friend detail
  bigAvatar: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,92,138,0.25)' },
  bigAvatarText: { color: colors.textPrimary, fontFamily: fonts.display, fontSize: 38 },
  friendName: { fontFamily: fonts.display, fontSize: 27, color: colors.textPrimary, marginTop: 14 },
  friendSince: { fontSize: 12.5, color: colors.textMuted, marginTop: 3, fontFamily: fonts.body },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 22 },
  statCard: { flex: 1, borderRadius: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder, padding: 15, alignItems: 'center' },
  statNum: { fontFamily: fonts.display, fontSize: 26, color: colors.gold },
  statLabel: { fontSize: 11.5, color: colors.textSecondary, marginTop: 2, textAlign: 'center', fontFamily: fonts.body },
  dangerBtn: { marginTop: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,90,110,0.3)', backgroundColor: 'rgba(255,90,110,0.08)', paddingVertical: 14 },
  dangerText: { fontSize: 14, fontFamily: fonts.bodyBold, color: '#ff5a6e' },
  blockBtn: { marginTop: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 15, borderWidth: 1, paddingVertical: 14 },
  blockText: { fontSize: 14, fontFamily: fonts.bodyBold },

  // circle editor
  editorHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingBottom: 4 },
  editorTitle: { fontFamily: fonts.display, fontSize: 25, color: colors.textPrimary },
  fieldLabel: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.bodyBold, letterSpacing: 0.5 },
  nameInput: { marginTop: 9, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,92,138,0.2)', backgroundColor: 'rgba(20,13,40,0.6)', color: colors.textPrimary, fontFamily: fonts.display, fontSize: 20, paddingHorizontal: 14, paddingVertical: 12 },
  colorRow: { flexDirection: 'row', gap: 12, marginTop: 11 },
  colorSwatch: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  colorSwatchSel: { borderWidth: 2, borderColor: colors.gold },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 11 },
  memberChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, paddingLeft: 7, paddingRight: 13, borderRadius: 30, borderWidth: 1.5 },
  chipAvatar: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  chipAvatarText: { color: colors.textPrimary, fontSize: 12, fontFamily: fonts.bodyBold },
  chipName: { fontSize: 13.5, color: colors.textPrimary, fontFamily: fonts.bodyMedium },
  saveBtn: { borderRadius: 17, paddingVertical: 16, alignItems: 'center' },
  saveText: { color: colors.onAccent, fontFamily: fonts.bodyBold, fontSize: 16 },
});
