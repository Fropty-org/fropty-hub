"use client";

export function MarketingDashboard() {
  const campaigns = [
    { name: "Google Ads · Marca",    spend: "R$ 1.200", clicks: "4.820", conv: "142", cpa: "R$ 8,45",  status: "Ativo" },
    { name: "Meta · Remarketing",    spend: "R$ 890",   clicks: "6.310", conv: "98",  cpa: "R$ 9,08",  status: "Ativo" },
    { name: "TikTok · Prospecção",   spend: "R$ 650",   clicks: "9.102", conv: "61",  cpa: "R$ 10,65", status: "Pausada" },
    { name: "Google · Display",      spend: "R$ 430",   clicks: "2.450", conv: "34",  cpa: "R$ 12,64", status: "Ativo" },
  ];
  const FUNNEL = [100, 72, 41, 18, 9];
  const F_LABELS = ["Impressões","Cliques","Leads","Oportunidades","Vendas"];

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0d1117" }}>
      {/* Sidebar */}
      <div style={{ width: 110, background: "#161b27", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "12px 0", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ padding: "0 12px 10px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9" }}>📡 Tráfego Pro</div>
        </div>
        {[["📊","Dashboard",true],["📢","Campanhas",false],["🎯","Audiências",false],["📈","Relatórios",false],["🔗","Integrações",false]].map(([ic, label, active]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", margin: "0 6px", borderRadius: 6, background: active ? "rgba(91,87,232,0.18)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 11 }}>{ic}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "#a5b4fc" : "#475569" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Painel de Tráfego</div>
          <div style={{ fontSize: 8, color: "#475569" }}>Últimos 30 dias · Todas as plataformas</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Investimento", v: "R$ 3.170", c: "#f59e0b" },
              { l: "Total cliques", v: "22.682",   c: "#5B57E8" },
              { l: "Conversões",   v: "335",        c: "#10b981" },
              { l: "ROAS",         v: "4,2×",       c: "#ec4899" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "#161b27", border: `1px solid ${c}30`, borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 8, color: "#475569", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 8 }}>
            {/* Campaigns table */}
            <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Campanhas ativas</div>
              {campaigns.map(({ name, spend, clicks, cpa, status }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none", gap: 4 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{name}</div>
                    <div style={{ fontSize: 7, color: "#475569" }}>{spend} · {clicks} cliques · CPA {cpa}</div>
                  </div>
                  <div style={{ fontSize: 7, padding: "2px 5px", borderRadius: 4, background: status === "Ativo" ? "#10b98122" : "#f59e0b22", color: status === "Ativo" ? "#10b981" : "#f59e0b", fontWeight: 700, flexShrink: 0 }}>{status}</div>
                </div>
              ))}
            </div>

            {/* Funnel */}
            <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#f1f5f9", marginBottom: 2 }}>Funil</div>
              {FUNNEL.map((w, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ height: 8, borderRadius: 3, background: `rgba(91,87,232,${0.3 + i * 0.15})`, width: `${w}%`, transition: "width 0.4s" }} />
                  <span style={{ fontSize: 7, color: "#334155", whiteSpace: "nowrap" }}>{F_LABELS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
