import React, { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../theme/textScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors } from '../theme/colors';
import { Capsule, USER_LOCATION } from '../data/capsules';
import { useI18n } from '../i18n';

type Props = {
  capsules: (Capsule & { here: boolean; distance: string })[];
  selectedId: string;
  onSelect: (id: string) => void;
};

// Initial framing: centred on the user, tight enough to show the capsules
// around Parc de la Tête d'Or.
const REGION = {
  latitude: USER_LOCATION.latitude,
  longitude: USER_LOCATION.longitude,
  latitudeDelta: 0.014,
  longitudeDelta: 0.011,
};

// Real (Apple Maps) map of the area, with one marker per capsule and the
// "you are here" dot. Apple Maps is the default provider on iOS and works in
// Expo Go (no API key, no native build).
export default function CapsuleMap({ capsules, selectedId, onSelect }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const recenter = () => mapRef.current?.animateToRegion(REGION, 450);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        userInterfaceStyle="dark"
        showsPointsOfInterests={false}
        showsCompass={false}
        initialRegion={REGION}
      >
        {capsules.map((c) => {
          const isSel = c.id === selectedId;
          const ring = isSel ? colors.gold : c.here ? colors.accent : 'rgba(255,255,255,0.55)';
          return (
            <Marker
              key={c.id}
              coordinate={{ latitude: c.lat, longitude: c.lng }}
              onPress={() => onSelect(c.id)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={isSel}
            >
              <View
                style={[
                  styles.pin,
                  { backgroundColor: c.gradient[1], borderColor: ring },
                  isSel && styles.pinSel,
                ]}
              >
                <Text style={styles.pinText}>{c.initials}</Text>
              </View>
            </Marker>
          );
        })}

        <Marker
          coordinate={USER_LOCATION}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
          title={t('str_you_here')}
        >
          <View style={styles.hereDot} />
        </Marker>
      </MapView>

      <Pressable onPress={recenter} style={[styles.recenterBtn, { top: insets.top + 70 }]} hitSlop={8}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2} strokeLinecap="round">
          <Circle cx={12} cy={12} r={7} />
          <Line x1={12} y1={1.5} x2={12} y2={4.5} />
          <Line x1={12} y1={19.5} x2={12} y2={22.5} />
          <Line x1={1.5} y1={12} x2={4.5} y2={12} />
          <Line x1={19.5} y1={12} x2={22.5} y2={12} />
          <Circle cx={12} cy={12} r={2.4} fill={colors.gold} stroke="none" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', overflow: 'hidden' },
  pin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSel: { width: 38, height: 38, borderRadius: 19, borderWidth: 3 },
  pinText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  hereDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.here,
    borderWidth: 3,
    borderColor: '#1b1338',
  },
  recenterBtn: {
    position: 'absolute',
    right: 26,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(27,19,56,0.85)',
    borderWidth: 1,
    borderColor: colors.panelBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
