import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../translations/en.json';
import bgTranslation from '../translations/bg.json';

// Initialize i18n instance
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      bg: {
        translation: bgTranslation
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
