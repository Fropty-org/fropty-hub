"use client";
import { useEffect, useRef, useState } from "react";
import {
  DASHBOARD_OS_STATS,
  CHART_OS_LABELS,
  CHART_OS_ABERTAS,
  CHART_OS_FECHADAS,
  ORDENS,
  OS_STATUS_MAP,
} from "./data";

interface Props {
  addToast: (type: "success" | "error" | "warning" | "info", msg: string) => void;
}

function useAnimatedCounter(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function MetricCard({
  label,
  value,
  icon,
  color,
  prefix = "",
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  prefix?: string;
}) {
  const animated = useAnimatedCounter(value);
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        flex: "1 1 180px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
            fontSize: 20,
          }}
        >
          <i className={`ti ${icon}`} />
        </div>
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
        {prefix}
        {animated.toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

export default function Dashboard({ addToast }: Props) {
  const [loading, setLoading] = useState(true);
  type ChartCtor = new (ctx: CanvasRenderingContext2D, cfg: object) => { destroy(): void };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<{ destroy(): void } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    const initChart = () => {
      if (!canvasRef.current) return;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const Chart = (window as Window & { Chart?: ChartCtor }).Chart;
      if (!Chart) return;
      chartRef.current = new Chart(canvasRef.current.getContext("2d") as CanvasRenderingContext2D, {
        type: "bar",
        data: {
          labels: CHART_OS_LABELS,
          datasets: [
            {
              label: "OS Abertas",
              data: CHART_OS_ABERTAS,
              backgroundColor: "#EF9F27",
              borderRadius: 4,
            },
            {
              label: "OS Fechadas",
              data: CHART_OS_FECHADAS,
              backgroundColor: "#10B981",
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, labels: { color: "rgba(255,255,255,0.7)" } },
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "rgba(255,255,255,0.4)" },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "rgba(255,255,255,0.4)" },
            },
          },
        },
      });
    };

    if ((window as Window & { Chart?: ChartCtor }).Chart) {
      initChart();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = initChart;
      document.head.appendChild(script);
    }
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return (
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              height: 80,
              borderRadius: 14,
              background: "var(--surface-2)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>
    );
  }

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (s: string) => s;

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Alert cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <div
          style={{
            flex: "1 1 260px",
            border: "1px solid rgba(239,68,68,0.4)",
            background: "rgba(239,68,68,0.08)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <i className="ti ti-alert-triangle" style={{ color: "#EF4444", fontSize: 22 }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
              3 peças com estoque crítico
            </div>
          </div>
          <button
            onClick={() => addToast("info", "Abrindo estoque...")}
            style={{
              background: "transparent",
              border: "1px solid #EF4444",
              color: "#EF4444",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            Ver estoque
          </button>
        </div>
        <div
          style={{
            flex: "1 1 260px",
            border: "1px solid rgba(239,159,39,0.4)",
            background: "rgba(239,159,39,0.08)",
            borderRadius: 12,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <i className="ti ti-clock" style={{ color: "#EF9F27", fontSize: 22 }} />
          <div style={{ flex: 1 }}>
            <div style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>
              2 OS aguardando aprovação
            </div>
          </div>
          <button
            onClick={() => addToast("info", "Abrindo ordens...")}
            style={{
              background: "transparent",
              border: "1px solid #EF9F27",
              color: "#EF9F27",
              borderRadius: 8,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            Ver OS
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        <MetricCard label="OS Abertas" value={7} icon="ti-clipboard-list" color="#EF9F27" />
        <MetricCard label="Veículos na oficina" value={5} icon="ti-car" color="#5B57E8" />
        <MetricCard
          label="Faturamento do mês"
          value={12840}
          icon="ti-currency-real"
          color="#10B981"
          prefix="R$"
        />
        <MetricCard label="Peças críticas" value={3} icon="ti-alert-triangle" color="#EF4444" />
      </div>

      {/* Chart */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 14,
          padding: "20px 24px",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>
          OS abertas vs. fechadas — esta semana
        </div>
        <canvas ref={canvasRef} style={{ maxHeight: 200 }} />
      </div>

      {/* Últimas 5 OS */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 14,
          padding: "20px 24px",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)", marginBottom: 16 }}>
          Últimas Ordens de Serviço
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ORDENS.slice(0, 5).map((os) => {
            const statusInfo = OS_STATUS_MAP[os.status];
            return (
              <div
                key={os.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 8px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "default",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "var(--surface-2)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background = "transparent")
                }
              >
                <span
                  style={{
                    background: "rgba(239,159,39,0.15)",
                    color: "#EF9F27",
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {os.id}
                </span>
                <span style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>
                  {os.clienteNome}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {os.veiculo.marca} {os.veiculo.modelo} • {os.veiculo.placa}
                </span>
                <span
                  style={{
                    background: statusInfo.bg,
                    color: statusInfo.color,
                    borderRadius: 20,
                    padding: "2px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {statusInfo.label}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontWeight: 700,
                    color: "var(--text)",
                    fontSize: 14,
                  }}
                >
                  {formatBRL(os.valorTotal)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
