"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { DICTS, DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_LABELS, isLocale, type Locale, type Dict } from "./config";

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  /** Tradução por caminho pontilhado (ex.: "help.terms"). Cai no PT e depois na própria chave. */
  t: (path: string) => string;
  /** Dicionário ativo — útil para conteúdo estruturado (ex.: seções das páginas legais). */
  dict: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: Dict, path: string): string | undefined {
  const val = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof val === "string" ? val : undefined;
}

export function I18nProvider({ initialLocale, children }: { initialLocale?: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  // Reconcilia com a preferência salva no cliente (caso o SSR não tenha o cookie).
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_COOKIE);
      if (isLocale(stored) && stored !== locale) setLocaleState(stored);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_LABELS[locale].htmlLang;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(LOCALE_COOKIE, l); } catch {}
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
  }, []);

  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];

  const t = useCallback(
    (path: string) => lookup(dict, path) ?? lookup(DICTS[DEFAULT_LOCALE], path) ?? path,
    [dict],
  );

  return <I18nContext.Provider value={{ locale, setLocale, t, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback seguro fora do provider (ex.: testes) — usa PT.
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      t: (path) => lookup(DICTS[DEFAULT_LOCALE], path) ?? path,
      dict: DICTS[DEFAULT_LOCALE],
    };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}
