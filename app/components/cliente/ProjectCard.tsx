import type { ClientProject, ProjectStatus } from "../../lib/types/cliente";

interface StatusInfo {
  label: string;
  color: string;
  icon: string;
}

interface Props {
  project: ClientProject;
  statusMap: Record<ProjectStatus, StatusInfo>;
}

export function ProjectCard({ project, statusMap }: Props) {
  const status = statusMap[project.status];

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 4px" }}>{project.name}</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>{project.description}</p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: 999,
            background: `${status.color}18`,
            color: status.color,
            border: `1px solid ${status.color}30`,
            flexShrink: 0,
          }}
        >
          <i className={`ti ${status.icon}`} style={{ fontSize: 12 }} />
          {status.label}
        </span>
      </div>

      {/* Progress bar */}
      {project.status !== "entregue" && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>Progresso</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>{project.progress}%</span>
          </div>
          <div style={{ height: 6, background: "var(--surface)", borderRadius: 99, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${project.progress}%`,
                background: "var(--primary)",
                borderRadius: 99,
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* Addons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {project.addons.map((addon) => (
          <span
            key={addon}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 999,
              background: "var(--surface)",
              color: "var(--text-faint)",
              border: "1px solid var(--border)",
            }}
          >
            {addon}
          </span>
        ))}
      </div>

      {/* Dates */}
      <div style={{ marginTop: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
          <i className="ti ti-calendar-event" style={{ marginRight: 4 }} />
          Iniciado em {new Date(project.startedAt).toLocaleDateString("pt-BR")}
        </span>
        {project.deliveredAt && (
          <span style={{ fontSize: "12px", color: "#22c55e" }}>
            <i className="ti ti-circle-check" style={{ marginRight: 4 }} />
            Entregue em {new Date(project.deliveredAt).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
}
