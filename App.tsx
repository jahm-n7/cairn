import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { colors } from './src/theme/colors';
import { I18nProvider } from './src/i18n';
import { SettingsProvider, useSettings } from './src/settings';
import { CapsulesProvider } from './src/data/capsulesStore';
import { FriendsProvider } from './src/data/friendsStore';
import { setTextScale } from './src/theme/textScale';
import { setHapticsEnabled } from './src/theme/haptics';
import { setSoundEnabled } from './src/theme/sound';
import { Capsule } from './src/data/capsules';
import TabBar, { Tab } from './src/components/TabBar';
import DiscoverScreen from './src/screens/DiscoverScreen';
import DepositScreen from './src/screens/DepositScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CapsuleDetailFlow from './src/screens/CapsuleDetailFlow';
import SettingsScreen from './src/screens/SettingsScreen';
import FriendsFlow, { FriendsTarget } from './src/screens/FriendsFlow';
import MyCapDetailScreen from './src/screens/MyCapDetailScreen';
import PayScreen, { PayRequest } from './src/screens/PayScreen';
import LoadingScreen from './src/screens/LoadingScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { MyCapsule } from './src/data/profile';

type FullCapsule = Capsule & { here: boolean; distance: string };

function Shell() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('create');
  const [detail, setDetail] = useState<FullCapsule | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [friendsTarget, setFriendsTarget] = useState<FriendsTarget | null>(null);
  const [myCap, setMyCap] = useState<MyCapsule | null>(null);
  const [pay, setPay] = useState<PayRequest | null>(null);
  const [capturing, setCapturing] = useState(false); // hide chrome while recording a video

  return (
    <LinearGradient colors={[colors.bgRadialTop, colors.bgRadialMid, colors.bg]} style={styles.container}>
      <View style={styles.content}>
        {tab === 'discover' && <DiscoverScreen onOpenDetail={setDetail} />}
        {tab === 'create' && <DepositScreen onPay={setPay} onCapturingChange={setCapturing} />}
        {tab === 'profile' && (
          <ProfileScreen
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenFriends={setFriendsTarget}
            onOpenCapsule={setMyCap}
            onPay={setPay}
          />
        )}
      </View>
      {!capturing && <TabBar active={tab} onChange={setTab} bottomInset={insets.bottom} />}
      {detail && <CapsuleDetailFlow capsule={detail} onClose={() => setDetail(null)} onPay={setPay} />}
      {settingsOpen && <SettingsScreen onClose={() => setSettingsOpen(false)} />}
      {friendsTarget && <FriendsFlow target={friendsTarget} onClose={() => setFriendsTarget(null)} />}
      {myCap && <MyCapDetailScreen capsule={myCap} onClose={() => setMyCap(null)} onPay={setPay} />}
      {pay && <PayScreen request={pay} onClose={() => setPay(null)} />}
      <StatusBar style="light" />
    </LinearGradient>
  );
}

// Decides what to show once inside the providers: branded loader → first-launch
// onboarding → the app itself.
function Root({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { hydrated, onboarded, settings } = useSettings();
  // Keep the branded loading screen up long enough to see the cairn stack.
  const [minElapsed, setMinElapsed] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMinElapsed(true), 2600);
    return () => clearTimeout(id);
  }, []);

  // Drive app-wide text scaling; setting it before rendering children means the
  // re-render triggered by a settings change repaints every <Text> at the new size.
  setTextScale(settings.textSize / 100);
  setHapticsEnabled(settings.haptics);
  setSoundEnabled(settings.sound);

  if (!fontsLoaded || !hydrated || !minElapsed) return <LoadingScreen />;
  if (!onboarded) return <OnboardingScreen />;
  return <Shell />;
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

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <SettingsProvider>
          <CapsulesProvider>
            <FriendsProvider>
              <Root fontsLoaded={fontsLoaded} />
            </FriendsProvider>
          </CapsulesProvider>
        </SettingsProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
});
