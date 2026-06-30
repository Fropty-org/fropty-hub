import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MODULES } from '@/app/lib/constants/modules'

export async function generateStaticParams() {
  return MODULES.map(m => ({ slug: m.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const mod = MODULES.find(m => m.id === slug)
  if (!mod) return {}
  const siteUrl = 'https://hub.fropty.com'
  return {
    title: mod.seoTitle,
    description: mod.seoDesc,
    alternates: { canonical: `${siteUrl}/modulos/${mod.id}` },
    openGraph: {
      title: mod.seoTitle,
      description: mod.seoDesc,
      url: `${siteUrl}/modulos/${mod.id}`,
      siteName: 'Fropty Hub',
      locale: 'pt_BR',
      type: 'website',
    },
  }
}

export default async function ModuloPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const mod = MODULES.find(m => m.id === slug)
  if (!mod) notFound()

  const siteUrl = 'https://hub.fropty.com'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `Fropty Hub — ${mod.name}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: mod.desc,
    url: `${siteUrl}/modulos/${mod.id}`,
    featureList: [...mod.features],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Incluído nos planos Fropty.',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px' }}>
          <Link href="/#modulos" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
            ← Voltar para o Hub
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: mod.color }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Módulo do Fropty Hub</span>
          </div>

          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 16px' }}>
            {mod.name}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 40px' }}>
            {mod.desc}
          </p>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 32px', marginBottom: 40 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', margin: '0 0 20px' }}>
              Funcionalidades
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mod.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'var(--text)' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: mod.color + '18', border: `1px solid ${mod.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, color: mod.color, fontWeight: 800 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: mod.color + '18', border: `1px solid ${mod.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>✦</div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--text)' }}>Incluído sem custo adicional</strong> em todos os planos Fropty. Ativamos o seu portal em até 24h úteis.
            </p>
          </div>

          <Link href="/#acesso" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--brand-500)', color: '#fff',
            borderRadius: 10, padding: '13px 24px',
            fontSize: 14.5, fontWeight: 700, textDecoration: 'none',
          }}>
            Ativar meu portal →
          </Link>
        </div>
      </main>
    </>
  )
}
