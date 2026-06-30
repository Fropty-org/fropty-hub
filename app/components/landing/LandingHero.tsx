'use client'

import { RainbowButton } from '../RainbowButton'

/* ─── Mini mockup cards ─────────────────────────────────────── */

function CardDashboard() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%', minHeight: 200 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Dashboard</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[{ l: 'Abertos', v: '3', c: 'var(--c-warning)' }, { l: 'Resolvidos', v: '18', c: 'var(--c-success)' }, { l: 'Projetos', v: '2', c: 'var(--c-info)' }, { l: 'NPS', v: '72', c: 'var(--brand-500)' }].map(m => (
          <div key={m.l} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{m.l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, marginBottom: 6 }}>
        <div style={{ height: '100%', width: '72%', background: 'var(--brand-500)', borderRadius: 99 }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>SLA geral: 98% este mês</div>
    </div>
  )
}

function CardTicket() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--brand-500)', background: 'var(--sidebar-item-active)', borderRadius: 5, padding: '2px 7px' }}>UFT-1042</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-info)', background: 'rgba(59,130,246,.12)', borderRadius: 4, padding: '2px 6px' }}>Em andamento</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>Integração API Fropty Boost com erro 401</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[{ who: 'Cliente', msg: 'Olá, estou recebendo erro 401 ao tentar autenticar...', mine: false }, { who: 'Fropty', msg: 'Identificamos o problema. Estamos verificando as credenciais...', mine: true }].map((m, i) => (
          <div key={i} style={{ background: m.mine ? 'var(--sidebar-item-active)' : 'var(--surface-2)', borderRadius: 7, padding: '6px 9px', borderLeft: `2px solid ${m.mine ? 'var(--brand-500)' : 'var(--border-2)'}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: m.mine ? 'var(--brand-500)' : 'var(--text-muted)', marginBottom: 2 }}>{m.who}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.msg}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardProjects() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Projetos</div>
      {[{ name: 'App Mobile Fropty Cash', pct: 72, c: 'var(--c-info)' }, { name: 'Dashboard Sentinel', pct: 100, c: 'var(--c-success)' }, { name: 'Integração Boost API', pct: 35, c: 'var(--c-warning)' }].map(p => (
        <div key={p.name} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text)', fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: p.c }}>{p.pct}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${p.pct}%`, background: p.c, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CardFinancial() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Financeiro</div>
      {[{ mes: 'Jul 2025', v: 'R$ 1.490', s: 'Pendente', c: 'var(--c-warning)' }, { mes: 'Jun 2025', v: 'R$ 1.490', s: 'Pago', c: 'var(--c-success)' }, { mes: 'Mai 2025', v: 'R$ 1.490', s: 'Pago', c: 'var(--c-success)' }].map(f => (
        <div key={f.mes} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, padding: '6px 8px', background: 'var(--surface-2)', borderRadius: 7 }}>
          <span style={{ flex: 1, fontSize: 10.5, color: 'var(--text)' }}>{f.mes}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{f.v}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: f.c, background: f.c + '18', borderRadius: 3, padding: '1px 5px' }}>{f.s}</span>
        </div>
      ))}
    </div>
  )
}

function CardKnowledge() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Base de Conhecimento</div>
      {[{ t: 'Como configurar o Fropty Boost', cat: 'Integrações' }, { t: 'Glossário de SLA e prioridades', cat: 'Suporte' }, { t: 'Exportando relatórios do portal', cat: 'Financeiro' }].map(a => (
        <div key={a.t} style={{ marginBottom: 8, padding: '7px 8px', background: 'var(--surface-2)', borderRadius: 7 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{a.t}</div>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand-500)', background: 'var(--sidebar-item-active)', borderRadius: 3, padding: '1px 5px' }}>{a.cat}</span>
        </div>
      ))}
    </div>
  )
}

