import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/app/lib/supabase/service";
import { createProject } from "@/app/actions/projects";
import { PROJECT_STATUSES, PROJECT_PRIORITY_MAP } from "@/app/lib/constants/projects";

export const metadata: Metadata = { title: "Novo Projeto" };

export default async function NovoProjetoPage() {
  const supabase = createServiceClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "cliente")
    .eq("is_active", true)
    .order("name");

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createProject(formData);
    if (result.id) redirect(`/admin/projetos/${result.id}`);
  }

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 9,
    fontSize: "13px", color: "var(--text)", fontFamily: "inherit",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block", fontSize: "12px", fontWeight: 600,
    color: "var(--text-muted)", marginBottom: 6,
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 640, margin: "0 auto" }}>
      <Link
        href="/admin/projetos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Projetos
      </Link>

      <h1 style={{ margin: "0 0 24px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text)" }}>
        Novo Projeto
      </h1>

      <form action={handleCreate}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>

          <div>
            <label style={labelStyle}>Cliente *</label>
            <select name="client_id" required style={inputStyle}>
              <option value="">Selecionar cliente...</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name ?? c.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Título *</label>
            <input name="title" required maxLength={200} style={inputStyle} placeholder="Ex: App de gestão para clínica" />
          </div>

          <div>
            <label style={labelStyle}>Descrição</label>
            <textarea name="description" rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Descreva o escopo do projeto..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Status inicial</label>
              <select name="status" style={inputStyle} defaultValue="lead">
                {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridade</label>
              <select name="priority" style={inputStyle} defaultValue="media">
                {Object.entries(PROJECT_PRIORITY_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Data de início</label>
              <input name="start_date" type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Data de entrega</label>
              <input name="due_date" type="date" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Horas estimadas</label>
              <input name="estimated_hours" type="number" min="0" style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Custo estimado (R$)</label>
              <input name="estimated_cost" type="number" min="0" step="0.01" style={inputStyle} placeholder="0,00" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notas internas</label>
            <textarea name="notes" rows={2} style={{ ...inputStyle, resize: "vertical" }} placeholder="Notas visíveis apenas para a equipe..." />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <Link
              href="/admin/projetos"
              style={{
                padding: "9px 16px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: 9,
                fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none",
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              style={{
                padding: "9px 20px", background: "#EF9F27", color: "#fff",
                fontWeight: 700, fontSize: "13px", borderRadius: 9,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Criar Projeto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
