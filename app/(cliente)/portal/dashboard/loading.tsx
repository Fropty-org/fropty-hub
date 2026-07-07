import { Skeleton } from "@/app/components/ui/Skeleton";

/**
 * Skeleton específico do dashboard — espelha o layout real (saudação + CTA,
 * faixa de 4 KPIs e área de duas colunas) para minimizar layout shift na
 * tela de maior tráfego do portal.
 */
export default function Loading() {
  return (
    <div className="hub-page" style={{ maxWidth: 1060, margin: "0 auto" }}>
      {/* Header: saudação + CTA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Skeleton width={90} height={13} />
          <Skeleton width={200} height={30} />
          <Skeleton width={160} height={12} />
        </div>
        <Skeleton width={150} height={38} rounded />
      </div>

      {/* 4 KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton width={38} height={38} rounded />
            <Skeleton width="45%" height={24} />
            <Skeleton width="72%" height={12} />
          </div>
        ))}
      </div>

      {/* Duas colunas: lista recente + coluna lateral */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)", gap: 20 }}>
        {/* Coluna principal: chamados/projetos recentes */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
            <Skeleton width={140} height={16} />
            <Skeleton width={60} height={12} />
          </div>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton width={16} height={16} rounded />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton width="65%" height={14} />
                <Skeleton width="35%" height={11} />
              </div>
              <Skeleton width={70} height={22} rounded />
            </div>
          ))}
        </div>

        {/* Coluna lateral: health + ações rápidas */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Skeleton width="55%" height={15} />
            <Skeleton width={72} height={72} rounded style={{ alignSelf: "center" }} />
            <Skeleton width="80%" height={12} />
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Skeleton width="50%" height={15} />
            {[0, 1, 2].map((k) => (
              <Skeleton key={k} width="100%" height={40} rounded />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
