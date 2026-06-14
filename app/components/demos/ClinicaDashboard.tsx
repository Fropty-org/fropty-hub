"use client";

export function ClinicaDashboard() {
  const agenda = [
    { hora: "08:00", paciente: "Maria Oliveira",   tipo: "Retorno",    dr: "Dra. Ana",   status: "Confirmado" },
    { hora: "09:00", paciente: "João Pereira",      tipo: "Consulta",   dr: "Dr. Carlos", status: "Aguardando" },
    { hora: "09:30", paciente: "Fernanda Lima",     tipo: "Exame",      dr: "Dra. Ana",   status: "Confirmado" },
    { hora: "10:00", paciente: "Ricardo Souza",     tipo: "Consulta",   dr: "Dr. Paulo",  status: "Confirmado" },
    { hora: "11:00", paciente: "Camila Santos",     tipo: "Retorno",    dr: "Dra. Ana",   status: "Cancelado"  },
  ];
  const statusColor: Record<string, string> = { Confirmado: "#10b981", Aguardando: "#f59e0b", Cancelado: "#ef4444" };

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: "system-ui, sans-serif", background: "#0d1117" }}>
      {/* Sidebar */}
      <div style={{ width: 112, background: "#161b27", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div style={{ padding: "0 12px 10px" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#f1f5f9" }}>🏥 ClínicaOS</div>
        </div>
        {[["📅","Agenda",true],["👥","Pacientes",false],["💊","Prontuários",false],["💳","Financeiro",false],["📊","Relatórios",false]].map(([ic, label, active]) => (
          <div key={String(label)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", margin: "0 6px", borderRadius: 6, background: active ? "rgba(14,165,233,0.15)" : "transparent", cursor: "pointer" }}>
            <span style={{ fontSize: 11 }}>{ic}</span>
            <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, color: active ? "#7dd3fc" : "#475569" }}>{label}</span>
          </div>
        ))}

        {/* Mini stats */}
        <div style={{ margin: "12px 8px 0", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: 8, padding: "8px" }}>
          <div style={{ fontSize: 8, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hoje</div>
          {[["Consultas","12"],["Retornos","5"],["Cancelados","1"]].map(([l, v]) => (
            <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 8, color: "#64748b" }}>{l}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#e2e8f0" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Agenda do dia</div>
            <div style={{ fontSize: 8, color: "#475569" }}>Segunda-feira, 09 de Junho de 2025</div>
          </div>
          <button style={{ fontSize: 9, padding: "4px 10px", borderRadius: 6, border: "none", background: "#0ea5e9", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Agendar</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
            {[
              { l: "Pacientes/mês",    v: "248",    ic: "👥" },
              { l: "Taxa ocupação",    v: "87%",    ic: "📊" },
              { l: "Ticket médio",     v: "R$ 320", ic: "💳" },
            ].map(({ l, v, ic }) => (
              <div key={l} style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, padding: "9px 10px", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{ic}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#f1f5f9" }}>{v}</div>
                  <div style={{ fontSize: 7, color: "#475569" }}>{l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule */}
          <div style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 9, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "45px 1fr 70px 65px 65px", padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Hora","Paciente","Tipo","Médico","Status"].map(h => (
                <div key={h} style={{ fontSize: 7, color: "#334155", fontWeight: 700, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {agenda.map(({ hora, paciente, tipo, dr, status }, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "45px 1fr 70px 65px 65px", padding: "7px 10px", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#0ea5e9" }}>{hora}</div>
                <div style={{ fontSize: 9, color: "#e2e8f0" }}>{paciente}</div>
                <div style={{ fontSize: 8, color: "#64748b" }}>{tipo}</div>
                <div style={{ fontSize: 8, color: "#64748b" }}>{dr}</div>
                <div style={{ fontSize: 7, padding: "1px 5px", borderRadius: 4, background: `${statusColor[status]}22`, color: statusColor[status], fontWeight: 700, display: "inline-flex", alignItems: "center", height: 16 }}>{status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
