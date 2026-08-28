import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import { colors, fonts, goldPinkGradient } from '../theme/colors';
import { useFriends } from '../data/friendsStore';
import { useI18n } from '../i18n';

const COLOR_OPTIONS = ['#7a3da0', '#2d9d8f', '#c43d7a', '#3a3060', '#6e5a90', '#4a3a60'];

// What to show. The friends/circles list lives inline on the profile slide; this
// overlay only handles a single friend's detail or the circle editor.
export type FriendsTarget =
  | { type: 'friend'; id: string }
  | { type: 'circle'; id: string }
  | { type: 'newCircle' };

export default function FriendsFlow({ target, onClose }: { target: FriendsTarget; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { friends, circles, removeFriend, toggleBlock, saveCircle, deleteCircle } = useFriends();

  const editingId = target.type === 'circle' ? target.id : null;
  const editingCircle = editingId ? circles.find((c) => c.id === editingId) : null;
  const [draft, setDraft] = useState<{ name: string; color: string; members: string[] }>(() => ({
    name: editingCircle?.name ?? '',
    color: editingCircle?.color ?? '#7a3da0',
    members: editingId ? friends.filter((f) => f.circles.includes(editingId)).map((f) => f.id) : [],
  }));

  const toggleMember = (fid: string) =>
    setDraft((d) => ({ ...d, members: d.members.includes(fid) ? d.members.filter((x) => x !== fid) : d.members.concat([fid]) }));

  // ----- FRIEND DETAIL -----
  if (target.type === 'friend') {
    const f = friends.find((x) => x.id === target.id);
    if (!f) {
      onClose();
      return null;
    }
    return (
      <View style={[styles.fill, styles.pushBg]}>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 22 }}><BackBtn onPress={onClose} /></View>
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
            <Pressable onPress={() => { removeFriend(f.id); onClose(); }} style={styles.dangerBtn}>
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

  // ----- CIRCLE EDITOR (edit existing or new) -----
  const save = () => {
    saveCircle({ id: editingId, name: draft.name.trim() || t('circle_new'), color: draft.color, members: draft.members });
    onClose();
  };
  const remove = () => {
    if (editingId) deleteCircle(editingId);
    onClose();
  };

  return (
    <View style={[styles.fill, styles.pushBg]}>
      <View style={[styles.editorHeader, { paddingTop: insets.top + 6 }]}>
        <BackBtn onPress={onClose} />
        <Text style={styles.editorTitle}>{editingId ? t('circle_edit') : t('circle_new')}</Text>
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
              <Pressable key={col} onPress={() => setDraft((d) => ({ ...d, color: col }))} style={[styles.colorSwatch, { backgroundColor: col }, sel && styles.colorSwatchSel]}>
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

        {editingId && (
          <Pressable onPress={remove} style={[styles.dangerBtn, { marginTop: 26 }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#ff5a6e" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 7h16" /><Path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><Path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
            </Svg>
            <Text style={styles.dangerText}>{t('delete_circle')}</Text>
          </Pressable>
        )}
      </ScrollView>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16, paddingTop: 12 }}>
        <Pressable onPress={save}>
          <LinearGradient colors={goldPinkGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveBtn}>
            <Text style={styles.saveText}>{t('save_circle')}</Text>
          </LinearGradient>
        </Pressable>
      </View>
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

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  pushBg: { backgroundColor: '#1b1338' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.panelBorder, alignItems: 'center', justifyContent: 'center' },

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
