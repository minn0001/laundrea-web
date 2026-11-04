import React from 'react';
import { useLang } from '../../i18n/LanguageContext';

export const LanguageSwitch: React.FC = () => {
  const { lang, setLang } = useLang();

  return (
    <div
      id="customer-language-switch"
      role="group"
      aria-label="Language selection"
      className="h-9 p-0.5 rounded-full border border-white/20 bg-white/15 flex items-center shadow-xs text-white"
    >
      <button
        type="button"
        onClick={() => setLang('id')}
        className={`h-7.5 px-2 rounded-full text-[10px] font-black transition-all cursor-pointer flex items-center justify-center ${
          lang === 'id'
            ? 'bg-white text-[#254117] shadow-xs'
            : 'text-white/80 hover:text-white'
        }`}
        aria-pressed={lang === 'id'}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`h-7.5 px-2 rounded-full text-[10px] font-black transition-all cursor-pointer flex items-center justify-center ${
          lang === 'en'
            ? 'bg-white text-[#254117] shadow-xs'
            : 'text-white/80 hover:text-white'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
};
