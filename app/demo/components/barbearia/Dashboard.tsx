"use client";

import { useEffect, useRef, useState } from "react";
import {
  AGENDAMENTOS,
  CHART_AGEND_DAYS,
  CHART_AGEND_VALUES,
} from "./data";

type AgendStatus = "confirmado" | "pendente" | "chegou" | "cancelado";

type BarbStatus = "aberta" | "fechada" | "lotada";

const STATUS_CONFIG: Record<BarbStatus, { label: string; bg: string; border: string }> = {
  aberta: { label: "🟢 Barbearia aberta", bg: "rgba(16,185,129,0.12)", border: "#10B981" },
  fechada: { label: "🔴 Fechada", bg: "rgba(239,68,68,0.12)", border: "#EF4444" },
  lotada: { label: "🟡 Lotada — sem vagas", bg: "rgba(239,159,39,0.12)", border: "#EF9F27" },
};

const STATUS_ORDER: BarbStatus[] = ["aberta", "fechada", "lotada"];

const STATUS_BADGE: Record<AgendStatus, { label: string; bg: string; color: string }> = {
  confirmado: { label: "Confirmado", bg: "rgba(91,87,232,0.15)", color: "#5B57E8" },
  pendente: { label: "Pendente", bg: "rgba(239,159,39,0.15)", color: "#EF9F27" },
  chegou: { label: "Chegou", bg: "rgba(16,185,129,0.15)", color: "#10B981" },
  cancelado: { label: "Cancelado", bg: "rgba(128,128,128,0.15)", color: "#888" },
};

function useCountUp(target: number, enabled: boolean, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, enabled, duration]);
  return value;
}

