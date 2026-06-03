import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';
import hi from './locales/hi.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import it from './locales/it.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import ko from './locales/ko.json';

const LANGUAGE_KEY = 'app-language';

const resources = {
  en: { translation: en },
  es: { translation: es },
  hi: { translation: hi },
  pt: { translation: pt },
  de: { translation: de },
  it: { translation: it },
  fr: { translation: fr },
  ru: { translation: ru },
  id: { translation: id },
  ms: { translation: ms },
  ko: { translation: ko },
};

const fallback = { languageTag: 'en' };

// Determine best language in a safe way that works on native and web
function detectDeviceLanguage(): string {
  try {
    if (RNLocalize && typeof RNLocalize.getLocales === 'function') {
      const locales = RNLocalize.getLocales();
      if (locales && locales.length > 0 && locales[0].languageTag) return locales[0].languageTag;
    }

    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.split('-')[0];
    }
  } catch (e) {
    // ignore and fall through to fallback
  }
  return fallback.languageTag;
}

const detected = detectDeviceLanguage();

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources,
  lng: detected,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export async function initI18n() {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) {
      await i18n.changeLanguage(stored);
    }
  } catch (e) {
    // ignore storage errors, keep fallback
  }
}

export async function setI18nLanguage(lng: string) {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lng);
  } catch (e) {
    // ignore
  }
  await i18n.changeLanguage(lng);
}

export const availableLanguages = ['en', 'es', 'pt', 'de', 'it', 'fr', 'ru', 'id', 'ms', 'hi', 'ko'];

export default i18n;
