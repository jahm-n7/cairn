import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { useFriends } from '../data/friendsStore';
import { useI18n } from '../i18n';
import { selectHaptic } from '../theme/haptics';
import { PayRequest } from '../screens/PayScreen';

type View2 = 'amis' | 'cercles';

// The "Mes amis & accès" list, embedded inline (no navigation needed). Friend /
// circle taps bubble up so the parent can open the matching detail overlay.
export default function FriendsPanel({
  onOpenFriend,
  onOpenCircle,
  onNewCircle,
  onPay,
}: {
  onOpenFriend: (id: string) => void;
  onOpenCircle: (id: string) => void;
  onNewCircle: () => void;
  onPay: (r: PayRequest) => void;
}) {
  const { t } = useI18n();
  const { friends, pending, circles, acceptPending, declinePending } = useFriends();
  const [view, setView] = useState<View2>('amis');

  return (
    <View>
      {/* tabs */}
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
                    <Pressable onPress={() => { selectHaptic(); acceptPending(p.id); }} style={styles.acceptBtn}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.onAccent} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        <Polyline points="5 12 10 17 19 7" />
                      </Svg>
                    </Pressable>
                    <Pressable onPress={() => { selectHaptic(); declinePending(p.id); }} style={styles.declineBtn}>
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
                <Pressable key={f.id} onPress={() => onOpenFriend(f.id)} style={styles.friendRow}>
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
                <Pressable key={c.id} onPress={() => onOpenCircle(c.id)} style={styles.circleRow}>
                  <View style={[styles.circleIcon, { backgroundColor: c.color }]}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.textPrimary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <Circle cx={9} cy={8} r={3.2} /><Path d="M3 19c0-3 3-4.5 6-4.5s6 1.5 6 4.5" /><Path d="M16 5.5a3 3 0 0 1 0 5.6" /><Path d="M18 14.5c2 .6 3 1.9 3 4.5" />
                    </Svg>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.rowName} numberOfLines={1}>{c.name}</Text>
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
            <Pressable onPress={onNewCircle} style={styles.addCircleBtn}>
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

const card = { borderRadius: 16, backgroundColor: colors.panelSoft, borderWidth: 1, borderColor: colors.panelBorder } as const;

const styles = StyleSheet.create({
  tabBar: { marginBottom: 4, flexDirection: 'row', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, borderRadius: 14, padding: 4 },
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
});
