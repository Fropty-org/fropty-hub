import Link from "next/link";
import {
  MessageCircle, MessageSquare, RefreshCw, FolderKanban, FileSignature,
  FileCheck, MessageSquarePlus, Coins, UserPlus, Bell, type LucideIcon,
} from "lucide-react";
import type { ActivityItem } from "@/app/actions/activity";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

/** Mapeia o tipo da notificação para tom + ícone da timeline. */
function present(type: string): { tone: Tone; Icon: LucideIcon } {
  const map: Record<string, { tone: Tone; Icon: LucideIcon }> = {
    ticket_opened:     { tone: "info",    Icon: MessageCircle },
    ticket_message:    { tone: "info",    Icon: MessageSquare },
    ticket_updated:    { tone: "warning", Icon: RefreshCw },
    ticket_resolved:   { tone: "success", Icon: FileCheck },
    project_update:    { tone: "info",    Icon: FolderKanban },
    feedback_response: { tone: "success", Icon: MessageSquarePlus },
    contract_sent:     { tone: "info",    Icon: FileSignature },
    contract_signed:   { tone: "success", Icon: FileCheck },
    client_joined:     { tone: "success", Icon: UserPlus },
  };
  if (map[type]) return map[type];
  // Fallback por palavra-chave para tipos novos.
  if (type.includes("contract")) return { tone: "info", Icon: FileSignature };
  if (type.includes("project"))  return { tone: "info", Icon: FolderKanban };
  if (type.includes("feedback")) return { tone: "success", Icon: MessageSquarePlus };
  if (type.includes("token"))    return { tone: "warning", Icon: Coins };
  if (type.includes("ticket"))   return { tone: "info", Icon: MessageCircle };
  return { tone: "neutral", Icon: Bell };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="hub-timeline">
      {items.map((it) => {
        const { tone, Icon } = present(it.type);
        const row = (
          <>
            <div className={`hub-timeline-bullet ${tone}`}>
              <Icon size={14} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it.title}
              </p>
              {it.body && (
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.body}
                </p>
              )}
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {relativeTime(it.createdAt)}
            </span>
          </>
        );

        return it.link ? (
          <Link key={it.id} href={it.link} className="hub-timeline-item hub-row-link" style={{ textDecoration: "none", color: "inherit" }}>
            {row}
          </Link>
        ) : (
          <div key={it.id} className="hub-timeline-item">{row}</div>
        );
      })}
    </div>
  );
}
