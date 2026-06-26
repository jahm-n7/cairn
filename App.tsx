import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { colors } from './src/theme/colors';
import { I18nProvider } from './src/i18n';
import { Capsule } from './src/data/capsules';
import TabBar, { Tab } from './src/components/TabBar';
import DiscoverScreen from './src/screens/DiscoverScreen';
import DepositScreen from './src/screens/DepositScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CapsuleDetailFlow from './src/screens/CapsuleDetailFlow';
import SettingsScreen from './src/screens/SettingsScreen';
import FriendsFlow from './src/screens/FriendsFlow';
import MyCapDetailScreen from './src/screens/MyCapDetailScreen';
import PayScreen, { PayRequest } from './src/screens/PayScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import { MyCapsule } from './src/data/profile';

type FullCapsule = Capsule & { here: boolean; distance: string };

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('create');
  const [detail, setDetail] = useState<FullCapsule | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [myCap, setMyCap] = useState<MyCapsule | null>(null);
  const [pay, setPay] = useState<PayRequest | null>(null);

  return (
    <LinearGradient colors={[colors.bgRadialTop, colors.bgRadialMid, colors.bg]} style={styles.container}>
      <View style={styles.content}>
        {tab === 'discover' && <DiscoverScreen onOpenDetail={setDetail} />}
        {tab === 'create' && <DepositScreen onDone={() => setTab('discover')} onPay={setPay} />}
        {tab === 'profile' && (
          <ProfileScreen
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenFriends={() => setFriendsOpen(true)}
            onOpenCapsule={setMyCap}
          />
        )}
      </View>
      <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />
      {detail && <CapsuleDetailFlow capsule={detail} onClose={() => setDetail(null)} onPay={setPay} />}
      {settingsOpen && <SettingsScreen onClose={() => setSettingsOpen(false)} />}
      {friendsOpen && <FriendsFlow onClose={() => setFriendsOpen(false)} onPay={setPay} />}
      {myCap && <MyCapDetailScreen capsule={myCap} onClose={() => setMyCap(null)} onPay={setPay} />}
      {pay && <PayScreen request={pay} onClose={() => setPay(null)} />}
      <StatusBar style="light" />
    </LinearGradient>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  // Keep the branded loading screen up long enough to see the cairn stack.
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), 2600);
    return () => clearTimeout(id);
  }, []);

  if (!fontsLoaded || !minElapsed) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <Shell />
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
