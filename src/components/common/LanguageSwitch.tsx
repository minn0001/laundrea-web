import React from 'react';
import { Globe } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

export const LanguageSwitch: React.FC = () => {
  const { lang, setLang } = useLang();

  return (
    <div
      id="customer-language-switch"
      role="group"
      aria-label="Bahasa / Language"
      className="h-9 px-2.5 rounded-full border border-white/20 bg-white/15 flex items-center gap-1.5 shadow-xs text-white"
    >
      <Globe className="w-3.5 h-3.5 text-white/70 shrink-0" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setLang('id')}
        title="Bahasa Indonesia"
        aria-label="Bahasa Indonesia"
        aria-pressed={lang === 'id'}
        className={`text-xs px-1 py-0.5 transition-colors cursor-pointer flex items-center justify-center leading-none ${
          lang === 'id'
            ? 'text-white font-bold border-b-2 border-[#ffbd59]'
            : 'text-white/60 hover:text-white font-medium border-b-2 border-transparent'
        }`}
      >
        ID
      </button>
      <div className="w-px h-3.5 bg-white/30 shrink-0" />
      <button
        type="button"
        onClick={() => setLang('en')}
        title="English"
        aria-label="English"
        aria-pressed={lang === 'en'}
        className={`text-xs px-1 py-0.5 transition-colors cursor-pointer flex items-center justify-center leading-none ${
          lang === 'en'
            ? 'text-white font-bold border-b-2 border-[#ffbd59]'
            : 'text-white/60 hover:text-white font-medium border-b-2 border-transparent'
        }`}
      >
        EN
      </button>
    </div>
  );
};
