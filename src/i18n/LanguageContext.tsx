import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, translations } from './translations';
import { Globe } from 'lucide-react';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const STORAGE_KEY = 'myai_vault_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'ta' || saved === 'ja' || saved === 'es')) {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary if key missing in target language
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

/**
 * Reusable Language Selector Dropdown Component
 * Fits cleanly into headers and navigation bars
 */
export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F3EA] border border-[#E5E0D8] text-xs font-semibold text-[#2F3437] shadow-xs transition-colors"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#0F4C4C]" />
        <span>{currentOption.nativeLabel}</span>
        <span className="text-[10px] text-[#8A9095]">▼</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for closing dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-[#E5E0D8] shadow-lg py-1.5 z-50 animate-fadeIn">
            {SUPPORTED_LANGUAGES.map((option) => (
              <button
                key={option.code}
                onClick={() => {
                  setLanguage(option.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  language === option.code
                    ? 'bg-[#EAF0EC] text-[#0F4C4C] font-bold'
                    : 'text-[#2F3437] hover:bg-[#F7F3EA]'
                }`}
              >
                <span>{option.nativeLabel}</span>
                <span className="text-[10px] text-[#8A9095] uppercase font-mono">{option.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
