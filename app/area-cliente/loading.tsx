export default function Loading() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sidebar skeleton */}
      <aside style={{ width: 220, minHeight: "100vh", background: "var(--surface)", borderRight: "1px solid var(--border)", padding: "24px 16px", flexShrink: 0 }}>
        <div style={{ height: 28, width: 120, borderRadius: 8, background: "var(--surface-2)", marginBottom: 32 }} />
        <div style={{ height: 60, borderRadius: 12, background: "var(--surface-2)", marginBottom: 28 }} />
        {[1, 2].map((i) => (
          <div key={i} style={{ height: 36, borderRadius: 9, background: "var(--surface-2)", marginBottom: 8, opacity: 1 - i * 0.15 }} />
        ))}
      </aside>

      {/* Content skeleton */}
      <main style={{ flex: 1, padding: "40px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ height: 16, width: 100, borderRadius: 6, background: "var(--surface)", marginBottom: 8 }} />
          <div style={{ height: 32, width: 200, borderRadius: 8, background: "var(--surface)", marginBottom: 36 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 36 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 80, borderRadius: 14, background: "var(--surface)" }} />
            ))}
          </div>
          <div style={{ height: 20, width: 120, borderRadius: 6, background: "var(--surface)", marginBottom: 16 }} />
          {[1, 2].map((i) => (
            <div key={i} style={{ height: 100, borderRadius: 16, background: "var(--surface)", marginBottom: 16 }} />
          ))}
        </div>
      </main>
    </div>
  );
}
