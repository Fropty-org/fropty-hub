import pt from "./locales/pt.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

/**
 * i18n do Hub. Para adicionar um novo idioma:
 *   1. crie `locales/<code>.json` (copie pt.json e traduza);
 *   2. importe aqui e adicione em LOCALES + DICTS + LOCALE_LABELS.
 * Nada mais precisa mudar — o seletor e o provider leem daqui.
 */
export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "hub_locale";

// Rótulo curto exibido no seletor (globinho).
export const LOCALE_LABELS: Record<Locale, { label: string; short: string; htmlLang: string }> = {
  pt: { label: "Português", short: "PT", htmlLang: "pt-BR" },
  en: { label: "English",   short: "EN", htmlLang: "en" },
  es: { label: "Español",   short: "ES", htmlLang: "es" },
};

// pt é a fonte da verdade da estrutura; os demais seguem o mesmo shape.
export type Dict = typeof pt;
export const DICTS: Record<Locale, Dict> = {
  pt,
  en: en as Dict,
  es: es as Dict,
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
