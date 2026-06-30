'use client'
import { useEffect, useRef } from 'react'

export function LandingReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight)
      if (barRef.current) barRef.current.style.width = `${Math.min(pct * 100, 100)}%`
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999, background: 'var(--border)' }}>
      <div ref={barRef} style={{ height: '100%', width: '0%', background: 'var(--brand-500)', transition: 'width 0.05s linear' }} />
    </div>
  )
}
