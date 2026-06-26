import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Polygon, Polyline } from 'react-native-svg';
import { colors, fonts } from '../theme/colors';
import { getCapsules, AccessType, Capsule } from '../data/capsules';
import { useI18n } from '../i18n';
import { useSettings, formatDistance } from '../settings';
import CapsuleMap from '../components/CapsuleMap';
import RadarDial from '../components/RadarDial';
import CapsuleSheet from '../components/CapsuleSheet';

type ViewMode = 'map' | 'radar';
type Filter = 'all' | 'public' | 'friends' | 'mine';

const FILTER_OPTIONS: { key: Filter; labelKey: string; color: string }[] = [
  { key: 'all', labelKey: 'filter_all', color: '#b6a9d0' },
  { key: 'public', labelKey: 'filter_public', color: '#b59ad0' },
  { key: 'friends', labelKey: 'filter_friends', color: '#ff5c8a' },
  { key: 'mine', labelKey: 'filter_mine', color: '#ffd45c' },
];

function matchesFilter(accessType: AccessType, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'mine') return accessType === 'mine';
  if (filter === 'public') return accessType === 'public';
  return accessType !== 'mine' && accessType !== 'public';
}

type FullCapsule = Capsule & { here: boolean; distance: string };

export default function DiscoverScreen({
  onOpenDetail,
}: {
  onOpenDetail: (capsule: FullCapsule) => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { settings } = useSettings();
  const capsules = useMemo(() => getCapsules(), []);
  const [view, setView] = useState<ViewMode>(settings.defaultView === 'radar' ? 'radar' : 'map');
  const [selectedId, setSelectedId] = useState(capsules[0].id);
  const [tracked, setTracked] = useState<string[]>([capsules[0].id]);
  const [filter, setFilter] = useState<Filter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const selected = capsules.find((c) => c.id === selectedId) ?? capsules[0];
  const mapCapsules = capsules.filter((c) => matchesFilter(c.accessType, filter));
  const trackedCapsules = capsules.filter((c) => tracked.includes(c.id));
  const primary = trackedCapsules.find((c) => c.id === selectedId) ?? trackedCapsules[0] ?? null;
  const isSelectedTracked = tracked.includes(selectedId);
  const filterActive = filter !== 'all';

  const toggleTrack = (id: string) => {
    setTracked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <View style={styles.screen}>
      {view === 'map' && (
        <View style={StyleSheet.absoluteFill}>
          <CapsuleMap capsules={mapCapsules} selectedId={selectedId} onSelect={setSelectedId} />
        </View>
      )}

      <View style={[styles.foreground, { paddingTop: insets.top + 14 }]} pointerEvents="box-none">
      <View style={styles.topRow}>
        <View style={styles.tabBar}>
          <Pressable
            onPress={() => setView('map')}
            style={[styles.tabBtn, view === 'map' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, view === 'map' && styles.tabLabelActive]}>{t('str_map')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setView('radar')}
            style={[styles.tabBtn, view === 'radar' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, view === 'radar' && styles.tabLabelActive]}>{t('str_radar')}</Text>
          </Pressable>
        </View>
        <View>
          <Pressable
            onPress={() => setFilterOpen((o) => !o)}
            style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={filterActive ? colors.gold : '#d6cde8'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
              <Polygon points="3 4 21 4 14 12.5 14 19 10 21 10 12.5" />
            </Svg>
            {filterActive && <View style={styles.filterDot} />}
          </Pressable>
          {filterOpen && (
            <View style={styles.filterMenu}>
              <Text style={styles.filterMenuTitle}>{t('filter_title')}</Text>
              {FILTER_OPTIONS.map((o) => {
                const on = filter === o.key;
                return (
                  <Pressable
                    key={o.key}
                    onPress={() => {
                      setFilter(o.key);
                      setFilterOpen(false);
                    }}
                    style={[styles.filterOption, on && styles.filterOptionActive]}
                  >
                    <View style={[styles.filterColorDot, { backgroundColor: o.color }]} />
                    <Text style={[styles.filterOptionLabel, on && styles.filterOptionLabelActive]}>
                      {t(o.labelKey as any)}
                    </Text>
                    {on && (
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                        <Polyline points="5 13 10 18 19 6" />
                      </Svg>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </View>

      {view === 'radar' && (
        <View style={styles.content}>
          {trackedCapsules.length > 0 ? (
          <View style={styles.radarContainer}>
            <Text style={styles.eyebrow}>
              {trackedCapsules.length > 1
                ? t('radar_following_n', { n: trackedCapsules.length })
                : t('radar_following')}
            </Text>
            {primary && (
              <>
                <Text style={styles.radarDistance}>{formatDistance(primary.dm, settings.units)}</Text>
                <Text style={styles.radarDir}>
                  {t('capsule_of')} {primary.author} · {primary.dir}
                </Text>
              </>
            )}
            <View style={{ marginTop: 14 }}>
              <RadarDial
                trackedCapsules={trackedCapsules}
                primaryId={primary?.id ?? null}
                onSelect={setSelectedId}
              />
            </View>
            <View style={styles.chipsRow}>
              {trackedCapsules.map((c) => {
                const isPrimary = primary?.id === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setSelectedId(c.id)}
                    style={[
                      styles.chip,
                      isPrimary
                        ? { backgroundColor: colors.accentDim, borderColor: colors.accent }
                        : { backgroundColor: colors.panel, borderColor: colors.panelBorderMid },
                    ]}
                  >
                    <View style={styles.chipAvatar}>
                      <Text style={styles.chipAvatarText}>{c.initials}</Text>
                    </View>
                    <Text style={styles.chipLabel}>
                      {c.author} · {formatDistance(c.dm, settings.units)}
                    </Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleTrack(c.id);
                      }}
                      style={styles.chipRemove}
                    >
                      <Text style={styles.chipRemoveText}>✕</Text>
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Svg width={26} height={26} viewBox="0 0 24 24">
                <Circle cx={12} cy={12} r={9} stroke={colors.accent} strokeWidth={1.7} fill="none" />
                <Circle cx={12} cy={12} r={3.5} stroke={colors.accent} strokeWidth={1.7} fill="none" />
              </Svg>
            </View>
            <Text style={styles.emptyTitle}>{t('radar_no_title')}</Text>
            <Text style={styles.emptyText}>{t('map_empty_sub')}</Text>
            <Pressable onPress={() => setView('map')} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>{t('open_map_btn')}</Text>
            </Pressable>
          </View>
          )}
        </View>
      )}
      </View>

      <CapsuleSheet
        capsule={selected}
        isTracked={isSelectedTracked}
        onOpen={() => onOpenDetail(selected)}
        onToggleTrack={() => toggleTrack(selectedId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  foreground: { flex: 1 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: colors.accent,
    fontFamily: fonts.bodyBold,
  },
  topRow: {
    marginHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 30,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: 14,
    padding: 4,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  tabBtnActive: { backgroundColor: colors.accentDim },
  tabLabel: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.textSecondary },
  tabLabelActive: { color: colors.gold },
  filterBtn: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accentDim },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accentDeep,
    borderWidth: 1.5,
    borderColor: '#1d1238',
  },
  filterMenu: {
    position: 'absolute',
    top: 54,
    right: 0,
    width: 184,
    backgroundColor: 'rgba(28,18,52,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.2)',
    borderRadius: 16,
    padding: 7,
    zIndex: 40,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  filterMenuTitle: {
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
    fontFamily: fonts.bodyBold,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    paddingHorizontal: 11,
    borderRadius: 11,
  },
  filterOptionActive: { backgroundColor: colors.accentDimSoft },
  filterColorDot: { width: 10, height: 10, borderRadius: 5 },
  filterOptionLabel: { flex: 1, fontSize: 13.5, fontFamily: fonts.bodyBold, color: '#d6cde8' },
  filterOptionLabelActive: { color: colors.gold },
  content: { flex: 1, marginTop: 12 },
  radarContainer: { flex: 1, alignItems: 'center', paddingTop: 14 },
  radarDistance: {
    fontFamily: fonts.display,
    fontSize: 54,
    color: colors.textPrimary,
    lineHeight: 58,
    marginTop: 4,
  },
  radarDir: { fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 8,
    borderRadius: 30,
    borderWidth: 1,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7a3da0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.textPrimary },
  chipLabel: { fontSize: 12.5, color: colors.textPrimary, fontFamily: fonts.bodyMedium },
  chipRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(126,135,148,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: { color: '#aab2bc', fontSize: 10 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontFamily: fonts.display, fontSize: 23, color: colors.textPrimary, marginTop: 18 },
  emptyText: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  emptyBtn: {
    marginTop: 22,
    backgroundColor: colors.accentDimSoft,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,92,138,0.3)',
  },
  emptyBtnText: { color: colors.gold, fontFamily: fonts.bodyBold, fontSize: 14 },
});
