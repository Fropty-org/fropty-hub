import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { STATUS_MAP } from "@/app/lib/constants/status";
import { adminCreateProject, adminUpdateProject } from "@/app/actions/admin";
import type { ProjectStatus } from "@/app/lib/types/cliente";

export const metadata: Metadata = { title: "Projetos — Admin" };

const PAGE_SIZE = 20;

const STATUS_OPTIONS: ProjectStatus[] = ["aguardando", "em_desenvolvimento", "revisao", "entregue", "manutencao"];
const STATUS_LABEL: Record<ProjectStatus, string> = {
  aguardando:         "Aguardando",
  em_desenvolvimento: "Em Dev",
  revisao:            "Revisão",
  entregue:           "Entregue",
  manutencao:         "Manutenção",
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function AdminProjetosPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page    = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset  = (page - 1) * PAGE_SIZE;
  const supabase = await createClient();

  const [{ data: projects }, { count: total }, { data: clients }] = await Promise.all([
    supabase.from("projects").select("*, profiles:client_id(name)").order("created_at", { ascending: false }).range(offset, offset + PAGE_SIZE - 1),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id, name").eq("role", "cliente").order("name"),
  ]);

  const list       = projects ?? [];
  const totalPages = Math.ceil((total ?? 0) / PAGE_SIZE);

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Projetos</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            {total ?? 0} projeto{(total ?? 0) !== 1 ? "s" : ""} · página {page} de {Math.max(1, totalPages)}
          </p>
        </div>
      </div>

      {/* Formulário novo projeto */}
      <form action={adminCreateProject} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
        <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Criar novo projeto</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select name="client_id" required style={{ flex: 1, minWidth: 160, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }}>
            <option value="">Selecionar cliente…</option>
            {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="name" required placeholder="Nome do projeto" style={{ flex: 2, minWidth: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }} />
          <input name="description" placeholder="Descrição (opcional)" style={{ flex: 2, minWidth: 200, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", padding: "9px 12px", fontSize: "13px", fontFamily: "inherit" }} />
          <button type="submit" style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            <i className="ti ti-plus" /> Criar
          </button>
        </div>
      </form>

      {/* Tabela de projetos */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 280px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Projeto</span>
          <span>Cliente</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>%</span>
          <span style={{ textAlign: "center" }}>Atualizar</span>
        </div>

        {list.map((p, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const clientName = (p.profiles as any)?.name ?? "—";
          const statusInfo = STATUS_MAP[p.status as ProjectStatus];
          return (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 80px 280px", padding: "14px 20px", borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", gap: 8 }}>
              <div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{p.name}</p>
                {p.preview_url && (
                  <a href={p.preview_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "11px", color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                    <i className="ti ti-external-link" style={{ fontSize: 10 }} /> prévia
                  </a>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>{clientName}</p>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${statusInfo.color}18`, color: statusInfo.color, border: `1px solid ${statusInfo.color}30`, display: "inline-block" }}>
                {STATUS_LABEL[p.status as ProjectStatus]}
              </span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{p.progress}%</span>
              <form action={adminUpdateProject} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input type="hidden" name="project_id" value={p.id} />
                <select name="status" defaultValue={p.status} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 6px", fontSize: "11px", fontFamily: "inherit" }}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <input
                  name="preview_url"
                  defaultValue={p.preview_url ?? ""}
                  placeholder="URL prévia"
                  style={{ flex: 1, minWidth: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 6px", fontSize: "11px", fontFamily: "inherit" }}
                />
                <button type="submit" style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                  OK
                </button>
              </form>
            </div>
          );
        })}

        {list.length === 0 && <p style={{ padding: "32px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum projeto ainda.</p>}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && (
            <Link
              href={`/admin/projetos?page=${page - 1}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }} /> Anterior
            </Link>
          )}
          <span style={{ fontSize: "13px", color: "var(--text-faint)", padding: "0 8px" }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/projetos?page=${page + 1}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              Próxima <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
