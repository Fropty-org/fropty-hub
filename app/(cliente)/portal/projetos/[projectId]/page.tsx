import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { STATUS_MAP } from "@/app/lib/constants/status";
import { EventTimeline } from "@/app/components/cliente/EventTimeline";
import type { ProjectStatus } from "@/app/lib/types/cliente";
import type { Database } from "@/app/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type EventRow   = Database["public"]["Tables"]["project_events"]["Row"];

export const metadata: Metadata = { title: "Projeto" };

interface Props { params: Promise<{ projectId: string }> }

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const supabase      = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [projectResult, eventsResult] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).eq("client_id", user!.id).single(),
    supabase.from("project_events").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
  ]);

  if (projectResult.error || !projectResult.data) notFound();

  const p      = projectResult.data as ProjectRow;
  const events = (eventsResult.data ?? []) as EventRow[];
  const info   = STATUS_MAP[p.status as ProjectStatus];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 800, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: "13px" }}>
        <Link href="/portal/projetos" style={{ color: "var(--text-faint)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 14 }} /> Projetos
        </Link>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span style={{ color: "var(--text-muted)" }}>{p.name}</span>
      </div>

      {/* Header */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 6px", color: "var(--text)" }}>{p.name}</h1>
            {p.description && <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--text-muted)" }}>{p.description}</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: `${info.color}18`, color: info.color, border: `1px solid ${info.color}30`, display: "inline-flex", alignItems: "center", gap: 5 }}>
                <i className={`ti ${info.icon}`} style={{ fontSize: 11 }} />{info.label}
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-faint)" }}>
                Iniciado em {new Date(p.started_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: "0 0 6px", fontSize: "2rem", fontWeight: 900, color: info.color, lineHeight: 1 }}>{p.progress}%</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>concluído</p>
            {p.preview_url && (
              <a
                href={p.preview_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 10,
                  padding: "6px 14px",
                  borderRadius: 8,
                  background: "rgba(91,87,232,0.12)",
                  color: "var(--primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textDecoration: "none",
                  border: "1px solid rgba(91,87,232,0.25)",
                }}
              >
                <i className="ti ti-external-link" style={{ fontSize: 13 }} /> Ver prévia
              </a>
            )}
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginTop: 20, height: 6, background: "var(--surface)", borderRadius: 99 }}>
          <div style={{ height: "100%", width: `${p.progress}%`, background: info.color, borderRadius: 99, transition: "width 0.4s" }} />
        </div>
      </div>

      {/* Timeline */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "24px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
          <i className="ti ti-history" style={{ color: "var(--text-faint)" }} /> Timeline de atividade
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-faint)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "2px 8px" }}>
            {events.length}
          </span>
        </h2>
        <EventTimeline events={events} />
      </div>
    </div>
  );
}
