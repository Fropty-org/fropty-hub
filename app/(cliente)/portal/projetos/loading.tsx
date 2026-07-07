import { Skeleton } from "@/app/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="hub-page" style={{ maxWidth: 1020, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width={110} height={28} />
          <Skeleton width={250} height={14} />
        </div>
        <Skeleton width={140} height={38} rounded />
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <Skeleton width={80} height={14} />
        </div>
        {[1, 2, 3, 4].map((k) => (
          <div key={k} style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 10 }}>
              <Skeleton width={32} height={32} />
              <Skeleton width="60%" height={14} />
            </div>
            <Skeleton width={80} height={22} rounded />
            <Skeleton width={60} height={22} rounded />
            <Skeleton width={80} height={12} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <Skeleton width="100%" height={5} rounded />
              <Skeleton width="30%" height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
