"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "mid" | "light";

const themes: { id: Theme; icon: string; label: string }[] = [
  { id: "light", icon: "☀️", label: "Claro" },
  { id: "mid",   icon: "⭐", label: "Médio" },
  { id: "dark",  icon: "🌙", label: "Escuro" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);
  }, []);

  function pick(t: Theme) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  if (!mounted) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: "3px 4px",
      }}
    >
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => pick(t.id)}
          title={t.label}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme === t.id ? "var(--primary)" : "transparent",
            transition: "background 0.2s",
          }}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
