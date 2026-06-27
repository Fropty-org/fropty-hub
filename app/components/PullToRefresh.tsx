"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const THRESHOLD    = 72;  // px necessários para acionar o refresh
const MAX_PULL     = 100; // px máximo de arrasto visual

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router        = useRouter();
  const startY        = useRef(0);
  const pulling       = useRef(false);
  const [pullDist, setPullDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Só ativa se o scroll do container estiver no topo
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const dist = Math.max(0, e.touches[0].clientY - startY.current);
    // Resistência progressiva: quanto mais puxa, menos avança
    setPullDist(Math.min(MAX_PULL, dist * 0.5));
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDist >= THRESHOLD * 0.5) {
      setRefreshing(true);
      setPullDist(48); // mantém indicador visível durante refresh
      await new Promise<void>((resolve) => {
        router.refresh();
        // Aguarda um tick para o Next.js processar o refresh
        setTimeout(resolve, 800);
      });
      setRefreshing(false);
    }
    setPullDist(0);
  }, [pullDist, router]);

  const progress = Math.min(1, pullDist / (THRESHOLD * 0.5));
  const ready    = progress >= 1;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: "relative", flex: 1, overflowY: "auto", overflowX: "hidden" }}
    >
      {/* Indicador de pull */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: `translateX(-50%) translateY(${pullDist - 44}px)`,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: pullDist === 0 ? "transform 0.25s ease" : "none",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {refreshing ? (
          <Loader2 size={18} style={{ color: "var(--primary)", animation: "spin 0.7s linear infinite" }} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ transform: `rotate(${progress * 180}deg)`, transition: "transform 0.1s", color: ready ? "var(--primary)" : "var(--text-faint)" }}>
            <path d="M9 3v10M5 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </div>

      {/* Empurra o conteúdo para baixo durante o pull */}
      <div style={{ transform: `translateY(${pullDist}px)`, transition: pullDist === 0 ? "transform 0.25s ease" : "none" }}>
        {children}
      </div>
    </div>
  );
}
