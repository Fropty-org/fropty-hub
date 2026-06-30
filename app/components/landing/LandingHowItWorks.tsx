'use client'
import type React from 'react'
import { useState } from 'react'

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