export default function Dashboard({
  addToast,
}: {
  addToast: (type: "success" | "error" | "warning" | "info", msg: string) => void;
}) {
  const [barbStatus, setBarbStatus] = useState<BarbStatus>("aberta");
  const [loaded, setLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  const agendCount = useCountUp(12, loaded);
  const clientCount = useCountUp(8, loaded);
  const faturCount = useCountUp(520, loaded);

  useEffect(() => {
    if (!loaded) return;
    type ChartCtor = new (ctx: CanvasRenderingContext2D, cfg: object) => { destroy(): void };
    type WinChart = Window & { Chart?: ChartCtor; chartInstanceBarb?: { destroy(): void } };
    const initChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = window as WinChart;
      if (w.chartInstanceBarb) {
        w.chartInstanceBarb.destroy();
      }
      const ctx = canvas.getContext("2d");
      if (!ctx || !w.Chart) return;
      w.chartInstanceBarb = new w.Chart(ctx, {
        type: "line",
        data: {
          labels: CHART_AGEND_DAYS,
          datasets: [
            {
              label: "Agendamentos",
              data: CHART_AGEND_VALUES,
              borderColor: "#c9a84c",
              backgroundColor: "rgba(201,168,76,0.12)",
              pointBackgroundColor: "#c9a84c",
              pointRadius: 5,
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { color: "#aaa" },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: "#aaa" },
              grid: { color: "rgba(255,255,255,0.05)" },
              beginAtZero: true,
            },
          },
        },
      });
    };

    if ((window as WinChart).Chart) {
      initChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js";
      script.onload = initChart;
      document.head.appendChild(script);
    }

    return () => {
      const ww = window as WinChart;
      if (ww.chartInstanceBarb) {
        ww.chartInstanceBarb.destroy();
        ww.chartInstanceBarb = undefined;
      }
    };
  }, [loaded]);

  function cycleStatus() {
    const idx = STATUS_ORDER.indexOf(barbStatus);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    setBarbStatus(next);
    const msgs: Record<BarbStatus, string> = {
      aberta: "Barbearia marcada como aberta.",
      fechada: "Barbearia marcada como fechada.",
      lotada: "Barbearia marcada como lotada — sem vagas.",
    };
    addToast("info", msgs[next]);
  }

  const proxAgend = AGENDAMENTOS.filter((a) => a.dia === 1)
    .sort((a, b) => a.hora.localeCompare(b.hora))
    .slice(0, 4);

  const cfg = STATUS_CONFIG[barbStatus];

  const metrics = [
    { label: "Agendamentos hoje", value: agendCount, display: String(agendCount), icon: "ti-calendar", color: "#c9a84c" },
    { label: "Clientes atendidos", value: clientCount, display: String(clientCount), icon: "ti-users", color: "#10B981" },
    { label: "Faturamento do dia", value: faturCount, display: `R$ ${faturCount}`, icon: "ti-currency-real", color: "#5B57E8" },
    { label: "Horário de pico", value: null, display: "10h–11h", icon: "ti-clock-hour-3", color: "#EF9F27" },
  ];

  if (!loaded) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Skeleton banner */}
        <div style={{ height: "52px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
        {/* Skeleton metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: "96px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
        {/* Skeleton chart */}
        <div style={{ height: "260px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <style>{`@keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        opacity: loaded ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Status banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderRadius: "10px",
          background: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text, #f0f0f0)" }}>
          {cfg.label}
        </span>
        <button
          onClick={cycleStatus}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: `1px solid ${cfg.border}`,
            borderRadius: "7px",
            padding: "6px 14px",
            color: "var(--text, #f0f0f0)",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Alterar status
        </button>
      </div>

      {/* Metric cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--surface, rgba(255,255,255,0.05))",
              border: "1px solid var(--border, rgba(255,255,255,0.1))",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  background: `${m.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: m.color,
                  fontSize: "18px",
                }}
              >
                <i className={`ti ${m.icon}`} />
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-muted, #888)", fontWeight: 500 }}>
                {m.label}
              </span>
            </div>
            <span style={{ fontSize: "26px", fontWeight: 700, color: m.color, letterSpacing: "-0.5px" }}>
              {m.display}
            </span>
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div
        style={{
          background: "var(--surface, rgba(255,255,255,0.05))",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "16px", fontWeight: 600, fontSize: "15px", color: "var(--text, #f0f0f0)" }}>
          <i className="ti ti-chart-line" style={{ marginRight: "8px", color: "#c9a84c" }} />
          Agendamentos — últimos 7 dias
        </div>
        <div style={{ height: "200px", position: "relative" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "200px" }} />
        </div>
      </div>

      {/* Próximos agendamentos */}
      <div
        style={{
          background: "var(--surface, rgba(255,255,255,0.05))",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: "12px",
          padding: "20px",
        }}
      >
        <div style={{ marginBottom: "16px", fontWeight: 600, fontSize: "15px", color: "var(--text, #f0f0f0)" }}>
          <i className="ti ti-calendar-event" style={{ marginRight: "8px", color: "#5B57E8" }} />
          Próximos agendamentos — Terça
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {proxAgend.map((a) => {
            const badge = STATUS_BADGE[a.status];
            return (
              <div
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "9px",
                  background: "var(--surface-2, rgba(255,255,255,0.04))",
                  flexWrap: "wrap",
                }}
              >
                {/* Hour pill */}
                <span
                  style={{
                    background: "rgba(201,168,76,0.15)",
                    color: "#c9a84c",
                    borderRadius: "6px",
                    padding: "3px 9px",
                    fontSize: "12px",
                    fontWeight: 700,
                    minWidth: "54px",
                    textAlign: "center",
                  }}
                >
                  {a.hora}
                </span>
                {/* Client name */}
                <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text, #f0f0f0)", flex: 1, minWidth: "100px" }}>
                  {a.clienteNome}
                </span>
                {/* Service chip */}
                <span
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    borderRadius: "6px",
                    padding: "3px 9px",
                    fontSize: "12px",
                    color: "var(--text-muted, #aaa)",
                  }}
                >
                  {a.servico}
                </span>
                {/* Barbeiro */}
                <span style={{ fontSize: "12px", color: "var(--text-muted, #888)" }}>
                  {a.barbeiro}
                </span>
                {/* Status badge */}
                <span
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    borderRadius: "6px",
                    padding: "3px 9px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
