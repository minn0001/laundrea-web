import { useLang } from './LanguageContext';

export const useTr = () => {
  const { lang } = useLang();
  return (id: string, en: string): string => (lang === 'en' ? en : id);
};
