'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { RainbowButton } from '../RainbowButton'
import { ShineBorder } from '../ShineBorder'

const STATS = [
  { value: '< 4h', label: 'tempo de resposta' },
  { value: '98%', label: 'CSAT médio' },
  { value: '13', label: 'módulos integrados' },
  { value: '99.9%', label: 'uptime garantido' },
]

export function LandingCTA() {
  const [form, setForm] = useState({ name: '', email: '', company: '', context: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Nome obrigatório'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.company.trim()) e.company = 'Empresa obrigatória'
    return e
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1100))
    setLoading(false)
    setSuccess(true)
  }

  return (
    <section id="acesso" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 32px' }}>
        <div className="lp-cta-grid">
          {/* Left — brand panel */}
          <div style={{
            background: 'var(--cta-l)',
            backgroundImage: [
              'repeating-linear-gradient(-45deg, transparent, transparent 28px, var(--cta-stripe) 28px, var(--cta-stripe) 29px)',
              'radial-gradient(ellipse 65% 55% at 20% 50%, var(--cta-glow) 0%, transparent 70%)',
            ].join(', '),
            borderRadius: 16, padding: '48px 40px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', zIndex: 1, color: 'var(--cta-l-text)' }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, marginBottom: 16 }}>
                Comece agora
              </p>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 16 }}>
                Seu portal está pronto. Vamos ativar.
              </h2>
              <p style={{ fontSize: 14, opacity: 0.58, lineHeight: 1.7, marginBottom: 36, maxWidth: 360 }}>
                Incluído no seu plano. Nossa equipe ativa o acesso em até 24h úteis — com onboarding guiado e dados do seu contrato já configurados.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '90px', gap: 10, maxWidth: 340 }}>
                {STATS.map(s => (
                  <div key={s.label} style={{
                    padding: '14px 16px', borderRadius: 10,
                    border: '1px solid var(--cta-stat-bd)',
                    background: 'var(--cta-stat-bg)',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>{s.value}</div>
                    <div style={{ fontSize: 11.5, opacity: 0.65, fontWeight: 500, lineHeight: 1.35 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <ShineBorder borderRadius={16} borderWidth={1.5} duration={10} shineColor={['#e040fb', '#5B57E8', '#3b82f6', '#FE8FB5']}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: '40px 36px', boxShadow: 'var(--shadow-card)' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={40} style={{ color: 'var(--c-success)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Pronto! Seu portal está em ativação.</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  Nossa equipe entra em contato em até 2h úteis para confirmar os dados e ativar seu acesso. Você receberá as credenciais por e-mail com um guia de onboarding.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Ativar meu portal</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28 }}>Incluso no plano. Ativamos em até 24h úteis após o preenchimento.</p>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
                  {[
                    { key: 'name', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
                    { key: 'email', label: 'E-mail corporativo', type: 'email', placeholder: 'voce@empresa.com' },
                    { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Nome da empresa' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'var(--input-bg)', border: `1px solid ${errors[f.key] ? 'var(--c-danger)' : 'var(--input-border)'}`,
                          borderRadius: 8, padding: '10px 12px',
                          fontSize: 13.5, color: 'var(--text)',
                          outline: 'none',
                        }}
                      />
                      {errors[f.key] && <p role="alert" style={{ fontSize: 11.5, color: 'var(--c-danger)', margin: '4px 0 0' }}>{errors[f.key]}</p>}
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Contexto <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>(opcional)</span></label>
                    <textarea
                      placeholder="Produto contratado, número de usuários, necessidades específicas..."
                      value={form.context}
                      onChange={e => setForm(v => ({ ...v, context: e.target.value }))}
                      rows={3}
                      style={{
                        width: '100%', boxSizing: 'border-box', resize: 'vertical',
                        background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                        borderRadius: 8, padding: '10px 12px',
                        fontSize: 13.5, color: 'var(--text)', outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                  <RainbowButton
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    style={{ width: '100%' }}
                  >
                    {loading ? 'Ativando...' : 'Ativar meu portal →'}
                  </RainbowButton>
                </form>
              </>
            )}
          </div>
          </ShineBorder>
        </div>
      </div>
    </section>
  )
}
