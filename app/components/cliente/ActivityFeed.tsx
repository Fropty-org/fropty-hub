import Link from "next/link";
import {
  Activity, Ticket, CheckCircle2, MessageCircle, FolderKanban,
  MessagesSquare, FileText, Coins, Bell, ChevronRight, type LucideIcon,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  /** tipo de notificação (`notifications.type`) ou `token_credit`/`token_debit` */
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: string;
}

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const KIND_META: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  ticket_opened:     { Icon: Ticket,         tone: "warning" },
  ticket_updated:    { Icon: CheckCircle2,   tone: "success" },
  ticket_message:    { Icon: MessageCircle,  tone: "info" },
  project_update:    { Icon: FolderKanban,   tone: "info" },
  feedback_answered: { Icon: MessagesSquare, tone: "info" },
  contract_status:   { Icon: FileText,       tone: "warning" },
  token_credit:      { Icon: Coins,          tone: "success" },
  token_debit:       { Icon: Coins,          tone: "danger" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)     return "agora";
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

/**
 * Feed unificado de atividade do cliente no dashboard: histórico de
 * notificações (chamados, projetos, feedback, contratos) + movimentações
 * de tokens, em ordem cronológica.
 */
export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{
        fontSize: "11px", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-faint)", margin: "0 0 10px",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <Activity size={12} style={{ color: "var(--primary)" }} /> Atividade recente
      </p>

      <div className="hub-card" style={{ padding: "4px 20px" }}>
        <div className="hub-timeline">
          {items.map((item) => {
            const meta = KIND_META[item.kind] ?? { Icon: Bell, tone: "neutral" as Tone };
            const Icon = meta.Icon;

            const row = (
              <>
                <div className={`hub-timeline-bullet ${meta.tone}`}>
                  <Icon size={13} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </p>
                  {item.body && (
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.body}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "11px", color: "var(--text-faint)", flexShrink: 0, alignSelf: "center" }}>
                  {timeAgo(item.createdAt)}
                </span>
                {item.link && (
                  <ChevronRight size={13} style={{ color: "var(--text-faint)", flexShrink: 0, alignSelf: "center" }} />
                )}
              </>
            );

            return item.link ? (
              <Link key={item.id} href={item.link} className="hub-timeline-item" style={{ textDecoration: "none", color: "inherit" }}>
                {row}
              </Link>
            ) : (
              <div key={item.id} className="hub-timeline-item">
                {row}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
