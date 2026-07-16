import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createServiceClient } from "@/app/lib/supabase/service";
import { createContract } from "@/app/actions/contracts";
import { ContractDateFields } from "@/app/components/admin/ContractDateFields";
import { CONTRACT_STATUS_MAP, CONTRACT_TYPE_MAP } from "@/app/lib/constants/projects";
import { getServerI18n } from "@/app/lib/i18n/server";

export const metadata: Metadata = { title: "Novo Contrato" };

export default async function NovoContratoPage() {
  const { t } = await getServerI18n();
  const supabase = createServiceClient();

  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("profiles").select("id, name").eq("role", "cliente").eq("is_active", true).order("name"),
    supabase.from("projects").select("id, title, client_id").order("title"),
  ]);

  async function handleCreate(formData: FormData) {
    "use server";
    const result = await createContract(formData);
    if (result.id) redirect(`/admin/contratos/${result.id}`);
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
    <div className="hub-page" style={{ maxWidth: 640, margin: "0 auto" }}>
      <Link
        href="/admin/contratos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "13px", color: "var(--text-muted)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> {t("admin.contracts.form.back")}
      </Link>

      <h1 style={{ margin: "0 0 24px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text)" }}>
        {t("admin.contracts.form.newTitle")}
      </h1>

      <form action={handleCreate}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px", display: "flex", flexDirection: "column", gap: 18 }}>

          <div>
            <label style={labelStyle}>{t("admin.contracts.form.client")}</label>
            <select name="client_id" required style={inputStyle}>
              <option value="">{t("admin.contracts.form.selectClient")}</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name ?? c.id}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t("admin.contracts.form.linkedProject")}</label>
            <select name="project_id" style={inputStyle}>
              <option value="">{t("admin.contracts.form.none")}</option>
              {(projects ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>{t("admin.contracts.form.title")}</label>
            <input name="title" required maxLength={200} style={inputStyle} placeholder={t("admin.contracts.form.phTitle")} />
          </div>

          <div>
            <label style={labelStyle}>{t("admin.contracts.form.description")}</label>
            <textarea name="description" rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder={t("admin.contracts.form.phDescription")} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t("admin.contracts.form.status")}</label>
              <select name="status" style={inputStyle} defaultValue="rascunho">
                {Object.keys(CONTRACT_STATUS_MAP).map((k) => (
                  <option key={k} value={k}>{t(`admin.contracts.status.${k}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{t("admin.contracts.form.type")}</label>
              <select name="type" style={inputStyle} defaultValue="projeto">
                {Object.keys(CONTRACT_TYPE_MAP).map((k) => (
                  <option key={k} value={k}>{t(`admin.contracts.type.${k}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <ContractDateFields labelStyle={labelStyle} inputStyle={inputStyle} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t("admin.contracts.form.value")}</label>
              <input name="value" type="number" min="0" step="0.01" style={inputStyle} placeholder="0,00" />
            </div>
            <div>
              <label style={labelStyle}>{t("admin.contracts.form.fileUrl")}</label>
              <input name="file_url" type="url" style={inputStyle} placeholder="https://..." />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <Link
              href="/admin/contratos"
              style={{
                padding: "9px 16px", background: "var(--surface-2)",
                border: "1px solid var(--border)", borderRadius: 9,
                fontSize: "13px", fontWeight: 600, color: "var(--text-muted)", textDecoration: "none",
              }}
            >
              {t("admin.contracts.form.cancel")}
            </Link>
            <button
              type="submit"
              style={{
                padding: "9px 20px", background: "var(--cta-bg)", color: "var(--cta-text)",
                fontWeight: 700, fontSize: "13px", borderRadius: 9,
                border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t("admin.contracts.form.create")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
