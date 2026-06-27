import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { getProfile } from "@/app/lib/auth/session";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { ResolutionReview } from "@/app/components/suporte/ResolutionReview";
import type { Database } from "@/app/lib/supabase/types";

type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];

export const metadata: Metadata = { title: "Avaliar solução — Fropty" };

interface Props {
  params: Promise<{ ticketId: string }>;
}

export default async function AvaliarPage({ params }: Props) {
  const { ticketId } = await params;
  const supabase = await createClient();
  const profile  = await getProfile();
  const { data: { user } } = await supabase.auth.getUser();

  // Admin não avalia; volta para o chamado
  if (profile?.role === "admin") redirect(`/portal/suporte/${ticketId}`);

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", ticketId)
    .eq("client_id", user!.id)
    .single();

  const ticket = data as TicketRow | null;
  if (!ticket) redirect("/portal/suporte");
  // Só faz sentido avaliar quando está aguardando validação
  if (ticket.status !== "resolvido") redirect(`/portal/suporte/${ticketId}`);

  const ref = ticket.ticket_number ? `UFT${String(ticket.ticket_number).padStart(4, "0")}` : null;

  return (
    <div style={{ padding: "36px 32px", maxWidth: 640, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: "12px" }}>
        <Link
          href={`/portal/suporte/${ticketId}`}
          style={{ color: "var(--text-faint)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 8px", borderRadius: 8, border: "1px solid var(--card-border)", background: "var(--card-bg)", fontWeight: 600 }}
        >
          <ArrowLeft size={13} /> Voltar ao chamado
        </Link>
      </div>

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 20, padding: "32px 28px" }}>
        {/* Ícone */}
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <ClipboardCheck size={26} style={{ color: "#22c55e" }} />
        </div>

        {ref && <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", letterSpacing: "0.05em" }}>{ref}</p>}
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 10px", color: "var(--text)" }}>
          A solução resolveu o seu problema?
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.7, margin: "0 0 8px" }}>
          Nosso time marcou o chamado <strong style={{ color: "var(--text)" }}>“{ticket.subject}”</strong> como resolvido.
          Antes de encerrar, precisamos da sua confirmação.
        </p>
        <ul style={{ margin: "0 0 24px", padding: "0 0 0 18px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.7 }}>
          <li><strong style={{ color: "#22c55e" }}>Confirmar:</strong> o chamado é fechado e você recebe a confirmação por e-mail.</li>
          <li><strong style={{ color: "#ef4444" }}>Não resolveu:</strong> o chamado é reaberto e volta para a fila do time retomar.</li>
        </ul>

        <ResolutionReview ticketId={ticketId} />
      </div>
    </div>
  );
}
