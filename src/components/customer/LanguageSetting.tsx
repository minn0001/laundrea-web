import React from 'react';
import { Globe, Check } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

export const LanguageSetting: React.FC = () => {
  const { lang, setLang } = useLang();

  const options: { code: 'id' | 'en'; label: string }[] = [
    { code: 'id', label: 'Bahasa Indonesia' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-[#cd6184]" />
        <h3 className="text-sm font-bold text-[#254117]">
          {lang === 'en' ? 'Language' : 'Bahasa'}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = lang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLang(opt.code as any)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'border-[#cd6184] bg-[#ffecf2] text-[#cd6184]'
                  : 'border-gray-200 bg-white text-[#254117] hover:border-[#cd6184]/40'
              }`}
            >
              <span>{opt.label}</span>
              {active && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
