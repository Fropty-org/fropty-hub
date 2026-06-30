'use client'
import { useEffect, useRef, useState } from 'react'
import type React from 'react'

const MODULES = [
  {
    id: 'service-desk',
    name: 'Service Desk',
    tagline: 'Chamados com SLA e rastreabilidade',
    color: 'var(--brand-500)',
    features: ['Abertura de chamados online', 'SLA por prioridade', 'Histórico completo', 'Notificações em tempo real', 'Escalação automática'],
    desc: 'Abra, acompanhe e resolva chamados com SLA definido, prioridade clara e histórico completo de cada interação.',
  },
  {
    id: 'projetos',
    name: 'Projetos',
    tagline: 'Visibilidade total de ponta a ponta',
    color: 'var(--c-info)',
    features: ['Timeline e marcos', 'Aprovações online', 'Entregas documentadas', 'Status em tempo real', 'Solicitações de mudança'],
    desc: 'Acompanhe cada etapa do projeto com timeline, marcos, aprovações e documentação de entregas — sem precisar perguntar.',
  },
  {
    id: 'financeiro',
    name: 'Financeiro',
    tagline: 'Faturas, contratos e NF centralizados',
    color: 'var(--c-success)',
    features: ['Histórico de faturas', 'Download de NF', 'Contratos e propostas', 'Extratos mensais', 'Alertas de vencimento'],
    desc: 'Todas as faturas, contratos e notas fiscais em um só lugar. Sem e-mail, sem anexo perdido.',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base',
    tagline: 'Documentação acessível e buscável',
    color: 'var(--c-warning)',
    features: ['Artigos por categoria', 'Busca full-text', 'Tutoriais em vídeo', 'FAQ atualizado', 'Guias de integração'],
    desc: 'Base de conhecimento completa para que o cliente resolva dúvidas sozinho antes de abrir um chamado.',
  },
  {
    id: 'roadmap',
    name: 'Roadmap',
    tagline: 'Participe da evolução do produto',
    color: '#F97316',
    features: ['Roadmap público', 'Votação de features', 'Sugestões de melhoria', 'Status de entregas', 'Changelog'],
    desc: 'O cliente vê o que está sendo construído, vota em funcionalidades e acompanha o status de cada entrega.',
  },
  {
    id: 'cs',
    name: 'Customer Success',
    tagline: 'Saúde e retenção proativas',
    color: 'var(--c-danger)',
    features: ['Health score', 'NPS automatizado', 'Onboarding guiado', 'Check-ins periódicos', 'Alertas de churn'],
    desc: 'Acompanhamento proativo da saúde do cliente — health score, NPS e check-ins para antecipar problemas.',
  },
]

const DURATION = 4500

