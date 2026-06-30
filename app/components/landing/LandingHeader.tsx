'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'

const NAV = [
  { label: 'Visão geral', href: '#visao-geral' },
  { label: 'Módulos', href: '#modulos' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Métricas', href: '#metricas' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, height: 56,
      background: 'var(--nav-bg)',
      borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
      backdropFilter: 'blur(12px)',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 32 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>
            Fropty <span style={{ color: 'var(--brand-500)' }}>Hub</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="lp-nav-desktop">
          {NAV.map(n => (
            <a key={n.href} href={n.href} style={{
              fontSize: 13.5, fontWeight: 500, color: 'var(--text-muted)',
              padding: '5px 12px', borderRadius: 8, textDecoration: 'none',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--text)'; (e.target as HTMLElement).style.background = 'var(--surface-2)' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; (e.target as HTMLElement).style.background = 'transparent' }}
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <ThemeToggle />
          <a href="#acesso" style={{
            fontSize: 13, fontWeight: 600, color: '#fff',
            background: 'var(--brand-500)', borderRadius: 8,
            padding: '6px 16px', textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.target as HTMLElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.target as HTMLElement).style.opacity = '1'}
          >
            Solicitar acesso
          </a>
          <button
            className="lp-mobile-btn"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lp-mobile-menu" style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '12px 24px 20px',
        }}>
          {NAV.map(n => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} style={{
              display: 'block', padding: '10px 0',
              borderBottom: '1px solid var(--border)',
              fontSize: 14, fontWeight: 500, color: 'var(--text)',
              textDecoration: 'none',
            }}>
              {n.label}
            </a>
          ))}
          <a href="#acesso" onClick={() => setOpen(false)} style={{
            display: 'block', marginTop: 16, textAlign: 'center',
            background: 'var(--brand-500)', color: '#fff',
            borderRadius: 8, padding: '10px 0',
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Solicitar acesso
          </a>
        </div>
      )}
    </header>
  )
}
