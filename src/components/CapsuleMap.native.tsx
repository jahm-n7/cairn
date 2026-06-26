import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { colors } from '../theme/colors';
import { Capsule, USER_LOCATION } from '../data/capsules';
import { useI18n } from '../i18n';
import { useSettings } from '../settings';

type Props = {
  capsules: (Capsule & { here: boolean; distance: string })[];
  selectedId: string;
  onSelect: (id: string) => void;
};

// Real (Apple Maps) map of the area, with one marker per capsule, the
// "you are here" dot and a circle for the discovery radius. Apple Maps is the
// default provider on iOS and works in Expo Go (no API key, no native build).
export default function CapsuleMap({ capsules, selectedId, onSelect }: Props) {
  const { t } = useI18n();
  const { settings } = useSettings();

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        userInterfaceStyle="dark"
        showsPointsOfInterests={false}
        showsCompass={false}
        initialRegion={{
          latitude: USER_LOCATION.latitude,
          longitude: USER_LOCATION.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.016,
        }}
      >
        <Circle
          center={USER_LOCATION}
          radius={settings.discoverRadius}
          strokeColor="rgba(255,92,138,0.55)"
          strokeWidth={1.5}
          fillColor="rgba(255,92,138,0.08)"
        />

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
});
