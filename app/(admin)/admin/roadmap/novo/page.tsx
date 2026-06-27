"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoadmapItem } from "@/app/actions/roadmap";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NovoRoadmapItemPage() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title:          (fd.get("title") as string).trim(),
      description:    (fd.get("description") as string).trim(),
      status:         fd.get("status") as string,
      category:       fd.get("category") as string,
      visibility:     fd.get("visibility") as string,
      target_version: (fd.get("target_version") as string).trim() || undefined,
    };
    if (!data.title) { setError("Título obrigatório."); return; }
    setError(null);
    start(async () => {
      const result = await createRoadmapItem(data);
      if (result.error) { setError(result.error); return; }
      router.push("/admin/roadmap");
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px",
    fontSize: "14px", color: "var(--text)",
    fontFamily: "inherit", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 700,
    color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em",
  };

  return (
    <div style={{ padding: "40px 32px", maxWidth: 600, margin: "0 auto" }}>
      <Link href="/admin/roadmap" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: "13px", color: "var(--text-faint)", textDecoration: "none", marginBottom: 24,
      }}>
        <ArrowLeft size={14} /> Voltar ao Roadmap
      </Link>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 28px", color: "var(--text)" }}>
        Novo Item do Roadmap
      </h1>

      <form onSubmit={handleSubmit} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "28px 24px",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input name="title" required maxLength={200} placeholder="Ex.: Notificações por WhatsApp" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea name="description" maxLength={1000} rows={3} placeholder="Descreva a feature em detalhes..." style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select name="status" defaultValue="planejado" style={inputStyle}>
              <option value="ideia">Ideia</option>
              <option value="planejado">Planejado</option>
              <option value="em_desenvolvimento">Em Desenvolvimento</option>
              <option value="lancado">Lançado</option>
              <option value="descartado">Descartado</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <select name="category" defaultValue="produto" style={inputStyle}>
              <option value="produto">Produto</option>
              <option value="suporte">Suporte</option>
              <option value="financeiro">Financeiro</option>
              <option value="integracao">Integração</option>
              <option value="seguranca">Segurança</option>
              <option value="ux">UX</option>
              <option value="performance">Performance</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Visibilidade</label>
            <select name="visibility" defaultValue="publico" style={inputStyle}>
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Versão alvo</label>
            <input name="target_version" maxLength={50} placeholder="Ex.: v2.1" style={inputStyle} />
          </div>
        </div>

        {error && (
          <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", fontWeight: 600 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: 10, padding: "11px 20px",
            fontSize: "14px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.7 : 1, fontFamily: "inherit",
          }}
        >
          {pending ? "Salvando..." : "Criar Item"}
        </button>
      </form>
    </div>
  );
}
