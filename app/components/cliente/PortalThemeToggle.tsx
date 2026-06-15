"use client";

import { useEffect, useState, useTransition } from "react";
import { updateTheme } from "@/app/actions/profile";

type Theme = "dark" | "light";

interface Props {
  /** Preferência salva no perfil — carregada pelo servidor */
  initialTheme: Theme;
}

export function PortalThemeToggle({ initialTheme }: Props) {
  const [theme, setTheme]   = useState<Theme>(initialTheme);
  const [mounted, setMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", initialTheme);
    localStorage.setItem("theme", initialTheme);
    setMounted(true);
  }, [initialTheme]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    startTransition(() => updateTheme(next));
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "1px solid var(--border)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
        color: "var(--text-muted)",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"}`} style={{ fontSize: 15 }} />
    </button>
  );
}
