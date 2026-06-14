"use client";

export function EcommerceDashboard() {
  const orders = [
    { id: "#4821", client: "Maria S.",    product: "Kit Skincare",     status: "Entregue",   val: "R$ 189" },
    { id: "#4820", client: "Pedro A.",    product: "Tênis Runner Pro", status: "Em trânsito", val: "R$ 349" },
    { id: "#4819", client: "Carla M.",    product: "Mochila Urban",    status: "Separando",  val: "R$ 220" },
    { id: "#4818", client: "Bruno K.",    product: "Relógio Smart",    status: "Entregue",   val: "R$ 599" },
    { id: "#4817", client: "Juliana T.",  product: "Fone Bluetooth",   status: "Entregue",   val: "R$ 159" },
  ];
  const statusColor: Record<string, string> = {
    "Entregue": "#10b981", "Em trânsito": "#f59e0b", "Separando": "#5B57E8",
  };
  const WEEKS = [55, 72, 48, 90, 63, 81, 77];

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0d1117" }}>
      {/* Sidebar */}
      <div style={{ width: 120, background: "#161b27", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "14px 0", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ padding: "0 12px 12px", marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#f1f5f9" }}>🛍️ ShopAdmin</div>
        </div>
        {[["📊","Visão Geral",true],["📦","Pedidos",false],["🏷️","Produtos",false],["👥","Clientes",false],["💬","Suporte",false]].map(([ic, label, active]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 12px", margin: "0 6px", borderRadius: 7, background: active ? "rgba(91,87,232,0.18)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 11 }}>{ic}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "#a5b4fc" : "#475569" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Visão Geral</div>
          <div style={{ fontSize: 9, padding: "3px 10px", borderRadius: 6, background: "#5B57E8", color: "#fff", fontWeight: 600 }}>+ Novo produto</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Pedidos hoje", v: "47",          e: "🛒" },
              { l: "Receita",      v: "R$ 12.840",   e: "💰" },
              { l: "Ticket médio", v: "R$ 273",       e: "📊" },
              { l: "Devoluções",   v: "2",             e: "↩️" },
            ].map(({ l, v, e }) => (
              <div key={l} style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 14, marginBottom: 4 }}>{e}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>{v}</div>
                <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Mini chart */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Vendas — últimos 7 dias</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52 }}>
              {WEEKS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div style={{ width: "100%", borderRadius: "3px 3px 0 0", height: `${h * 0.52}px`, background: i === 3 ? "#5B57E8" : "rgba(91,87,232,0.2)" }} />
                  <span style={{ fontSize: 7, color: "#334155" }}>D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Orders table */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Pedidos recentes</div>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr auto auto", gap: "5px 8px", alignItems: "center" }}>
              {["ID","Cliente","Produto","Status","Valor"].map(h => (
                <div key={h} style={{ fontSize: 7, color: "#334155", fontWeight: 700, textTransform: "uppercase", paddingBottom: 4, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</div>
              ))}
              {orders.map(({ id, client, product, status, val }) => (
                <>
                  <div key={id+"id"} style={{ fontSize: 8, color: "#5B57E8", fontWeight: 700 }}>{id}</div>
                  <div key={id+"cl"} style={{ fontSize: 8, color: "#cbd5e1" }}>{client}</div>
                  <div key={id+"pr"} style={{ fontSize: 8, color: "#94a3b8" }}>{product}</div>
                  <div key={id+"st"} style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: `${statusColor[status]}22`, color: statusColor[status], fontWeight: 700, whiteSpace: "nowrap" }}>{status}</div>
                  <div key={id+"vl"} style={{ fontSize: 9, fontWeight: 700, color: "#f1f5f9", textAlign: "right" }}>{val}</div>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
