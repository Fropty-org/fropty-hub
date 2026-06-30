'use client'
import { useEffect, useRef, useState } from 'react'

function Counter({ to, prefix = '', suffix = '', duration = 1800 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let start = 0
      const step = (ts: number) => {
        if (!start) start = ts
        const progress = Math.min((ts - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setVal(Math.round(eased * to))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.4 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{prefix}{val}{suffix}</span>
}

const STATS = [
  { prefix: '< ', to: 4, suffix: 'h', label: 'tempo médio de resposta', note: 'nos chamados abertos' },
  { prefix: '', to: 98, suffix: '%', label: 'índice de satisfação', note: 'CSAT dos últimos 90 dias' },
  { prefix: '', to: 999, suffix: '%', label: 'disponibilidade', note: '99.9% de uptime garantido', custom: '99.9%' },
  { prefix: '', to: 7, suffix: '', label: 'módulos integrados', note: 'um portal, tudo conectado' },
]

export function LandingStats() {
  return (
    <section id="metricas" style={{ borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
            Métricas
          </p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
            Suporte medido. Operação visível.
          </h2>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
          {/* Corner marks */}
          {[['top-0 left-0', '-top-px -left-px'], ['top-0 right-0', '-top-px -right-px'], ['bottom-0 left-0', '-bottom-px -left-px'], ['bottom-0 right-0', '-bottom-px -right-px']].map(([, pos], i) => (
            <div key={i} style={{
              position: 'absolute',
              top: i < 2 ? -4 : 'auto', bottom: i >= 2 ? -4 : 'auto',
              left: i % 2 === 0 ? -4 : 'auto', right: i % 2 === 1 ? -4 : 'auto',
              width: 8, height: 8,
              background: 'var(--border)',
              borderRadius: '50%',
              zIndex: 2,
            }} />
          ))}

          <div className="lp-grid-4-stats">
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding: '36px 28px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                textAlign: 'center',
              }} className="lp-stat-cell">
                <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-2px', color: 'var(--brand-500)', lineHeight: 1.1, marginBottom: 6 }}>
                  {s.custom ? s.custom : <Counter to={s.to} prefix={s.prefix} suffix={s.suffix} />}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
