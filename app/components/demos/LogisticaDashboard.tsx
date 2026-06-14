"use client";

export function LogisticaDashboard() {
  const deliveries = [
    { id: "BR-8821", dest: "São Paulo, SP",      driver: "Lucas M.",  eta: "14:30", status: "Em rota",    prog: 72 },
    { id: "BR-8820", dest: "Campinas, SP",        driver: "Rafael S.", eta: "15:10", status: "Em rota",    prog: 45 },
    { id: "BR-8819", dest: "Ribeirão Preto, SP",  driver: "Carlos L.", eta: "16:00", status: "Coletado",   prog: 20 },
    { id: "BR-8818", dest: "Santos, SP",           driver: "Paulo R.",  eta: "13:50", status: "Entregue",   prog: 100 },
    { id: "BR-8817", dest: "Sorocaba, SP",         driver: "Diego F.",  eta: "17:20", status: "Aguardando", prog: 0 },
  ];
  const statusColor: Record<string, string> = { "Em rota": "#5B57E8", Coletado: "#f59e0b", Entregue: "#10b981", Aguardando: "#475569" };

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0d1117" }}>
      {/* Sidebar */}
      <div style={{ width: 108, background: "#161b27", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div style={{ padding: "0 12px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#f1f5f9" }}>🚚 FleetView</div>
        </div>
        {[["🗺️","Mapa ao vivo",true],["📦","Entregas",false],["🚛","Frota",false],["📋","Romaneio",false],["📊","Relatórios",false]].map(([ic, label, active]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", margin: "0 6px", borderRadius: 6, background: active ? "rgba(245,158,11,0.12)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 11 }}>{ic}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "#fcd34d" : "#475569" }}>{label}</span>
          </div>
        ))}

        {/* Veículos */}
        <div style={{ margin: "12px 8px 0", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)", borderRadius: 8, padding: "8px" }}>
          <div style={{ fontSize: 7, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>Frota hoje</div>
          {[["Em rota","8","#5B57E8"],["Disponível","3","#10b981"],["Manutenção","1","#ef4444"]].map(([l, v, c]) => (
            <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: String(c) }} />
                <span style={{ fontSize: 8, color: "#64748b" }}>{l}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#e2e8f0" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Entregas em tempo real</div>
            <div style={{ fontSize: 8, color: "#475569" }}>Atualizado há 30 segundos</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, background: "rgba(16,185,129,0.12)", color: "#10b981", fontWeight: 600 }}>● Ao vivo</div>
            <button style={{ fontSize: 9, padding: "3px 8px", borderRadius: 6, border: "none", background: "#f59e0b", color: "#000", fontWeight: 700, cursor: "pointer" }}>+ Romaneio</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Entregas hoje", v: "47",   c: "#f59e0b" },
              { l: "Concluídas",   v: "31",    c: "#10b981" },
              { l: "Em rota",      v: "12",    c: "#5B57E8" },
              { l: "Ocorrências",  v: "2",     c: "#ef4444" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "#161b27", border: `1px solid ${c}28`, borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Deliveries list */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9" }}>Rastreamento de entregas</span>
            </div>
            {deliveries.map(({ id, dest, driver, eta, status, prog }, i) => (
              <div key={i} style={{ padding: "8px 12px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#f59e0b" }}>{id}</span>
                    <span style={{ fontSize: 9, color: "#e2e8f0" }}>{dest}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 8, color: "#475569" }}>ETA {eta}</span>
                    <div style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: `${statusColor[status]}22`, color: statusColor[status], fontWeight: 700 }}>{status}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 7, color: "#334155", width: 55 }}>🚛 {driver}</span>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ width: `${prog}%`, height: "100%", borderRadius: 2, background: statusColor[status], transition: "width 0.6s ease" }} />
                  </div>
                  <span style={{ fontSize: 7, color: "#475569", width: 24, textAlign: "right" }}>{prog}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
