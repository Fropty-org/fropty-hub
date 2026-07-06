"use client";

import { useEffect } from "react";
import { signOut } from "@/app/actions/auth";

/**
 * Logoff automático após 2h de sessão aberta (timeout absoluto), forçando
 * nova autenticação/login. O marco de início fica em localStorage e é limpo
 * na página de login, de modo que cada novo login reinicia a contagem.
 */
const MAX_SESSION_MS = 2 * 60 * 60 * 1000; // 2 horas
const START_KEY = "hub-session-start";

export function SessionTimeout() {
  useEffect(() => {
    let start = Number(localStorage.getItem(START_KEY));
    if (!start || Number.isNaN(start)) {
      start = Date.now();
      localStorage.setItem(START_KEY, String(start));
    }

    async function expire() {
      localStorage.removeItem(START_KEY);
      try {
        const result = await signOut();
        window.location.href = result?.redirectTo ?? "/area-cliente?expirado=1";
      } catch {
        window.location.href = "/area-cliente?expirado=1";
      }
    }

    const remaining = start + MAX_SESSION_MS - Date.now();
    if (remaining <= 0) {
      expire();
      return;
    }
    const timer = setTimeout(expire, remaining);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
