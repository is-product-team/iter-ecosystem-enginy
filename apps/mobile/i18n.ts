import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import ca from './locales/ca.json';
import es from './locales/es.json';

const LANGUAGE_KEY = 'user-language';

const getInitialLanguage = async () => {
  try {
    let savedLanguage = null;
    if (Platform.OS === 'web') {
      savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    } else {
      savedLanguage = await SecureStore.getItemAsync(LANGUAGE_KEY);
    }
    
    if (savedLanguage) return savedLanguage;

    // Fallback to device language
    const locales = Localization.getLocales();
    return locales[0]?.languageCode || 'ca';
  } catch (error) {
    console.warn('⚠️ [i18n] Error loading language:', error);
    return 'ca';
  }
};

// Initialize with a default, then change it once the saved one is loaded
i18n
  .use(initReactI18next)
  .init({
    resources: {
      ca: { translation: ca },
      es: { translation: es },
    },
    lng: 'ca', // default
    fallbackLng: 'ca',
    interpolation: {
      escapeValue: false,
    },
  });

// Load saved language asynchronously
getInitialLanguage().then((lang) => {
  i18n.changeLanguage(lang);
});

export default i18n;
