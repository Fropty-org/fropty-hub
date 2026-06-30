'use client'
import type React from 'react'
import { useState, useEffect, useRef } from 'react'

const DEMO_SUPORTE = [
  { delay: 0,    who: 'sistema',  msg: 'UFT-1042 aberto — Integração API Boost com erro 401', badge: 'Aberto', color: 'var(--c-warning)' },
  { delay: 1200, who: 'sistema',  msg: 'SLA iniciado · Prazo: 4h · Prioridade: Alta', badge: null, color: 'var(--text-faint)' },
  { delay: 2600, who: 'Fropty',   msg: 'Recebemos o chamado. Estamos verificando as credenciais da API.', badge: 'Em andamento', color: 'var(--c-info)' },
  { delay: 4200, who: 'Cliente',  msg: 'Obrigado! Fico aguardando.', badge: null, color: 'var(--text-faint)' },
  { delay: 5800, who: 'Fropty',   msg: 'Identificamos o problema. Token expirado. Renovamos — teste agora.', badge: 'Resolvido', color: 'var(--c-success)' },
  { delay: 7400, who: 'sistema',  msg: 'CSAT enviado — Cliente avaliou 5★. Health Score atualizado.', badge: 'Fechado', color: 'var(--c-success)' },
]

const DEMO_PROJETOS = [
  { delay: 0,    who: 'sistema',  msg: 'Projeto "App Mobile Fropty Cash" — Discovery & Arquitetura: 100%', badge: 'Concluído', color: 'var(--c-success)' },
  { delay: 1400, who: 'Fropty',   msg: 'Etapa de desenvolvimento iniciada. Próximo marco em 5 dias.', badge: 'Em dev', color: 'var(--c-info)' },
  { delay: 3000, who: 'sistema',  msg: 'Frontend: 72% · Integrações: 40% · Deploy: aguardando', badge: null, color: 'var(--text-faint)' },
  { delay: 4600, who: 'Cliente',  msg: 'Conseguem adiantar a integração de pagamento?', badge: null, color: 'var(--text-faint)' },
  { delay: 6000, who: 'Fropty',   msg: 'Confirmado. Adicionamos ao sprint atual. Timeline atualizada.', badge: 'Atualizado', color: 'var(--brand-500)' },
]

const DEMO_FINANCEIRO = [
  { delay: 0,    who: 'sistema',  msg: 'Fatura Jul/2025 gerada — R$ 1.490 · Vencimento: 15/07', badge: 'Pendente', color: 'var(--c-warning)' },
  { delay: 1400, who: 'sistema',  msg: 'Lembrete: vencimento em 3 dias. NF disponível para download.', badge: null, color: 'var(--text-faint)' },
  { delay: 3000, who: 'sistema',  msg: 'Pagamento confirmado. Contrato renovado até Jul/2026.', badge: 'Pago', color: 'var(--c-success)' },
  { delay: 4400, who: 'sistema',  msg: 'Extrato mensal disponível · Histórico: 12 faturas · SLA: 100%', badge: null, color: 'var(--text-faint)' },
]

const DEMO_MAP: Record<string, typeof DEMO_SUPORTE> = {
  suporte: DEMO_SUPORTE,
  projetos: DEMO_PROJETOS,
  financeiro: DEMO_FINANCEIRO,
}

