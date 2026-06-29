import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationService, LANGUAGES } from '../services/translationService';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  availableLanguages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'vendoo_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr');

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
      }
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return TranslationService.t(key, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
