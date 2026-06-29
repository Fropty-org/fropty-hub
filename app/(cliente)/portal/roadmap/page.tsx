import type { Metadata } from "next";
import { getRoadmapItems } from "@/app/actions/roadmap";
import { RoadmapVoteButton } from "@/app/components/cliente/RoadmapVoteButton";
import type { RoadmapItem, RoadmapStatus } from "@/app/lib/types/roadmap";
import { Rocket, Lightbulb, CalendarCheck, CheckCircle2 } from "lucide-react";
import { HubEmptyState } from "@/app/components/ui/HubEmptyState";

export const metadata: Metadata = { title: "Roadmap" };

const STATUS_SECTIONS: {
  status:    RoadmapStatus;
  label:     string;
  color:     string;
  hex:       string;
  Icon:      React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  highlight?: boolean;
}[] = [
  { status: "em_desenvolvimento", label: "Em Desenvolvimento", color: "var(--primary)",      hex: "#5B57E8", Icon: Rocket,        highlight: true },
  { status: "planejado",          label: "Planejado",          color: "var(--brand-accent)",  hex: "#EF9F27", Icon: CalendarCheck },
  { status: "lancado",            label: "Lançado",            color: "var(--c-success)",     hex: "#16a34a", Icon: CheckCircle2 },
  { status: "ideia",              label: "Ideias",             color: "var(--text-faint)",    hex: "#aaaaaa", Icon: Lightbulb },
];

const CATEGORY_LABEL: Record<string, string> = {
  produto: "Produto", suporte: "Suporte", financeiro: "Financeiro",
  integracao: "Integração", seguranca: "Segurança", ux: "UX", performance: "Performance", outro: "Outro",
};

export default async function RoadmapPage() {
  const items = await getRoadmapItems();

  const grouped = STATUS_SECTIONS.map((s) => ({
    ...s,
    items: items.filter((i) => i.status === s.status),
  }));

  const hasAny = items.length > 0;

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>
          Roadmap
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)" }}>
          Acompanhe o que estamos construindo e vote nas features que mais importam para você.
        </p>
      </div>

      {!hasAny ? (
        <div className="hub-card">
          <HubEmptyState variant="roadmap" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {grouped.map(({ status, label, color, hex, Icon, highlight, items: sectionItems }) => (
            <section key={status}>
              {/* Section header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "var(--r-sm)",
                  background: `${hex}18`, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>
                  {label}
                </h2>
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                  borderRadius: "var(--r-full)", background: "var(--surface-2)",
                  border: "1px solid var(--border)", color: "var(--text-faint)",
                }}>
                  {sectionItems.length}
                </span>
              </div>

              {sectionItems.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-faint)", paddingLeft: 40, margin: 0 }}>
                  Nenhum item nesta etapa ainda.
                </p>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: highlight
                    ? "repeat(auto-fill, minmax(290px, 1fr))"
                    : "repeat(auto-fill, minmax(270px, 1fr))",
                  gap: 12,
                }}>
                  {sectionItems.map((item) => (
                    <RoadmapCard key={item.id} item={item} accentColor={color} accentHex={hex} highlight={highlight} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function RoadmapCard({
  item, accentColor, accentHex, highlight,
}: {
  item: RoadmapItem;
  accentColor: string;
  accentHex: string;
  highlight?: boolean;
}) {
  return (
    <div className="hub-card" style={{
      padding: "18px 20px",
      border: highlight ? `1px solid ${accentHex}38` : "1px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>
          {item.title}
        </h3>
        <span style={{
          fontSize: "10.5px", fontWeight: 700, padding: "2px 8px",
          borderRadius: "var(--r-sm)", background: "var(--surface-2)",
          border: "1px solid var(--border)", color: "var(--text-faint)",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
      </div>

      {item.description && (
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          {item.description}
        </p>
      )}

      <div style={{ marginTop: "auto", paddingTop: 4 }}>
        <RoadmapVoteButton
          itemId={item.id}
          initialVotes={item.votes}
          initialVoted={item.user_voted ?? false}
        />
      </div>
    </div>
  );
}
