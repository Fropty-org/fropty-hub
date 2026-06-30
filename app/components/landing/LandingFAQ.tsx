'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'O acesso ao Hub tem custo adicional?', a: 'Não. O Fropty Hub é incluído em todos os planos de produto e serviço da Fropty. Não há cobrança separada pelo portal.' },
  { q: 'Quanto tempo leva para ter acesso após contratar?', a: 'O acesso é criado em até 24h úteis após a contratação. Você recebe um e-mail de boas-vindas com as credenciais e um guia de onboarding.' },
  { q: 'Posso adicionar mais usuários da minha empresa?', a: 'Sim. Dependendo do plano, você pode adicionar múltiplos usuários com diferentes permissões — gestor, financeiro, técnico e visualizador.' },
  { q: 'O que acontece se meu chamado ultrapassar o SLA?', a: 'O chamado é escalado automaticamente para o nível sênior e você recebe uma notificação. O SLA descumprido é registrado e refletido no relatório mensal.' },
  { q: 'O Hub se integra com outras ferramentas que usamos?', a: 'Sim. O Hub possui integração com Slack para notificações, e-mail para fallback de comunicação, e webhooks para conectar com sistemas internos. Novas integrações podem ser solicitadas via roadmap.' },
  { q: 'Posso solicitar novos projetos pelo Hub?', a: 'Sim. O módulo de Projetos permite abrir solicitações de desenvolvimento, acompanhar propostas, aprovar escopo e acompanhar entregas — tudo dentro do portal.' },
  { q: 'O Hub substitui completamente o e-mail de suporte?', a: 'O Hub é o canal primário e recomendado. O e-mail existe como fallback, mas todas as interações são centralizadas no portal para garantir rastreabilidade e SLA.' },
]

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
            Dúvidas frequentes
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
            Perguntas e respostas
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                style={{
                  all: 'unset', width: '100%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  padding: '16px 20px',
                  fontSize: 14, fontWeight: 600, color: 'var(--text)',
                }}
              >
                {faq.q}
                <ChevronDown size={16} style={{ flexShrink: 0, color: 'var(--text-muted)', transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              <div style={{
                display: 'grid',
                gridTemplateRows: open === i ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.25s ease',
              }}>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, padding: '0 20px 16px', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
