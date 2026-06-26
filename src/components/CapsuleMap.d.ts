import { Capsule } from '../data/capsules';

type Props = {
  capsules: (Capsule & { here: boolean; distance: string })[];
  selectedId: string;
  onSelect: (id: string) => void;
};

// Metro resolves the platform-specific implementation (CapsuleMap.native.tsx
// on iOS/Android, CapsuleMap.web.tsx on web); this only declares the shape.
export default function CapsuleMap(props: Props): JSX.Element;
