"use client";

export function RHDashboard() {
  const team = [
    { name: "Ana Costa",      role: "Designer UI",       dept: "Produto",  status: "Ativo",   perf: 94 },
    { name: "Carlos Lima",    role: "Dev Backend",        dept: "Tech",     status: "Ativo",   perf: 88 },
    { name: "Fernanda Reis",  role: "Marketing Digital",  dept: "Growth",   status: "Férias",  perf: 91 },
    { name: "Paulo Mendes",   role: "Suporte N1",         dept: "CS",       status: "Ativo",   perf: 76 },
    { name: "Juliana Torres", role: "Product Manager",    dept: "Produto",  status: "Ativo",   perf: 97 },
  ];
  const statusColor: Record<string, string> = { Ativo: "#10b981", Férias: "#f59e0b" };

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0d1117" }}>
      {/* Sidebar */}
      <div style={{ width: 108, background: "#161b27", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div style={{ padding: "0 12px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#f1f5f9" }}>👥 PeopleHub</div>
        </div>
        {[["🏠","Visão Geral",true],["👤","Colaboradores",false],["📅","Ponto",false],["🎯","Metas",false],["💬","Feedbacks",false]].map(([ic, label, active]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", margin: "0 6px", borderRadius: 6, background: active ? "rgba(236,72,153,0.12)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 11 }}>{ic}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "#f9a8d4" : "#475569" }}>{label}</span>
          </div>
        ))}
        {/* Dept pills */}
        <div style={{ margin: "12px 8px 0" }}>
          <div style={{ fontSize: 7, color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em", padding: "0 4px" }}>Departamentos</div>
          {[["Produto","#ec4899"],["Tech","#5B57E8"],["Growth","#10b981"],["CS","#f59e0b"]].map(([d, c]) => (
            <div key={String(d)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 6px", borderRadius: 5, marginBottom: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: String(c) }} />
                <span style={{ fontSize: 8, color: "#64748b" }}>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Gestão de Equipes</div>
          <button style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, border: "none", background: "#ec4899", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Colaborador</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Colaboradores", v: "28",   c: "#ec4899" },
              { l: "Satisfação",    v: "91%",  c: "#10b981" },
              { l: "Turnover",      v: "3,2%", c: "#f59e0b" },
              { l: "Vagas abertas", v: "4",    c: "#5B57E8" },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ background: "#161b27", border: `1px solid ${c}28`, borderRadius: 9, padding: "9px 10px" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Team table */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#f1f5f9" }}>Colaboradores</span>
              <input placeholder="Buscar..." style={{ fontSize: 8, padding: "3px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#64748b", outline: "none", width: 80 }} />
            </div>
            {team.map(({ name, role, dept, status, perf }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${i * 60 + 280},60%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {name[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "#e2e8f0" }}>{name}</div>
                  <div style={{ fontSize: 8, color: "#475569" }}>{role} · {dept}</div>
                </div>
                <div style={{ fontSize: 7, padding: "2px 6px", borderRadius: 4, background: `${statusColor[status]}22`, color: statusColor[status], fontWeight: 700 }}>{status}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${perf}%`, height: "100%", borderRadius: 2, background: perf >= 90 ? "#10b981" : perf >= 80 ? "#5B57E8" : "#f59e0b" }} />
                  </div>
                  <span style={{ fontSize: 8, color: "#64748b", width: 22 }}>{perf}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
