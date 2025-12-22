import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';

const getInitialLocale = (): string => {
  const savedLocale = localStorage.getItem('user-locale');
  if (savedLocale) {
    return savedLocale;
  }
  const browserLocale = navigator.language.toLowerCase();
  return browserLocale.startsWith('zh') ? 'zh' : 'en';
};

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLocale(), // default locale
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
});

export default i18n;