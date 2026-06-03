import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setI18nLanguage, availableLanguages } from '../i18n';

export default function useLanguage() {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language || 'en');

  useEffect(() => {
    const handler = () => setLanguageState(i18n.language);
    i18n.on && i18n.on('languageChanged', handler);
    return () => i18n.off && i18n.off('languageChanged', handler);
  }, [i18n]);

  const setLanguage = async (lng: string) => {
    await setI18nLanguage(lng);
  };

  return { language, setLanguage, availableLanguages };
}
