import { Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="hub-page" style={{ maxWidth: 1020, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width={120} height={28} />
          <Skeleton width={220} height={14} />
        </div>
        <Skeleton width={130} height={38} rounded />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {[1, 2, 3].map((k) => (
          <div key={k} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton width={36} height={36} rounded />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="60%" height={20} />
              <Skeleton width="40%" height={12} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="40%" height={11} />
            </div>
            <Skeleton width={70} height={22} rounded />
            <Skeleton width={60} height={22} rounded />
            <Skeleton width={60} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}
