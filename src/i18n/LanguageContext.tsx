import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from './translations';

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'laundrea_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'id') return stored;
      }
    } catch {
      // ignore
    }
    return 'id';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
      }
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[lang] || translations.id;
    let text = dict[key] ?? translations.id[key] ?? key;

    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if called outside provider
    return {
      lang: 'id',
      setLang: () => {},
      t: (key: string, params?: Record<string, string | number>) => {
        let text = translations.id[key] ?? key;
        if (params) {
          Object.entries(params).forEach(([pKey, pVal]) => {
            text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
          });
        }
        return text;
      },
    };
  }
  return ctx;
};
