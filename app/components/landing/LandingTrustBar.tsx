const PRODUCTS = [
  { name: 'Fropty Boost', color: '#f59e0b', icon: '⚡' },
  { name: 'Fropty Cash', color: '#22c55e', icon: '💰' },
  { name: 'Fropty Invest', color: '#3B82F6', icon: '📈' },
  { name: 'Fropty Apps', color: '#8b5cf6', icon: '🛠️' },
  { name: 'Fropty Sentinel', color: '#DC2626', icon: '🛡️' },
  { name: 'Fropty Hub', color: 'var(--brand-500)', icon: '🏠' },
]

const ITEMS = [...PRODUCTS, ...PRODUCTS]

export function LandingTrustBar() {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '14px 0', background: 'var(--bg-alt)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-faint)', padding: '0 24px', marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
        Atende todo o ecossistema Fropty
      </div>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div className="lp-ticker" style={{ display: 'flex', gap: 10, width: 'max-content' }}>
          {ITEMS.map((p, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 100,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              fontSize: 12.5, fontWeight: 600, color: 'var(--text)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
