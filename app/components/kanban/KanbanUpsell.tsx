import Link from "next/link";
import { KanbanSquare, Check, MessageSquarePlus } from "lucide-react";

/**
 * Tela de upsell quando o cliente não tem o módulo Kanban contratado.
 */
export function KanbanUpsell() {
  const perks = [
    "Quadro de tarefas próprio e privado",
    "Organize por A fazer, Em andamento e Concluído",
    "Arraste os cards, edite e conclua",
    "Visível só para você — ninguém mais acessa",
  ];
  return (
    <div className="hub-card hub-bg-diagonal" style={{ maxWidth: 560, margin: "24px auto", padding: "36px 32px", textAlign: "center", position: "relative" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary)" }}>
        <KanbanSquare size={28} />
      </div>
      <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>Kanban é um módulo Fropty</h2>
      <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
        Um quadro de tarefas só seu, para organizar as atividades do seu negócio. Contrate o módulo e comece com o quadro zerado.
      </p>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, textAlign: "left", marginBottom: 24 }}>
        {perks.map((p) => (
          <span key={p} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: "13px", color: "var(--text)" }}>
            <Check size={15} style={{ color: "var(--c-success)", flexShrink: 0 }} /> {p}
          </span>
        ))}
      </div>
      <div>
        <Link href="/portal/suporte/novo" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "10px 20px", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
          <MessageSquarePlus size={15} /> Quero contratar o Kanban
        </Link>
      </div>
    </div>
  );
}
