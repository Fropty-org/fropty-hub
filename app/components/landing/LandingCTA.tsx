'use client'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

const STATS = [
  { value: '< 4h', label: 'tempo de resposta' },
  { value: '98%', label: 'CSAT médio' },
  { value: '7', label: 'módulos integrados' },
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
          <div style={{ background: 'var(--text)', borderRadius: 16, padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0, opacity: 0.04,
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
              backgroundSize: '20px 20px',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Fropty Hub</span>
              </div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
                O portal que transforma suporte em relacionamento.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 36 }}>
                Um ponto de contato. Múltiplos produtos. Suporte com SLA, projetos com visibilidade e financeiro organizado.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {STATS.map(s => (
                  <div key={s.label} style={{ padding: '16px', background: 'rgba(255,255,255,0.07)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-500)', letterSpacing: '-0.5px', marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 36px', boxShadow: 'var(--shadow-card)' }}>
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircle size={40} style={{ color: 'var(--c-success)', marginBottom: 16 }} />
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Solicitação enviada!</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  Entraremos em contato em até 24h úteis com as instruções de acesso ao seu portal.
                </p>
              </div>
            ) : (
              <>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Solicitar acesso</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 28 }}>Preencha e entraremos em contato em até 24h úteis.</p>
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
                  <button type="submit" disabled={loading} style={{
                    all: 'unset', cursor: loading ? 'default' : 'pointer',
                    background: loading ? 'var(--text-faint)' : 'var(--brand-500)',
                    color: '#fff', borderRadius: 9, padding: '12px',
                    fontSize: 14, fontWeight: 700, textAlign: 'center',
                    transition: 'opacity 0.15s',
                    opacity: loading ? 0.7 : 1,
                  }}>
                    {loading ? 'Enviando...' : 'Solicitar acesso →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