function CardRoadmap() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Roadmap</div>
      {[{ t: 'App mobile do portal', v: 89, s: 'Planejado', c: 'var(--c-warning)' }, { t: 'Exportação CSV nos relatórios', v: 47, s: 'Em dev', c: 'var(--c-info)' }, { t: 'Integração com Slack', v: 31, s: 'Em análise', c: 'var(--text-faint)' }].map(r => (
        <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, padding: '6px 8px', background: 'var(--surface-2)', borderRadius: 7 }}>
          <div style={{ textAlign: 'center', minWidth: 28 }}>
            <div style={{ fontSize: 12, color: 'var(--brand-500)' }}>▲</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)' }}>{r.v}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.t}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: r.c }}>{r.s}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CardCS() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer Success</div>
      {[{ l: 'Health Score', v: '87', c: 'var(--c-success)', pct: 87 }, { l: 'NPS', v: '72', c: 'var(--c-info)', pct: 72 }, { l: 'Onboarding', v: '100%', c: 'var(--brand-500)', pct: 100 }].map(m => (
        <div key={m.l} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text)' }}>{m.l}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: m.c }}>{m.v}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${m.pct}%`, background: m.c, borderRadius: 99 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CardTicketList() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chamados</div>
      {[
        { id: 'UFT-1042', t: 'Integração API Boost', s: 'Em andamento', c: 'var(--c-info)' },
        { id: 'UFT-1041', t: 'Bug dashboard mobile', s: 'Aberto', c: 'var(--c-warning)' },
        { id: 'UFT-1039', t: 'Relatório mensal', s: 'Resolvido', c: 'var(--c-success)' },
        { id: 'UFT-1038', t: 'Acesso usuário extra', s: 'Fechado', c: 'var(--text-faint)' },
      ].map(t => (
        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, padding: '5px 7px', background: 'var(--surface-2)', borderRadius: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.c, flexShrink: 0 }} />
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-faint)', minWidth: 48 }}>{t.id}</span>
          <span style={{ flex: 1, fontSize: 10, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.t}</span>
          <span style={{ fontSize: 8.5, fontWeight: 700, color: t.c, background: t.c + '18', borderRadius: 3, padding: '1px 4px', flexShrink: 0 }}>{t.s}</span>
        </div>
      ))}
    </div>
  )
}

function CardSLA() {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
  const vals = [94, 97, 92, 99, 98, 100]
  const maxH = 56
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>SLA Mensal</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--c-success)' }}>98%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: maxH + 16 }}>
        {vals.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: '100%', height: Math.round((v / 100) * maxH), background: v === 100 ? 'var(--c-success)' : 'var(--brand-500)', borderRadius: '3px 3px 0 0', opacity: 0.85 }} />
            <span style={{ fontSize: 8, color: 'var(--text-faint)' }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Column data — each column has 8 cards (duplicated for loop) ─ */

const COL1 = [CardDashboard, CardTicket, CardProjects, CardSLA, CardDashboard, CardTicket, CardProjects, CardSLA]
const COL2 = [CardFinancial, CardKnowledge, CardCS, CardTicketList, CardFinancial, CardKnowledge, CardCS, CardTicketList]
const COL3 = [CardRoadmap, CardSLA, CardTicket, CardDashboard, CardRoadmap, CardSLA, CardTicket, CardDashboard]

/* ─── Scrolling column ─────────────────────────────────────────── */

function ScrollCol({ cards, direction }: { cards: React.ComponentType[]; direction: 'up' | 'down' }) {
  return (
    <div style={{ overflow: 'hidden', flex: 1 }}>
      <div
        className={direction === 'up' ? 'lp-hero-col-up' : 'lp-hero-col-down'}
        style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {cards.map((Card, i) => <Card key={i} />)}
      </div>
    </div>
  )
}

/* ─── Hero ─────────────────────────────────────────────────────── */

import type React from 'react'

const STAT_ITEMS = [
  { value: '< 4h', label: 'tempo de resposta' },
  { value: '99.9%', label: 'disponibilidade' },
  { value: '7', label: 'módulos integrados' },
]

export function LandingHero() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)', minHeight: 640 }}>
      {/* Left — copy */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px 80px', position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 560 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand-500)', boxShadow: '0 0 0 3px var(--sidebar-item-active)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              Portal do Cliente · Suporte · Projetos · Financeiro
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 20px' }}>
            Suporte que vira<br />
            <span style={{ color: 'var(--brand-500)' }}>relacionamento.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 460, margin: '0 0 32px' }}>
            O Fropty Hub é o portal central de todos os clientes do ecossistema. Chamados, projetos, contratos e financeiro — tudo em um lugar.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            <RainbowButton asChild size="lg">
              <a href="#acesso" style={{ textDecoration: 'none' }}>Solicitar acesso →</a>
            </RainbowButton>
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

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {STAT_ITEMS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3D scrolling columns — right side */}
      <div className="lp-hero-3d-wrapper" aria-hidden="true">
        <div className="lp-hero-3d-container">
          <ScrollCol cards={COL1} direction="up" />
          <ScrollCol cards={COL2} direction="down" />
          <ScrollCol cards={COL3} direction="up" />
        </div>
        {/* Fade edges */}
        <div className="lp-hero-fade-top" />
        <div className="lp-hero-fade-bottom" />
        <div className="lp-hero-fade-left" />
      </div>
    </section>
  )
}
