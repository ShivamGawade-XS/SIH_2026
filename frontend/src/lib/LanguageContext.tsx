"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TRANSLATIONS } from "./i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => (TRANSLATIONS.en as any)[key] || String(key),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("honeychain_lang") as Language;
    if (saved && ["en", "hi", "bn", "ta", "kn"].includes(saved)) {
      setLangState(saved);
    }

    const onLangChanged = () => {
      const current = localStorage.getItem("honeychain_lang") as Language;
      if (current && ["en", "hi", "bn", "ta", "kn"].includes(current)) {
        setLangState(current);
      }
    };

    window.addEventListener("honeychain_lang_changed", onLangChanged);
    window.addEventListener("storage", onLangChanged);

    return () => {
      window.removeEventListener("honeychain_lang_changed", onLangChanged);
      window.removeEventListener("storage", onLangChanged);
    };
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("honeychain_lang", newLang);
    window.dispatchEvent(new Event("honeychain_lang_changed"));
  };

  const t = (key: string): string => {
    const dict = (TRANSLATIONS as any)[lang] || TRANSLATIONS.en;
    return dict[key] || (TRANSLATIONS.en as any)[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
