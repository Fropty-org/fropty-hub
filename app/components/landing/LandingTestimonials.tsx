const TESTIMONIALS = [
  { name: 'Rafael M.', role: 'CEO, Startup SaaS', text: 'O Hub mudou como interagimos com a Fropty. Tudo no mesmo lugar, com histórico e SLA visível. Suporte que respeita o tempo do cliente.', initials: 'RM' },
  { name: 'Ana Lima', role: 'CTO, Agência Digital', text: 'Antes perdíamos horas em e-mail. Agora abro o chamado, acompanho e já tenho resposta dentro do SLA. Parece que estamos na mesma equipe.', initials: 'AL' },
  { name: 'Bruno S.', role: 'Diretor Financeiro', text: 'Todas as faturas, NFs e contratos num só lugar. Simplesmente funciona. Não preciso mais mandar e-mail para pedir nota fiscal.', initials: 'BS' },
  { name: 'Carla T.', role: 'Gerente de Produto', text: 'O módulo de roadmap é incrível. Sugiro funcionalidades, voto e acompanho quando serão entregues. Sinto que minha opinião realmente importa.', initials: 'CT' },
  { name: 'Diego V.', role: 'CISO, Fintech', text: 'Com o Fropty Sentinel integrado ao Hub, tenho visibilidade total dos alertas e histórico de incidentes. Segurança com rastreabilidade real.', initials: 'DV' },
  { name: 'Elena P.', role: 'Fundadora, EdTech', text: 'A transparência de projeto é diferente de tudo que já usei. Saber exatamente em que fase está o meu app sem precisar perguntar é um alívio.', initials: 'EP' },
  { name: 'Felipe N.', role: 'Head de Ops', text: 'O health score ajudou a identificar que precisávamos de mais treinamento antes de expandir o uso. Proatividade da equipe Fropty impressionou.', initials: 'FN' },
  { name: 'Gabi R.', role: 'Diretora de CS', text: 'Recomendo o Hub para qualquer empresa que valoriza seus clientes. A experiência de suporte é premium, sem precisar de uma equipe de dezenas.', initials: 'GR' },
]

const ROW1 = [...TESTIMONIALS.slice(0, 4), ...TESTIMONIALS.slice(0, 4)]
const ROW2 = [...TESTIMONIALS.slice(4), ...TESTIMONIALS.slice(4)]

function Card({ t }: { t: typeof TESTIMONIALS[number] }) {
  return (
    <div style={{
      width: 290, flexShrink: 0,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '18px 20px',
      boxShadow: 'var(--shadow-card)',
    }}>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 16, fontStyle: 'italic' }}>
        &ldquo;{t.text}&rdquo;
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--brand-500)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, flexShrink: 0,
        }}>{t.initials}</div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{t.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{t.role}</div>
        </div>
      </div>
    </div>
  )
}

export function LandingTestimonials() {
  return (
    <section style={{ borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '72px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 32px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 12 }}>
          Depoimentos
        </p>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, letterSpacing: '-1px', margin: 0 }}>
          Suporte que transforma a percepção do produto.
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 12, width: 'max-content' }} className="lp-testimonial-left">
          {ROW1.map((t, i) => <Card key={i} t={t} />)}
        </div>
        <div style={{ display: 'flex', gap: 12, width: 'max-content' }} className="lp-testimonial-right">
          {ROW2.map((t, i) => <Card key={i} t={t} />)}
        </div>
      </div>
    </section>
  )
}
