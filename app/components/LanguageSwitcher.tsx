"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/app/lib/i18n/I18nProvider";
import { LOCALES, LOCALE_LABELS } from "@/app/lib/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hub-topbar-iconbtn"
        aria-label={t("common.language")}
        aria-expanded={open}
        title={t("common.language")}
        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        <Globe size={18} />
        <span style={{ fontSize: "11px", fontWeight: 700 }}>{LOCALE_LABELS[locale].short}</span>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
            minWidth: 176, background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 12, boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.14))", padding: 6,
          }}
        >
          <p style={{ margin: 0, padding: "6px 10px 8px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
            {t("common.language")}
          </p>
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => { setLocale(l); setOpen(false); }}
              className="hub-menu-item"
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", color: "var(--text)", fontSize: "13.5px", textAlign: "left" }}
            >
              <span style={{ width: 22, fontSize: "11px", fontWeight: 700, color: "var(--text-faint)" }}>{LOCALE_LABELS[l].short}</span>
              <span style={{ flex: 1 }}>{LOCALE_LABELS[l].label}</span>
              {l === locale && <Check size={15} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