function ModuleMockup({ mod }: { mod: typeof MODULES[number] }) {
  if (mod.id === 'service-desk') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { t: 'Integração API — resposta aguardada', s: 'Aberto', c: 'var(--c-warning)' },
        { t: 'Bug no dashboard mobile', s: 'Em andamento', c: 'var(--c-info)' },
        { t: 'Exportar relatório mensal', s: 'Resolvido', c: 'var(--c-success)' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.c, flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text)', fontWeight: 500 }}>{item.t}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: item.c, background: item.c + '18', borderRadius: 4, padding: '2px 7px' }}>{item.s}</span>
        </div>
      ))}
    </div>
  )
  if (mod.id === 'projetos') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { label: 'Discovery & Arquitetura', pct: 100 },
        { label: 'Desenvolvimento frontend', pct: 72 },
        { label: 'Integrações backend', pct: 40 },
        { label: 'Testes & Deploy', pct: 0 },
      ].map((p, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{p.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: p.pct === 100 ? 'var(--c-success)' : 'var(--text-muted)' }}>{p.pct}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${p.pct}%`, background: p.pct === 100 ? 'var(--c-success)' : 'var(--c-info)', borderRadius: 99, transition: 'width 1s' }} />
          </div>
        </div>
      ))}
    </div>
  )
  if (mod.id === 'financeiro') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { mes: 'Jun 2025', valor: 'R$ 1.490', status: 'Pago', c: 'var(--c-success)' },
        { mes: 'Mai 2025', valor: 'R$ 1.490', status: 'Pago', c: 'var(--c-success)' },
        { mes: 'Jul 2025', valor: 'R$ 1.490', status: 'Pendente', c: 'var(--c-warning)' },
      ].map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--text)' }}>{f.mes}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.valor}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: f.c, background: f.c + '18', borderRadius: 4, padding: '2px 7px' }}>{f.status}</span>
        </div>
      ))}
    </div>
  )
  if (mod.id === 'knowledge') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { title: 'Como configurar a integração Fropty Boost', cat: 'Integrações', views: '142' },
        { title: 'Glossário de SLA e prioridades', cat: 'Suporte', views: '98' },
        { title: 'Exportando relatórios financeiros', cat: 'Financeiro', views: '67' },
      ].map((a, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.title}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 10.5, color: 'var(--brand-500)', background: 'var(--sidebar-item-active)', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{a.cat}</span>
            <span style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>{a.views} visualizações</span>
          </div>
        </div>
      ))}
    </div>
  )
  if (mod.id === 'roadmap') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { title: 'Exportação CSV nos relatórios', votes: 47, status: 'Em desenvolvimento', c: 'var(--c-info)' },
        { title: 'App mobile do portal', votes: 89, status: 'Planejado', c: 'var(--c-warning)' },
        { title: 'Integração com Slack', votes: 31, status: 'Em análise', c: 'var(--text-faint)' },
      ].map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ minWidth: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand-500)' }}>▲</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{r.votes}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>{r.title}</div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: r.c }}>{r.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { label: 'Health Score', value: '87', color: 'var(--c-success)', pct: 87 },
        { label: 'NPS', value: '72', color: 'var(--c-info)', pct: 72 },
        { label: 'Onboarding', value: '100%', color: 'var(--brand-500)', pct: 100 },
      ].map((m, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 12, color: 'var(--text)' }}>{m.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.value}</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LandingModules() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(Date.now())

  const startTimer = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    startRef.current = Date.now()
    setProgress(0)
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (elapsed >= DURATION) {
        const next = (idx + 1) % MODULES.length
        setActive(next)
        startTimer(next)
      }
    }, 16)
  }

  useEffect(() => {
    startTimer(0)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const mod = MODULES[active]

  return (
    <section id="modulos" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
            Módulos
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
            Cada módulo, uma parte da operação.
          </h2>
        </div>

        <div className="lp-modules-grid">
          {/* Tab list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MODULES.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { setActive(i); startTimer(i) }}
                style={{
                  all: 'unset', cursor: 'pointer',
                  padding: '14px 16px', borderRadius: 10,
                  background: active === i ? 'var(--surface)' : 'transparent',
                  border: active === i ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: active === i ? 'var(--shadow-card)' : 'none',
                  display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: active === i ? 'var(--text)' : 'var(--text-muted)' }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{m.tagline}</span>
                </div>
                {active === i && (
                  <div style={{ height: 2, background: 'var(--border)', borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: m.color, borderRadius: 99, transition: 'width 0.05s linear' }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: mod.color + '18', border: `1px solid ${mod.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: mod.color }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{mod.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{mod.tagline}</div>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 20 }}>{mod.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {mod.features.map(f => (
                <span key={f} style={{
                  padding: '4px 10px', borderRadius: 100,
                  fontSize: 11.5, fontWeight: 600,
                  background: mod.color + '12',
                  color: mod.color === 'var(--brand-500)' ? 'var(--brand-500)' : mod.color,
                  border: `1px solid ${mod.color}25`,
                }}>{f}</span>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <ModuleMockup mod={mod} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
