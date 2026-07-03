interface TrendPoint { label: string; value: number; }

/**
 * Mini gráfico de barras de tendência (SVG inline, sem dependência).
 * Renderiza uma série diária normalizada pelo pico, com destaque no maior dia.
 * Server component — estático, com <title> para tooltip nativo por barra.
 */
export function TrendBars({
  data,
  color = "var(--primary)",
  unit = "",
}: {
  data: TrendPoint[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a), data[0] ?? { label: "", value: 0 });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 84, marginBottom: 10 }}>
        {data.map((d, i) => {
          const h = d.value === 0 ? 2 : Math.max(4, Math.round((d.value / max) * 84));
          const isPeak = d.value === peak.value && d.value > 0;
          return (
            <div
              key={i}
              title={`${d.label}: ${d.value}${unit ? ` ${unit}` : ""}`}
              style={{
                flex: 1,
                height: h,
                borderRadius: "3px 3px 0 0",
                background: d.value === 0 ? "var(--surface-2)" : color,
                opacity: d.value === 0 ? 1 : isPeak ? 1 : 0.55,
                transition: "opacity 0.15s",
              }}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-faint)" }}>
        <span>{data[0]?.label ?? ""}</span>
        <span style={{ fontWeight: 700, color: "var(--text-muted)" }}>
          {total}{unit ? ` ${unit}` : ""} no período
        </span>
        <span>{data[data.length - 1]?.label ?? ""}</span>
      </div>
    </div>
  );
}
