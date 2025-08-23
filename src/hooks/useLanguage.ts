// Language management hook with localStorage persistence
// Provides translation function and language switching

import { useState, useEffect, useCallback } from 'react';
import { translations, type TranslationKey } from '../lib/i18n';

type Language = 'ja' | 'en';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('ja');

  useEffect(() => {
    const saved = localStorage.getItem('rainbow-match-language') as Language;
    if (saved && (saved === 'ja' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const switchLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('rainbow-match-language', newLang);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations.ja[key] || key;
  }, [language]);

  return {
    language,
    switchLanguage,
    t
  };
}