function HowItWorksDemo({ tab }: { tab: string }) {
  const messages = DEMO_MAP[tab] ?? DEMO_SUPORTE
  const [visible, setVisible] = useState<number[]>([])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisible([])
    const t = messages.map((m, i) =>
      setTimeout(() => setVisible(v => [...v, i]), m.delay)
    )
    timers.current = t
    return () => t.forEach(clearTimeout)
  }, [tab])

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Window bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        {['#ef4444','#f59e0b','#22c55e'].map(c => (
          <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
        ))}
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-faint)', marginLeft: 6 }}>Fropty Hub — Portal ao vivo</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-success)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 10.5, color: 'var(--c-success)', fontWeight: 600 }}>ao vivo</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 220 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700,
              color: m.who === 'sistema' ? 'var(--text-faint)' : m.who === 'Fropty' ? 'var(--brand-500)' : 'var(--c-success)',
              minWidth: 42, paddingTop: 2, textAlign: 'right', letterSpacing: '0.01em',
            }}>{m.who === 'sistema' ? 'SYS' : m.who.toUpperCase()}</div>
            <div style={{
              flex: 1, fontSize: 12.5, color: 'var(--text)', lineHeight: 1.55,
              background: m.who === 'sistema' ? 'var(--surface-2)' : 'var(--bg)',
              border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ flex: 1 }}>{m.msg}</span>
              {m.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, color: m.color, background: m.color + '18', borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>
                  {m.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TABS = [
  {
    id: 'suporte',
    label: 'Suporte',
    steps: [
      { n: '01', title: 'Abre o chamado', desc: 'O cliente acessa o Hub e descreve o problema com contexto, prints e prioridade.' },
      { n: '02', title: 'SLA começa a contar', desc: 'O chamado entra na fila com SLA definido por tipo. Notificação automática confirma o recebimento.' },
      { n: '03', title: 'Acompanha em tempo real', desc: 'O cliente vê atualizações, mensagens da equipe e histórico de cada interação — sem precisar perguntar.' },
      { n: '04', title: 'Encerramento e CSAT', desc: 'Ao resolver, o cliente avalia o atendimento. O dado entra no health score automaticamente.' },
    ],
  },
  {
    id: 'projetos',
    label: 'Projetos',
    steps: [
      { n: '01', title: 'Solicita o projeto', desc: 'O cliente pede um novo desenvolvimento diretamente no Hub — com contexto, prazo e escopo.' },
      { n: '02', title: 'Proposta e aprovação', desc: 'A equipe envia proposta. O cliente aprova online, sem e-mail, sem PDF perdido.' },
      { n: '03', title: 'Acompanha as entregas', desc: 'Timeline, marcos e status atualizado em tempo real. O cliente sabe exatamente onde o projeto está.' },
      { n: '04', title: 'Entrega e aceite', desc: 'Cada entrega é documentada e aprovada dentro do portal. Histórico completo para futuras referências.' },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    steps: [
      { n: '01', title: 'Fatura gerada automaticamente', desc: 'Mensalidades e projetos geram faturas automaticamente com detalhamento completo.' },
      { n: '02', title: 'Notificação de vencimento', desc: 'O cliente recebe alertas antes do vencimento — sem surpresa, sem cobrança manual.' },
      { n: '03', title: 'Download de NF e contrato', desc: 'Notas fiscais e contratos disponíveis no portal. Acesso a qualquer hora, sem solicitar.' },
      { n: '04', title: 'Histórico consolidado', desc: 'Extratos mensais, histórico de pagamentos e projeções organizadas em um único lugar.' },
    ],
  },
]

export function LandingHowItWorks() {
  const [activeTab, setActiveTab] = useState(0)
  const tab = TABS[activeTab]

  return (
    <section id="como-funciona" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
            Como funciona
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 8px' }}>
            Simples para o cliente. Eficiente para a operação.
          </h2>
        </div>

        {/* Tab nav */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setActiveTab(i)} style={{
              all: 'unset', cursor: 'pointer',
              padding: '8px 20px', borderRadius: 8,
              fontSize: 13.5, fontWeight: 600,
              background: activeTab === i ? 'var(--brand-500)' : 'var(--surface)',
              color: activeTab === i ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${activeTab === i ? 'var(--brand-500)' : 'var(--border)'}`,
              transition: 'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
          {tab.steps.map((s, i) => (
            <div key={i} className="sr" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '22px 20px',
              boxShadow: 'var(--shadow-card)',
              '--sr-delay': `${i * 80}ms`,
            } as React.CSSProperties}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--brand-500)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, marginBottom: 14,
              }}>{s.n}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{s.title}</div>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Live demo mockup */}
        <HowItWorksDemo tab={tab.id} />

        <div style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-500)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            <strong style={{ color: 'var(--text)', fontStyle: 'normal' }}>O Fropty Hub transforma suporte em relacionamento.</strong>{' '}
            Cada ticket pode virar melhoria, projeto, upsell, retenção e insight de roadmap.
          </p>
        </div>
      </div>
    </section>
  )
}
