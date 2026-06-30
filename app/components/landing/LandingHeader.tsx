'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { AnimatedThemeToggler } from './AnimatedThemeToggler'
import { RainbowButton } from '../RainbowButton'
import Image from 'next/image'

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
          <Image src="/favicon.svg" alt="Fropty Hub" width={26} height={26} style={{ flexShrink: 0 }} unoptimized />
          <span style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text)' }}>
            Fropty <span style={{
              background: 'linear-gradient(90deg, #e040fb, #7c3aed, #2563eb, #16a34a, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Hub</span>
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
          <AnimatedThemeToggler size={32} />
          <RainbowButton asChild size="sm">
            <a href="#acesso" style={{ textDecoration: 'none' }}>Solicitar acesso</a>
          </RainbowButton>
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
          <RainbowButton asChild className="w-full mt-4">
            <a href="#acesso" onClick={() => setOpen(false)} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Solicitar acesso
            </a>
          </RainbowButton>
        </div>
      )}
    </header>
  )
}
