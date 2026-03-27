import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ca from './locales/ca.json';
import es from './locales/es.json';

// Detect device language
const locales = Localization.getLocales();
const languageCode = locales[0]?.languageCode || 'ca';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ca: { translation: ca },
      es: { translation: es },
    },
    lng: languageCode,
    fallbackLng: 'ca',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
