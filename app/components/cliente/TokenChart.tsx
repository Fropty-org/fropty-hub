import type { TokenTransaction } from "@/app/lib/types/cliente";

interface Props {
  transactions: TokenTransaction[];
}

export function TokenChart({ transactions }: Props) {
  // Agrupa por mês (últimos 6 meses)
  const now   = new Date();
  const months: { key: string; label: string; credits: number; debits: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    months.push({ key, label, credits: 0, debits: 0 });
  }

  for (const tx of transactions) {
    const d   = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m   = months.find((mo) => mo.key === key);
    if (!m) continue;
    if (tx.type === "credit") m.credits += tx.amount;
    else m.debits += tx.amount;
  }

  const maxVal = Math.max(...months.flatMap((m) => [m.credits, m.debits]), 1);
  const chartH = 120;
  const barW   = 20;
  const gap    = 8;
  const colW   = barW * 2 + gap + 12; // two bars + gap + column margin
  const totalW = colW * months.length;
  const labelH = 20;

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "20px 24px",
        marginBottom: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-chart-bar" style={{ color: "var(--primary)" }} /> Consumo por mês
        </h2>
        <div style={{ display: "flex", gap: 14, fontSize: "11px", color: "var(--text-faint)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#22c55e" }} />
            Créditos
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#ef4444" }} />
            Débitos
          </span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          width={Math.max(totalW, 400)}
          height={chartH + labelH + 8}
          style={{ display: "block", overflow: "visible" }}
        >
          {/* Linhas de grade */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = chartH - frac * chartH;
            return (
              <line
                key={frac}
                x1={0}
                y1={y}
                x2={Math.max(totalW, 400)}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray={frac === 0 ? "0" : "4 4"}
              />
            );
          })}

          {months.map((m, i) => {
            const x        = i * colW + 6;
            const creditH  = (m.credits / maxVal) * chartH;
            const debitH   = (m.debits  / maxVal) * chartH;
            const labelX   = x + barW + gap / 2;

            return (
              <g key={m.key}>
                {/* Credits bar */}
                <rect
                  x={x}
                  y={chartH - creditH}
                  width={barW}
                  height={creditH}
                  rx={4}
                  fill="#22c55e"
                  opacity={0.85}
                />
                {/* Debits bar */}
                <rect
                  x={x + barW + gap}
                  y={chartH - debitH}
                  width={barW}
                  height={debitH}
                  rx={4}
                  fill="#ef4444"
                  opacity={0.8}
                />
                {/* Month label */}
                <text
                  x={labelX}
                  y={chartH + labelH}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--text-faint)"
                  style={{ fontFamily: "inherit" }}
                >
                  {m.label}
                </text>
                {/* Values on hover - shown as title */}
                {m.credits > 0 && (
                  <title>{`${m.label}: +${m.credits} créditos`}</title>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
