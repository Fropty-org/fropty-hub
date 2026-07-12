import Link from "next/link";
import { Headphones, Check, MessageSquarePlus } from "lucide-react";

/** Upsell quando o cliente não tem o módulo Service Desk contratado. */
export function ServiceDeskUpsell() {
  const perks = [
    "Abertura de chamados com nº de protocolo (UFT)",
    "Conversa em tempo real com a equipe Fropty",
    "SLA por prioridade e acompanhamento do status",
    "Avaliação do atendimento ao encerrar",
  ];
  return (
    <div className="hub-card hub-bg-diagonal" style={{ maxWidth: 560, margin: "24px auto", padding: "36px 32px", textAlign: "center", position: "relative" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, #8b5cf6 14%, transparent)", color: "#8b5cf6" }}>
        <Headphones size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>Service Desk é um módulo Fropty</h2>
      <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
        Canal oficial de suporte com chamados, SLA e histórico. Contrate o módulo para abrir e acompanhar seus atendimentos pelo Hub.
      </p>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 24 }}>
        {perks.map((p) => (
          <span key={p} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "13px", color: "var(--text)" }}>
            <Check size={15} style={{ color: "var(--c-success)", flexShrink: 0 }} /> {p}
          </span>
        ))}
      </div>
      <div>
        <Link href="/portal/financeiro" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "10px 20px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
          <MessageSquarePlus size={15} /> Quero contratar o Service Desk
        </Link>
      </div>
    </div>
  );
}
