"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateTheme } from "@/app/actions/profile";

type Theme = "dark" | "light";

interface Props {
  initialTheme: Theme;
  size?: number;
}

export function PortalThemeToggle({ initialTheme, size = 32 }: Props) {
  const ref                     = useRef<HTMLButtonElement>(null);
  const [isDark, setIsDark]     = useState(initialTheme === "dark");
  const [mounted, setMounted]   = useState(false);
  const [, startTransition]     = useTransition();

  useEffect(() => {
    // A escolha viva da sessão fica no localStorage — ele é a fonte de verdade.
    // O initialTheme (perfil no DB) é só fallback quando ainda não há nada salvo.
    // NUNCA sobrescrever o localStorage/DOM aqui, senão remontar o toggle (ex.:
    // ao abrir o menu do usuário) reverteria o tema escolhido.
    const stored = localStorage.getItem("fropty-theme");
    const current: Theme = stored === "dark" || stored === "light" ? stored : initialTheme;
    document.documentElement.classList.toggle("dark", current === "dark");
    if (stored !== current) localStorage.setItem("fropty-theme", current);
    setIsDark(current === "dark");
    setMounted(true);
  }, [initialTheme]);

  function toggle() {
    const next = !isDark;

    const apply = () => {
      setIsDark(next);
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("fropty-theme", next ? "dark" : "light");
      startTransition(() => updateTheme(next ? "dark" : "light"));
    };

    if (
      !ref.current ||
      !("startViewTransition" in document) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply();
      return;
    }

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top)
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vt = (document as any).startViewTransition(apply);

    vt.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }

  if (!mounted) {
    return (
      <div style={{ width: size, height: size, borderRadius: 7, flexShrink: 0 }} />
    );
  }

  return (
    <button
      ref={ref}
      onClick={toggle}
      aria-label="Alternar tema"
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 7,
        border: "1px solid var(--border)",
        background: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-muted)",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Sun */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity",
          transform: isDark ? "rotate(90deg) scale(0.4)" : "rotate(0deg) scale(1)",
          opacity: isDark ? 0 : 1,
          transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
        }}
      >
        <svg width={Math.round(size * 0.47)} height={Math.round(size * 0.47)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>

      {/* Moon */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          willChange: "transform, opacity",
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.4)",
          opacity: isDark ? 1 : 0,
          transition: "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease",
        }}
      >
        <svg width={Math.round(size * 0.44)} height={Math.round(size * 0.44)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
