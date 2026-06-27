import type { Metadata } from "next";
import { getRoadmapItems } from "@/app/actions/roadmap";
import { RoadmapVoteButton } from "@/app/components/cliente/RoadmapVoteButton";
import type { RoadmapItem, RoadmapStatus } from "@/app/lib/types/roadmap";
import { Rocket, Lightbulb, CalendarCheck, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Roadmap" };

const STATUS_SECTIONS: {
  status: RoadmapStatus;
  label: string;
  color: string;
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  highlight?: boolean;
}[] = [
  { status: "em_desenvolvimento", label: "Em Desenvolvimento", color: "var(--primary)", Icon: Rocket,        highlight: true },
  { status: "planejado",          label: "Planejado",           color: "#EF9F27",       Icon: CalendarCheck },
  { status: "lancado",            label: "Lançado",             color: "#22c55e",       Icon: CheckCircle2 },
  { status: "ideia",              label: "Ideias",              color: "var(--text-faint)", Icon: Lightbulb  },
];

const CATEGORY_LABEL: Record<string, string> = {
  produto:     "Produto",
  suporte:     "Suporte",
  financeiro:  "Financeiro",
  integracao:  "Integração",
  seguranca:   "Segurança",
  ux:          "UX",
  performance: "Performance",
  outro:       "Outro",
};

export default async function RoadmapPage() {
  const items = await getRoadmapItems();

  const grouped = STATUS_SECTIONS.map((section) => ({
    ...section,
    items: items.filter((i) => i.status === section.status),
  }));

  return (
    <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: "0 0 4px" }}>Portal</p>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text)" }}>
          Roadmap
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)" }}>
          Acompanhe o que estamos construindo e vote nas features que mais importam para você.
        </p>
      </div>

      {grouped.map(({ status, label, color, Icon, highlight, items: sectionItems }) => (
        <section key={status} style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `color-mix(in srgb, ${color} 15%, transparent)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Icon size={16} style={{ color }} />
            </div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
              {label}
            </h2>
            <span style={{
              fontSize: "11px", fontWeight: 700, padding: "2px 8px",
              borderRadius: 999, background: "var(--surface)",
              border: "1px solid var(--border)", color: "var(--text-faint)",
            }}>
              {sectionItems.length}
            </span>
          </div>

          {sectionItems.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-faint)", paddingLeft: 42 }}>
              Nenhum item nesta etapa ainda.
            </p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: highlight ? "repeat(auto-fill, minmax(280px, 1fr))" : "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}>
              {sectionItems.map((item) => (
                <RoadmapCard key={item.id} item={item} accentColor={color} highlight={highlight} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function RoadmapCard({ item, accentColor, highlight }: { item: RoadmapItem; accentColor: string; highlight?: boolean }) {
  return (
    <div style={{
      background:   "var(--surface)",
      border:       `1px solid ${highlight ? accentColor + "40" : "var(--border)"}`,
      borderRadius: 14,
      padding:      "18px 20px",
      display:      "flex",
      flexDirection:"column",
      gap:          10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)", lineHeight: 1.35 }}>
          {item.title}
        </h3>
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "3px 7px",
          borderRadius: 6, background: "var(--surface-2)",
          border: "1px solid var(--border)", color: "var(--text-faint)",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {CATEGORY_LABEL[item.category] ?? item.category}
        </span>
      </div>

      {item.description && (
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
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
