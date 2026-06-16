"use client";

type Segment = "loja" | "barbearia" | "oficina";

type Props = {
  onSelect: (segment: Segment) => void;
};

const SEGMENTS = [
  {
    id: "loja" as Segment,
    icon: "ti-shopping-cart",
    label: "Mercadinho / Loja",
    description: "Venda produtos, controle estoque e gerencie pedidos",
    accent: "#185FA5",
    bg: "linear-gradient(135deg, rgba(24,95,165,0.18) 0%, rgba(91,87,232,0.12) 100%)",
    border: "rgba(24,95,165,0.4)",
    tag: "Mais popular",
  },
  {
    id: "barbearia" as Segment,
    icon: "ti-scissors",
    label: "Barbearia",
    description: "Agendamentos online, fila de espera e histórico de clientes",
    accent: "#c9a84c",
    bg: "linear-gradient(135deg, rgba(26,26,46,0.9) 0%, rgba(201,168,76,0.1) 100%)",
    border: "rgba(201,168,76,0.4)",
    tag: "Novo",
  },
  {
    id: "oficina" as Segment,
    icon: "ti-tool",
    label: "Oficina Mecânica",
    description: "Ordens de serviço, histórico de veículos e controle de peças",
    accent: "#EF9F27",
    bg: "linear-gradient(135deg, rgba(28,43,26,0.9) 0%, rgba(239,159,39,0.1) 100%)",
    border: "rgba(239,159,39,0.4)",
    tag: "Novo",
  },
];

export default function SegmentSelector({ onSelect }: Props) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .seg-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; cursor: pointer; }
        .seg-card:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp 0.5s ease both" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#5B57E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "#fff" }}>F</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Fropty</span>
        </div>
        <h1 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: "var(--text)", margin: "0 0 12px" }}>
          Qual é o seu tipo de negócio?
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", margin: 0, maxWidth: 480 }}>
          Escolha um segmento para ver como um app sob medida funciona na prática para o seu negócio.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
        width: "100%",
        maxWidth: 960,
        animation: "fadeUp 0.6s 0.1s ease both",
        opacity: 0,
        animationFillMode: "forwards",
      }}>
        {SEGMENTS.map((seg, i) => (
          <button
            key={seg.id}
            className="seg-card"
            onClick={() => onSelect(seg.id)}
            style={{
              background: seg.bg,
              border: `1.5px solid ${seg.border}`,
              borderRadius: 20,
              padding: 32,
              textAlign: "left",
              color: "var(--text)",
              outline: "none",
              position: "relative",
              animation: `fadeUp 0.5s ${0.1 + i * 0.1}s ease both`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            {/* Tag badge */}
            {seg.tag && (
              <span style={{
                position: "absolute", top: 16, right: 16,
                background: seg.accent, color: seg.id === "loja" ? "#fff" : "#111",
                borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700,
              }}>{seg.tag}</span>
            )}

            {/* Icon */}
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: `${seg.accent}22`,
              border: `1.5px solid ${seg.accent}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <i className={`ti ${seg.icon}`} style={{ fontSize: 28, color: seg.accent }} />
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>{seg.label}</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 24 }}>{seg.description}</div>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              color: seg.accent, fontSize: 13, fontWeight: 600,
            }}>
              Ver demonstração <i className="ti ti-arrow-right" style={{ fontSize: 14 }} />
            </div>
          </button>
        ))}
      </div>

      <p style={{ marginTop: 32, fontSize: 13, color: "var(--text-faint)", animation: "fadeUp 0.5s 0.4s ease both", opacity: 0, animationFillMode: "forwards" }}>
        Você pode trocar de segmento a qualquer momento durante a demo
      </p>
    </div>
  );
}
