import { Skeleton } from "@/app/components/ui/Skeleton";

/**
 * Skeleton específico do financeiro — espelha o layout real (header, 3 KPIs,
 * card de saldo de tokens e extrato) para reduzir layout shift na tela.
 */
export default function Loading() {
  return (
    <div style={{ padding: "24px 24px", maxWidth: 1020, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        <Skeleton width={150} height={28} />
        <Skeleton width={260} height={14} />
      </div>

      {/* 3 KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <Skeleton width={38} height={38} rounded />
            <Skeleton width="50%" height={24} />
            <Skeleton width="70%" height={12} />
          </div>
        ))}
      </div>

      {/* Card de saldo detalhado */}
      <div className="hub-card" style={{ marginBottom: 24, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton width={140} height={16} />
          <Skeleton width={90} height={30} rounded />
        </div>
        <Skeleton width="100%" height={10} rounded />
        <Skeleton width="45%" height={13} />
      </div>

      {/* Extrato */}
      <div className="hub-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)" }}>
          <Skeleton width={160} height={15} />
        </div>
        {[0, 1, 2, 3, 4].map((k) => (
          <div key={k} style={{ padding: "14px 22px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 110px 80px 80px", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="35%" height={11} />
            </div>
            <Skeleton width={90} height={12} />
            <Skeleton width={50} height={20} rounded />
            <Skeleton width={40} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
