"use client";

import { useEffect, useState, useTransition } from "react";
import { Sun, Moon } from "lucide-react";
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
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    localStorage.setItem("fropty-theme", initialTheme);
    setMounted(true);
  }, [initialTheme]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("fropty-theme", next);
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
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
