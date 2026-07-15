"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Info, FileText, ShieldCheck, Scale } from "lucide-react";
import { useT } from "@/app/lib/i18n/I18nProvider";

const ITEMS = [
  { key: "help.about",    href: "/legal/about",    Icon: Info },
  { key: "help.terms",    href: "/legal/terms",    Icon: FileText },
  { key: "help.privacy",  href: "/legal/privacy",  Icon: ShieldCheck },
  { key: "help.licenses", href: "/legal/licenses", Icon: Scale },
];

export function HelpMenu() {
  const t = useT();
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
        aria-label={t("common.help")}
        aria-expanded={open}
        title={t("common.help")}
      >
        <HelpCircle size={18} />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 60,
            minWidth: 232, background: "var(--card-bg)", border: "1px solid var(--card-border)",
            borderRadius: 12, boxShadow: "var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.14))", padding: 6,
          }}
        >
          <p style={{ margin: 0, padding: "6px 10px 8px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
            {t("common.help")}
          </p>
          {ITEMS.map(({ key, href, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              role="menuitem"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, textDecoration: "none", color: "var(--text)", fontSize: "13.5px" }}
              className="hub-menu-item"
            >
              <Icon size={16} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              {t(key)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
