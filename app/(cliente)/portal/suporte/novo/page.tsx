import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import { NewTicketForm } from "@/app/components/suporte/NewTicketForm";
import { ArrowLeft, Coins, ChevronRight, Headphones } from "lucide-react";

export const metadata: Metadata = { title: "Novo chamado — Fropty" };

export default async function NovoChamadoPage() {
  const supabase = await createClient();
  const profile  = await getProfile();
  const isAdmin = profile?.role === "admin";

  // Clientes sem tokens não podem abrir chamados
  if (!isAdmin && (profile?.token_balance ?? 0) <= 0) {
    return (
      <div style={{ padding: "24px 24px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
          <Link href="/portal/suporte" style={{ color: "var(--text-faint)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontWeight: 600 }}>
            <ArrowLeft size={13} /> Suporte
          </Link>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Coins size={26} style={{ color: "#EF9F27" }} />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>
            Tokens insuficientes
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
            Você não possui tokens disponíveis para abrir um chamado de suporte. Adquira tokens para continuar.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/portal/financeiro" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", background: "var(--cta-bg)", color: "var(--cta-text)", fontWeight: 700, fontSize: "13px", borderRadius: 10, textDecoration: "none" }}>
              <Coins size={14} /> Ver planos e tokens
            </Link>
            <Link href="/portal/suporte" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 22px", background: "var(--surface)", color: "var(--text-muted)", fontWeight: 600, fontSize: "13px", borderRadius: 10, textDecoration: "none", border: "1px solid var(--border)" }}>
              Voltar ao suporte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let clients:  { id: string; name: string }[] = [];

  if (isAdmin) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "cliente")
      .eq("is_active", true)
      .order("name");
    clients = (data ?? []).map((c) => ({ id: c.id, name: c.name ?? c.id }));
  }

  return (
    <div style={{ padding: "24px 24px", maxWidth: 720, margin: "0 auto" }}>
      <style>{`
        @media (max-width: 640px) {
          .novo-chamado-root { padding: 16px 14px !important; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
        <Link
          href="/portal/suporte"
          style={{
            color: "var(--text-faint)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px 5px 8px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={13} />
          Suporte
        </Link>
        <ChevronRight size={12} style={{ color: "var(--text-faint)" }} />
        <span style={{ color: "var(--text-muted)" }}>Novo chamado</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <span className="section-chip" style={{ marginBottom: 12 }}>
          <Headphones size={11} />
          Service Desk
        </span>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)", letterSpacing: "-0.02em" }}>
          Abrir chamado
        </h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {isAdmin
            ? "Abra um chamado em nome de um cliente. Respondemos em até 24h."
            : "Descreva o problema com detalhes — respondemos em até 24h."}
        </p>
      </div>

      {/* Formulário em card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "28px 28px 32px",
        }}
      >
        <NewTicketForm isAdmin={isAdmin} clients={clients} />
      </div>
    </div>
  );
}
