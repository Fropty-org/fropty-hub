"use client";

import { useState, useEffect, useRef } from "react";
import { CHART_OS_LABELS, CHART_OS_ABERTAS, MECANICOS } from "./data";

type ChartCtor = new (ctx: CanvasRenderingContext2D, cfg: object) => { destroy(): void };

const statCards = [
  { title: "Serviço mais realizado", value: "Troca de óleo e filtro", sub: "28 este mês", icon: "ti-tool", color: "#EF9F27" },
  { title: "Mecânico mais produtivo", value: "Carlos Silva", sub: "18 OS concluídas", icon: "ti-star", color: "#5B57E8" },
  { title: "Tempo médio de OS", value: "2,4 dias", sub: "", icon: "ti-clock", color: "#3b82f6" },
  { title: "Taxa de entrega no prazo", value: "91%", sub: "", icon: "ti-check", color: "#22c55e" },
];

const topServicos = [
  { medal: "🥇", name: "Troca de óleo e filtro", count: 28, revenue: 6160 },
  { medal: "🥈", name: "Revisão de freios", count: 21, revenue: 11340 },
  { medal: "🥉", name: "Alinhamento e balanceamento", count: 18, revenue: 5400 },
];

const tempoServicos = [
  { name: "Diagnóstico básico", tempo: "1,5h", warn: false },
  { name: "Troca de óleo", tempo: "0,8h", warn: false },
  { name: "Freios completo", tempo: "3,2h", warn: false },
  { name: "Motor/elétrica", tempo: "5,8h", warn: false },
  { name: "Funilaria/pintura", tempo: "12h", warn: true },
];

export default function Relatorios({ addToast }: { addToast: (type: "success"|"error"|"warning"|"info", msg: string) => void }) {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<{ destroy(): void } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;

    const drawChart = () => {
      if (!canvasRef.current) return;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      const ctx = canvasRef.current.getContext("2d");
      const Chart = (window as Window & { Chart?: ChartCtor }).Chart;
      if (!ctx || !Chart) return;
      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
          datasets: [{
            label: "Faturamento (R$)",
            data: [8200, 9400, 7800, 11200, 10600, 12840],
            backgroundColor: "#EF9F27",
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#888" } },
            y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#888", callback: (v: number) => `R$${(v/1000).toFixed(0)}k` } },
          },
        },
      });
    };

    if ((window as Window & { Chart?: ChartCtor }).Chart) {
      drawChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = drawChart;
      document.head.appendChild(script);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, height: 100 }}>
              <div style={{ background: "var(--surface-2)", borderRadius: 6, height: 14, width: "60%", marginBottom: 10 }} />
              <div style={{ background: "var(--surface-2)", borderRadius: 6, height: 24, width: "80%", marginBottom: 6 }} />
              <div style={{ background: "var(--surface-2)", borderRadius: 6, height: 12, width: "40%" }} />
            </div>
          ))}
        </div>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, height: 260 }}>
          <div style={{ background: "var(--surface-2)", borderRadius: 6, height: 14, width: "30%", marginBottom: 16 }} />
          <div style={{ background: "var(--surface-2)", borderRadius: 6, height: 200 }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${s.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{s.title}</div>
            </div>
            <div style={{ fontSize: s.value.length > 12 ? 14 : 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Faturamento — últimos 6 meses</div>
        <div style={{ height: 200 }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Top 3 serviços mais realizados</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topServicos.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{s.medal}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.count} OS</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{s.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                <div style={{ background: "var(--surface-2)", borderRadius: 3, height: 5, overflow: "hidden" }}>
                  <div style={{ width: `${(s.count / 28) * 100}%`, height: "100%", background: "#EF9F27", borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Tempo médio por tipo de serviço</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tempoServicos.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "var(--surface-2)", borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>{s.tempo}</span>
                {s.warn && <i className="ti ti-alert-triangle" style={{ color: "#EF9F27", fontSize: 15 }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => addToast("info", "Relatório da oficina gerado! Baixando...")}
        style={{ background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
      >
        <i className="ti ti-download" />
        Exportar relatório
      </button>
    </div>
  );
}
