'use client'
import { useEffect } from 'react'

export function LandingScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('sr-in'); obs.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.sr').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return null
}
