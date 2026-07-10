"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useLocale, useMessages } from "next-intl";

interface I18nContextType {
  lang: string;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  t: (key: string) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const messages = useMessages();

  const t = useCallback(
    (key: string): string => {
      const parts = key.split(".");
      let current: any = messages;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          return key;
        }
      }
      return typeof current === "string" ? current : key;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ lang: locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  return useContext(I18nContext);
}
