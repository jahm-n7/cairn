import React, { createContext, useContext, useMemo, useState } from 'react';
import { Lang, TKey, TRANSLATIONS } from './translations';

export { LANG_OPTIONS } from './translations';
export type { Lang, TKey } from './translations';

type TranslateFn = (key: TKey, vars?: Record<string, string | number>) => string;

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  const value = useMemo<I18nValue>(() => {
    const t: TranslateFn = (key, vars) => {
      const table = TRANSLATIONS[lang] ?? TRANSLATIONS.fr;
      let str = table[key] ?? TRANSLATIONS.fr[key] ?? key;
      if (vars) {
        for (const k of Object.keys(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
        }
      }
      return str;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
