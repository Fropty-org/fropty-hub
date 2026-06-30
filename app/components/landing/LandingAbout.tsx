import type React from 'react'

const AUDIENCES = [
  {
    role: 'Clientes de produtos Fropty',
    desc: 'Usuários do Boost, Cash, Invest e demais SaaS — com acesso ao portal para chamados, melhorias e roadmap.',
    tags: ['Chamados', 'Roadmap', 'KB', 'Financeiro'],
  },
  {
    role: 'Clientes de projetos',
    desc: 'Empresas que contrataram desenvolvimento com a Fropty Apps — com visibilidade total do progresso, entregas e marcos.',
    tags: ['Projetos', 'Contratos', 'Timeline', 'Aprovações'],
  },
  {
    role: 'Clientes de segurança',
    desc: 'Organizações atendidas pelo Fropty Sentinel — com acesso a relatórios de auditoria, alertas e histórico de atendimentos.',
    tags: ['Alertas', 'Relatórios', 'SLA', 'Incidentes'],
  },
]

const DIFFERENTIALS = [
  { title: 'Não é um formulário de contato', desc: 'O Hub é uma plataforma operacional completa, não uma caixa de entrada disfarçada de portal.' },
  { title: 'Suporte que gera dados', desc: 'Cada chamado vira dado. Health score, NPS, CSAT — tudo medido automaticamente, sem planilha.' },
  { title: 'Transparência total', desc: 'O cliente vê o que está acontecendo em tempo real — sem precisar enviar e-mail para perguntar.' },
  { title: 'Upsell natural', desc: 'Projetos solicitados dentro do Hub são 3× mais fáceis de aprovar. O contexto já existe.' },
]

export function LandingAbout() {
  return (
    <section id="visao-geral" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>

        <div className="lp-grid-2" style={{ marginBottom: 56 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 14 }}>
              Quem usa o Hub
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, margin: 0 }}>
              Um portal.<br />Todos os clientes do ecossistema.
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.75, margin: 0 }}>
              O Fropty Hub atende todos os produtos e serviços da Fropty. Independente de ser cliente de SaaS, projeto ou segurança — o portal é o único ponto de contato com nossa equipe.
            </p>
          </div>
        </div>

        <div className="lp-grid-3" style={{ marginBottom: 72 }}>
          {AUDIENCES.map((a, i) => (
            <div key={i} className="sr" style={{
              '--sr-delay': `${i * 80}ms`,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '24px 22px',
              boxShadow: 'var(--shadow-card)',
            } as React.CSSProperties}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{a.role}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16, margin: '0 0 16px' }}>{a.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {a.tags.map(tag => (
                  <span key={tag} style={{
                    padding: '2px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                    background: 'var(--sidebar-item-active)',
                    color: 'var(--brand-500)',
                    border: '1px solid var(--border)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 28 }}>
          Por que é diferente
        </p>
        <div className="lp-grid-4">
          {DIFFERENTIALS.map((d, i) => (
            <div key={i} className="sr" style={{
              '--sr-delay': `${i * 60}ms`,
              padding: '24px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            } as React.CSSProperties}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)', marginBottom: 14 }} />
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 7, lineHeight: 1.3 }}>{d.title}</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
