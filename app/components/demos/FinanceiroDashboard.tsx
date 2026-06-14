"use client";

const BARS = [42, 67, 55, 80, 63, 91, 74, 88, 59, 76, 95, 83];
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

export function FinanceiroDashboard() {
  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0f1117" }}>
      {/* Sidebar */}
      <div style={{ width: 48, background: "#161b27", display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", gap: 20, borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: "#5B57E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>F</div>
        {["📊","💳","📈","📋","⚙️"].map((ic, i) => (
          <div key={i} style={{ fontSize: 14, opacity: i === 0 ? 1 : 0.4, cursor: "pointer" }}>{ic}</div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>Dashboard Financeiro</div>
            <div style={{ fontSize: 9, color: "#475569" }}>Junho 2025 · Atualizado agora</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["Semana","Mês","Ano"].map((l, i) => (
              <button key={l} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, border: "none", background: i === 1 ? "#5B57E8" : "rgba(255,255,255,0.06)", color: i === 1 ? "#fff" : "#64748b", cursor: "pointer" }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              { label: "Receita", val: "R$ 84.290", delta: "+12%", up: true },
              { label: "Despesas", val: "R$ 31.450", delta: "-4%", up: false },
              { label: "Lucro", val: "R$ 52.840", delta: "+18%", up: true },
              { label: "Clientes", val: "1.248", delta: "+7%", up: true },
            ].map(({ label, val, delta, up }) => (
              <div key={label} style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 8, color: "#475569", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9", marginBottom: 3 }}>{val}</div>
                <div style={{ fontSize: 9, fontWeight: 600, color: up ? "#10b981" : "#ef4444" }}>{delta} vs mês ant.</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9" }}>Receita mensal</div>
              <div style={{ fontSize: 9, color: "#10b981", fontWeight: 600 }}>▲ R$ 84.290 total</div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 72 }}>
              {BARS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{
                    width: "100%", borderRadius: "3px 3px 0 0",
                    height: `${h * 0.72}px`,
                    background: i === 5 ? "#5B57E8" : "rgba(91,87,232,0.25)",
                    transition: "background 0.2s",
                  }} />
                  <div style={{ fontSize: 7, color: "#334155" }}>{MONTHS[i]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Últimas transações</div>
            {[
              { name: "Plano Pro · João M.",   cat: "Assinatura", val: "+ R$ 499", color: "#10b981" },
              { name: "Infra AWS",              cat: "Despesa",    val: "- R$ 312", color: "#ef4444" },
              { name: "Plano Básico · Ana L.",  cat: "Assinatura", val: "+ R$ 249", color: "#10b981" },
              { name: "Domínio renovado",       cat: "Despesa",    val: "- R$ 89",  color: "#ef4444" },
            ].map(({ name, cat, val, color }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(91,87,232,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {cat === "Assinatura" ? "💳" : "📤"}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0" }}>{name}</div>
                    <div style={{ fontSize: 8, color: "#475569" }}>{cat}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
