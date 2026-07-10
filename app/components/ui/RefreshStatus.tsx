"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Indicador de "última atualização" com polling.
 *
 * - Registra o momento em que os dados desta tela foram carregados.
 * - A cada `intervalMs` (padrão 5 min) chama router.refresh() — re-executa os
 *   server components e busca dados novos — voltando o selo para "agora".
 * - Clicar força uma atualização imediata (com ícone girando).
 * - Verde enquanto recém-atualizado ("agora"); amarelo quando o dado já está
 *   no passado ("há N min" / horário), sinalizando que pode estar desatualizado.
 */
const FRESH_MS = 60 * 1000; // até 1 min = "agora" (verde)

interface Props {
  intervalMs?: number;
}

function label(ageMs: number, at: number): string {
  if (ageMs < FRESH_MS) return "Atualizado agora";
  const min = Math.floor(ageMs / 60000);
  if (min < 60) return `Atualizado há ${min} min`;
  const d = new Date(at);
  return `Atualizado às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function RefreshStatus({ intervalMs = 5 * 60 * 1000 }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lastAt, setLastAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const hover = useRef(false);

  function refresh() {
    startTransition(() => {
      router.refresh();
      setLastAt(Date.now());
    });
  }

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const poll = setInterval(() => refresh(), intervalMs);
    return () => { clearInterval(tick); clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs]);

  const age    = now - lastAt;
  const fresh  = age < FRESH_MS && !pending;
  const color  = pending || fresh ? "var(--c-success)" : "var(--c-warning)";
  const text   = pending ? "Atualizando…" : label(age, lastAt);

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={pending}
      title="Clique para atualizar os dados agora"
      onMouseEnter={(e) => { hover.current = true; e.currentTarget.style.borderColor = `color-mix(in srgb, ${color} 45%, transparent)`; }}
      onMouseLeave={(e) => { hover.current = false; e.currentTarget.style.borderColor = "var(--border)"; }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 8,
        background: `color-mix(in srgb, ${color} 9%, var(--surface-2))`,
        border: "1px solid var(--border)",
        cursor: pending ? "wait" : "pointer", fontFamily: "inherit",
        transition: "border-color 0.15s, background 0.3s",
      }}
    >
      <RefreshCw size={12} style={{ color, animation: pending ? "spin 0.8s linear infinite" : undefined }} />
      <span style={{ fontSize: "12px", color, fontWeight: 600 }}>{text}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </button>
  );
}
