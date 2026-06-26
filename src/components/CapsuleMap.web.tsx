import React from 'react';
import { Capsule } from '../data/capsules';
import ParkMap from './ParkMap';

type Props = {
  capsules: (Capsule & { here: boolean; distance: string })[];
  selectedId: string;
  onSelect: (id: string) => void;
};

// react-native-maps has no web implementation, so on web we keep the stylised
// SVG park map. Native (iOS/Android) uses the real Apple Maps map.
export default function CapsuleMap(props: Props) {
  return <ParkMap {...props} />;
}
