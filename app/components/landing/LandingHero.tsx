import type React from 'react'

const STAT_ITEMS = [
  { value: '< 4h', label: 'tempo de resposta' },
  { value: '99.9%', label: 'disponibilidade' },
  { value: '7', label: 'módulos integrados' },
]

function DashboardMockup() {
  const tickets = [
    { id: '#1042', title: 'Integração API Fropty Boost', status: 'Em andamento', color: 'var(--c-info)' },
    { id: '#1041', title: 'Dashboard financeiro — bug mobile', status: 'Aberto', color: 'var(--c-warning)' },
    { id: '#1039', title: 'Novo relatório mensal', status: 'Resolvido', color: 'var(--c-success)' },
  ]
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-xl)',
    }}>
      {/* URL bar */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#f87171','#fbbf24','#34d399'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: 'var(--surface-3)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          hub.fropty.com/dashboard
        </div>
      </div>
      <div style={{ display: 'flex', height: 320 }}>
        {/* Sidebar */}
        <div style={{ width: 52, background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 18 }}>
          {[
            { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', active: true },
            { d: 'M9 12h6M9 8h6M9 16h4', active: false },
            { d: 'M22 12h-4l-3 9L9 3l-3 9H2', active: false },
            { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', active: false },
          ].map((icon, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: 8,
              background: icon.active ? 'var(--sidebar-item-active)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={icon.active ? 'var(--brand-500)' : 'var(--text-faint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon.d} />
              </svg>
            </div>
          ))}
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 14, overflow: 'hidden' }}>
          {/* Metric cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Abertos', value: '3', color: 'var(--c-warning)' },
              { label: 'Em andamento', value: '1', color: 'var(--c-info)' },
              { label: 'Resolvidos', value: '18', color: 'var(--c-success)' },
            ].map(m => (
              <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
          {/* Ticket list */}
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Chamados recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {tickets.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 7,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: t.color, background: t.color + '18', borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>{t.status}</div>
              </div>
            ))}
          </div>
          {/* SLA bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>SLA médio</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-success)' }}>98%</span>
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
              <div style={{ height: '100%', width: '98%', background: 'var(--c-success)', borderRadius: 99 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingHero() {
  return (
    <section style={{ minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
      {/* Dot pattern */}
      <div className="dot-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px', width: '100%' }}>
        <div className="lp-hero-grid">
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'center' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 14px', width: 'fit-content' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)', boxShadow: '0 0 0 3px var(--sidebar-item-active)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                Portal do Cliente · Suporte · Projetos · Financeiro
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.04, letterSpacing: '-2px', margin: 0 }}>
              Suporte que vira<br />
              <span style={{ color: 'var(--brand-500)' }}>relacionamento.</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, margin: 0 }}>
              O Fropty Hub é o portal central de todos os clientes do ecossistema. Chamados, projetos, contratos, financeiro e roadmap — tudo em um lugar.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="#acesso" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--brand-500)', color: '#fff',
                borderRadius: 10, padding: '11px 22px',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                boxShadow: 'var(--shadow-brand)',
              }}>
                Solicitar acesso →
              </a>
              <a href="#modulos" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '11px 22px',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Ver módulos
              </a>
            </div>

            {/* Trust stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 8 }}>
              {STAT_ITEMS.map(s => (
                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{s.value}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — mockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: 520 }}>
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
