import { cookies } from "next/headers";
import { DICTS, DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Dict, type Locale } from "./config";

function lookup(dict: Dict, path: string): string | undefined {
  const val = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof val === "string" ? val : undefined;
}

/** Versão server-side do i18n: lê o cookie de idioma e devolve `t`/`dict`/`locale`. */
export async function getServerI18n(): Promise<{ locale: Locale; dict: Dict; t: (path: string, vars?: Record<string, string | number>) => string }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const dict = DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
  const t = (path: string, vars?: Record<string, string | number>) => {
    const s = lookup(dict, path) ?? lookup(DICTS[DEFAULT_LOCALE], path) ?? path;
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
  };
  return { locale, dict, t };
}
