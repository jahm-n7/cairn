import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { profile } from '../data/profile';

// Everything the user can tune in the Settings screen. Persisted to disk so it
// survives closing the panel and restarting the app.
export type SettingsState = {
  reqFrom: string;
  profilePublic: boolean;
  liveLocation: boolean;
  fuzzyLocation: boolean;
  highAccuracy: boolean;
  discoverRadius: number;
  notifNearby: boolean;
  notifFriend: boolean;
  notifUnearth: boolean;
  notifReminder: boolean;
  emailUpdates: boolean; // consent to receive email notifications (capsule ready/opened, app news)
  sound: boolean;
  haptics: boolean;
  units: string; // 'm' | 'ft'
  textSize: number;
  reduceMotion: boolean;
  offline: boolean;
};

export type Account = { name: string; handle: string; email: string; phone: string };

export const SETTINGS_DEFAULTS: SettingsState = {
  reqFrom: 'amisamis',
  profilePublic: true,
  liveLocation: false,
  fuzzyLocation: true,
  highAccuracy: true,
  discoverRadius: 800,
  notifNearby: true,
  notifFriend: true,
  notifUnearth: true,
  notifReminder: false,
  emailUpdates: false,
  sound: true,
  haptics: true,
  units: 'm',
  textSize: 100,
  reduceMotion: false,
  offline: false,
};

const ACCOUNT_DEFAULTS: Account = {
  name: profile.name,
  handle: profile.handle,
  email: 'toi@exemple.fr',
  phone: '+33 6 12 34 56 78',
};

const STORAGE_KEY = 'cairn.settings.v1';

type Ctx = {
  settings: SettingsState;
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  account: Account;
  setAccount: (patch: Partial<Account>) => void;
  reset: () => void;
  hydrated: boolean; // AsyncStorage load finished
  onboarded: boolean; // first-launch onboarding completed
  completeOnboarding: () => void;
  signOut: () => void;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(SETTINGS_DEFAULTS);
  const [account, setAccountState] = useState<Account>(ACCOUNT_DEFAULTS);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  // Load persisted values once on mount.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.settings) setSettings((s) => ({ ...s, ...parsed.settings }));
          if (parsed.account) setAccountState((a) => ({ ...a, ...parsed.account }));
          if (parsed.onboarded) setOnboarded(true);
        }
      } catch {
        // AsyncStorage unavailable — run with in-memory defaults.
      }
      setReady(true);
    })();
  }, []);

  // Persist on every change, once the initial load has happened.
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, account, onboarded })).catch(() => {});
  }, [settings, account, onboarded, ready]);

  const setSetting: Ctx['setSetting'] = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const setAccount = (patch: Partial<Account>) => setAccountState((a) => ({ ...a, ...patch }));
  const completeOnboarding = () => setOnboarded(true);
  const reset = () => {
    setSettings(SETTINGS_DEFAULTS);
    setAccountState(ACCOUNT_DEFAULTS);
  };
  // Sign out: wipe the profile back to a clean slate and send the user through
  // the first-launch onboarding / sign-up again (persists, so it survives relaunch).
  const signOut = () => {
    reset();
    setOnboarded(false);
  };

  return (
    <SettingsContext.Provider value={{ settings, setSetting, account, setAccount, reset, hydrated: ready, onboarded, completeOnboarding, signOut }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}

// Format a metre distance honouring the user's unit preference.
export function formatDistance(meters: number, units: string): string {
  if (units === 'ft') return `${Math.round(meters * 3.28084)} ft`;
  return `${meters} m`;
}
