import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polygon, Polyline } from 'react-native-svg';
import { colors, fonts } from '../theme/colors';
import { getCapsules, AccessType, Capsule } from '../data/capsules';
import { useI18n } from '../i18n';
import { selectHaptic } from '../theme/haptics';
import CapsuleMap from '../components/CapsuleMap';
import CapsuleSheet from '../components/CapsuleSheet';
import { TAB_BAR_HEIGHT } from '../components/TabBar';

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
  const capsules = useMemo(() => getCapsules(), []);
  const [selectedId, setSelectedId] = useState(capsules[0].id);
  const [tracked, setTracked] = useState<string[]>([capsules[0].id]);
  const [filter, setFilter] = useState<Filter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const selected = capsules.find((c) => c.id === selectedId) ?? capsules[0];
  const mapCapsules = capsules.filter((c) => matchesFilter(c.accessType, filter));
  const isSelectedTracked = tracked.includes(selectedId);
  const filterActive = filter !== 'all';

  const toggleTrack = (id: string) => {
    selectHaptic();
    setTracked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <View style={styles.screen}>
      <View style={StyleSheet.absoluteFill}>
        <CapsuleMap capsules={mapCapsules} selectedId={selectedId} onSelect={setSelectedId} />
      </View>

      <View style={[styles.foreground, { paddingTop: insets.top + 14 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
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
      </View>

      <View style={{ marginBottom: Math.max(insets.bottom, 14) + TAB_BAR_HEIGHT }}>
        <CapsuleSheet
          capsule={selected}
          isTracked={isSelectedTracked}
          onOpen={() => onOpenDetail(selected)}
          onToggleTrack={() => toggleTrack(selectedId)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  foreground: { flex: 1 },
  topRow: {
    marginHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    zIndex: 30,
  },
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
});
