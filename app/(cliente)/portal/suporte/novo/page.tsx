import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import { NewTicketForm } from "@/app/components/suporte/NewTicketForm";
import type { Database } from "@/app/lib/supabase/types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export const metadata: Metadata = { title: "Novo chamado — Fropty" };

export default async function NovoChamadoPage() {
  const supabase = await createClient();
  const profile  = await getProfile();
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = profile?.role === "admin";

  let projects: { id: string; name: string }[] = [];
  let clients:  { id: string; name: string }[] = [];

  if (isAdmin) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name")
      .eq("role", "cliente")
      .eq("is_active", true)
      .order("name");
    clients = (data ?? []).map((c) => ({ id: c.id, name: c.name ?? c.id }));
  } else {
    const { data } = await supabase
      .from("projects")
      .select("id, name")
      .eq("client_id", user!.id)
      .order("created_at", { ascending: false });
    projects = ((data ?? []) as Pick<ProjectRow, "id" | "name">[]).map((p) => ({ id: p.id, name: p.name }));
  }

  return (
    <div style={{ padding: "36px 32px", maxWidth: 720, margin: "0 auto" }}>
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
            border: "1px solid var(--card-border)",
            background: "var(--card-bg)",
            fontWeight: 600,
          }}
        >
          <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
          Suporte
        </Link>
        <i className="ti ti-chevron-right" style={{ color: "var(--text-faint)", fontSize: 12 }} />
        <span style={{ color: "var(--text-muted)" }}>Novo chamado</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <span className="section-chip" style={{ marginBottom: 12 }}>
          <i className="ti ti-headset" style={{ fontSize: 11 }} />
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
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: 20,
          padding: "28px 28px 32px",
        }}
      >
        <NewTicketForm projects={projects} isAdmin={isAdmin} clients={clients} />
      </div>
    </div>
  );
}
