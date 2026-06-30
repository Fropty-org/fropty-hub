import Link from 'next/link'

const LINKS = {
  'Módulos': ['Service Desk', 'Projetos', 'Financeiro', 'Knowledge Base', 'Roadmap', 'Customer Success'],
  'Ecossistema': ['Fropty Boost', 'Fropty Cash', 'Fropty Invest', 'Fropty Apps', 'Fropty Sentinel'],
  'Suporte': ['Abrir chamado', 'Base de conhecimento', 'Status do sistema', 'SLA e prioridades'],
  'Contato': ['hub.fropty.com', 'suporte@fropty.com', 'WhatsApp', 'LinkedIn'],
}

export function LandingFooter() {
  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px 32px' }}>
        <div className="lp-footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                Fropty <span style={{ color: 'var(--brand-500)' }}>Hub</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 220 }}>
              O centro operacional de relacionamento, suporte e crescimento do ecossistema Fropty.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title}>
              <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 16 }}>{title}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(item => (
                  <li key={item}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'default' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
            © 2025 Fropty. Todos os direitos reservados.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacidade', 'Termos', 'SLA'].map(l => (
              <span key={l} style={{ fontSize: 12, color: 'var(--text-faint)', cursor: 'default' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
