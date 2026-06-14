import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import FaqAccordion from "./components/FaqAccordion";
import { QuoteButton } from "./components/QuoteModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { MobileNav } from "./components/MobileNav";
import { Footer } from "./components/Footer";
import { plans, faqs, previewAddons } from "./lib/data/plans";

const AppDemos = dynamic(() => import("./components/AppDemos"), {
  loading: () => (
    <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>
      <i className="ti ti-loader-2 text-3xl" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  ),
});

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)" }}>

      {/* Navbar */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Fropty Apps" width={28} height={28} className="rounded-md" />
            <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm sm:flex nav-links">
            <a href="#planos" className="nav-link transition">Planos</a>
            <a href="#exemplos" className="nav-link transition">Exemplos</a>
            <a href="#tokens" className="nav-link transition">Tokens</a>
            <a href="#faq" className="nav-link transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/configurador"
              className="hidden rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 sm:inline-flex"
              style={{ background: "var(--primary)" }}
            >
              Orçamento grátis
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--bg)" }}
      >
        {/* Background glow blobs */}
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px]"
          style={{ background: "rgba(91,87,232,0.18)" }}
        />
        <div
          className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: "rgba(239,159,39,0.08)" }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-0 pt-16 sm:pt-20">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">

            {/* Left — text */}
            <div className="flex-1 text-center lg:text-left lg:pt-6">
              <span
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  background: "rgba(91,87,232,0.15)",
                  color: "var(--primary)",
                  border: "1px solid rgba(91,87,232,0.25)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
                Prévia 100% gratuita
              </span>

              <h1
                className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl xl:text-6xl"
                style={{ color: "var(--text)", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                Seu app sob medida,{" "}
                <span style={{ color: "var(--primary)" }}>do jeito que você imaginou</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed lg:mx-0" style={{ color: "var(--text-muted)" }}>
                Conte sua ideia e receba uma prévia real em forma de app, totalmente gratuita.
                Sem tecnicismo, sem complicação. Só você e sua ideia.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                <QuoteButton
                  className="rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:brightness-110"
                  style={{ background: "var(--primary)", boxShadow: "0 8px 32px rgba(91,87,232,0.35)" }}
                >
                  Pedir orçamento grátis →
                </QuoteButton>
                <a
                  href="#exemplos"
                  className="rounded-full px-8 py-4 text-base font-semibold transition"
                  style={{
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    background: "transparent",
                  }}
                >
                  Ver exemplos
                </a>
              </div>

              {/* Social proof mini stats */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
                {[
                  { val: "R$0", sub: "para começar" },
                  { val: "3 dias", sub: "para ver a prévia" },
                  { val: "100%", sub: "personalizado" },
                ].map(({ val, sub }) => (
                  <div key={val} className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>{val}</span>
                    <span className="text-xs" style={{ color: "var(--text-faint)" }}>{sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — GIF hero */}
            <div className="w-full max-w-sm flex-shrink-0 lg:max-w-[380px] xl:max-w-[420px]">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  border: "1px solid var(--border)",
                  boxShadow: "0 24px 80px rgba(91,87,232,0.25)",
                  background: "var(--surface)",
                }}
              >
                <Image
                  src="/hero.gif"
                  alt="Demo do app Fropty"
                  width={420}
                  height={560}
                  className="w-full"
                  unoptimized
                  priority
                />
              </div>
            </div>

          </div>
        </div>

        {/* Marquee strip */}
        <div
          className="mt-16 overflow-hidden border-y py-4"
          style={{ borderColor: "var(--border)", background: "var(--bg-alt)" }}
        >
          <div className="animate-marquee flex gap-8 whitespace-nowrap" style={{ width: "max-content" }}>
            {Array(2).fill([
              "🚀 Prévia gratuita",
              "📱 Apps sob medida",
              "⚡ Entrega em 3 dias",
              "🔧 Manutenção mensal",
              "💬 Suporte com tokens",
              "✅ 100% personalizado",
              "🎯 Sem taxa de entrada",
              "🔒 Sem fidelidade inicial",
            ]).flat().map((item, i) => (
              <span key={i} className="text-sm font-medium" style={{ color: "var(--text-faint)" }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Planos ──────────────────────────────────────────────────── */}
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mb-3 flex justify-center">
          <span className="section-chip">Planos</span>
        </div>
        <h2
          className="text-center font-bold tracking-tight"
          style={{
            color: "var(--text)",
            fontFamily: "var(--font-plus-jakarta), sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 1.1,
          }}
        >
          Planos que crescem com você
        </h2>
        <p className="mt-4 text-center" style={{ color: "var(--text-muted)" }}>
          Comece de graça e evolua quando fizer sentido.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col rounded-2xl p-8 transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: plan.highlight ? "var(--primary)" : "var(--card-bg)",
                border: plan.highlight
                  ? "1px solid var(--primary)"
                  : "1px solid var(--card-border)",
                boxShadow: plan.highlight
                  ? "0 20px 60px rgba(91,87,232,0.35)"
                  : "0 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {plan.badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold tracking-wide text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {plan.badge}
                </span>
              )}
              <h3
                className="text-xl font-semibold"
                style={{ color: plan.highlight ? "#fff" : "var(--text)" }}
              >
                {plan.name}
              </h3>
              <p className="mt-4">
                <span
                  className="text-2xl font-bold"
                  style={{ color: plan.highlight ? "#fff" : "var(--primary)" }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="ml-1 text-sm"
                    style={{ color: plan.highlight ? "rgba(255,255,255,0.7)" : "var(--text-faint)" }}
                  >
                    {plan.period}
                  </span>
                )}
              </p>
              <p
                className="mt-3 text-sm"
                style={{ color: plan.highlight ? "rgba(255,255,255,0.85)" : "var(--text-muted)" }}
              >
                {plan.description}
              </p>
              <ul
                className="mt-6 flex-1 space-y-3 text-sm"
                style={{ color: plan.highlight ? "#fff" : "var(--text-muted)" }}
              >
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <i
                      className="ti ti-check mt-0.5 flex-shrink-0 text-base"
                      style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--primary)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.savingsStrike && (
                <div
                  className="mt-4 border-t pt-3"
                  style={{ borderColor: plan.highlight ? "rgba(255,255,255,0.2)" : "var(--border)" }}
                >
                  <p className="text-xs line-through" style={{ color: "rgba(239,68,68,0.65)" }}>
                    {plan.savingsStrike}
                  </p>
                  <p className="mt-1 text-sm font-bold" style={{ color: "#16a34a" }}>
                    {plan.savingsText}
                  </p>
                </div>
              )}
              {plan.note && (
                <p
                  className="mt-3 text-xs font-bold"
                  style={{ color: plan.highlight ? "rgba(255,255,255,0.8)" : "var(--accent)" }}
                >
                  {plan.note}
                </p>
              )}
              {plan.href ? (
                <Link
                  href={plan.href}
                  className="mt-8 block rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:opacity-90"
                  style={plan.highlight
                    ? { background: "var(--cta-bg)", color: "var(--cta-text)" }
                    : { border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Quero esse →
                </Link>
              ) : (
                <QuoteButton
                  className="mt-8 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition hover:opacity-90"
                  style={plan.highlight
                    ? { background: "var(--cta-bg)", color: "var(--cta-text)" }
                    : { border: "1px solid var(--border)", color: "var(--text-muted)" }}
                >
                  Quero esse →
                </QuoteButton>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "var(--text-faint)" }}>
          Valor de referência considerando token avulso de R$ 300,00 para não assinantes.
        </p>

        {/* Configurador card */}
        <Link href="/configurador" className="group mt-10 block">
          <div
            className="relative overflow-hidden rounded-2xl p-8 transition-all sm:p-10"
            style={{
              background: "var(--bg-alt)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(91,87,232,0.2)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "rgba(91,87,232,0.1)" }}
            />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex-1">
                <span
                  className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{ background: "rgba(239,159,39,0.15)", color: "var(--accent)" }}
                >
                  <i className="ti ti-adjustments-horizontal" />
                  Personalizável
                </span>
                <h3
                  className="text-2xl font-bold sm:text-3xl"
                  style={{ color: "var(--text)", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
                >
                  Monte o app perfeito para o seu negócio
                </h3>
                <p className="mt-2 max-w-lg" style={{ color: "var(--text-muted)" }}>
                  Login com Google, painel admin, WhatsApp, relatórios... escolha o que faz sentido.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {previewAddons.map(({ icon, label }) => (
                    <span
                      key={icon}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--card-bg)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <i className={`ti ti-${icon}`} style={{ color: "var(--primary)" }} />
                      {label}
                    </span>
                  ))}
                  <span
                    className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm"
                    style={{ border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-faint)" }}
                  >
                    +4 mais
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center gap-6 sm:flex-col sm:items-end">
                <div className="sm:text-right">
                  <div className="text-sm" style={{ color: "var(--text-faint)" }}>a partir de</div>
                  <div className="text-4xl font-bold" style={{ color: "var(--text)" }}>R$499</div>
                  <div className="text-sm" style={{ color: "var(--text-faint)" }}>pagamento único</div>
                </div>
                <div
                  className="whitespace-nowrap rounded-full px-6 py-3 font-semibold text-white shadow-lg transition group-hover:brightness-110"
                  style={{ background: "var(--primary)", boxShadow: "0 8px 24px rgba(91,87,232,0.3)" }}
                >
                  Monte seu App →
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* ── App Demos ───────────────────────────────────────────────── */}
      <AppDemos />

      {/* ── Tokens ──────────────────────────────────────────────────── */}
      <section
        id="tokens"
        className="scroll-mt-20 border-y py-20"
        style={{ background: "var(--bg-alt)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-3 flex justify-center">
            <span className="section-chip">Tokens</span>
          </div>
          <h2
            className="font-bold tracking-tight"
            style={{
              color: "var(--text)",
              fontFamily: "var(--font-plus-jakarta), sans-serif",
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              lineHeight: 1.1,
            }}
          >
            Como funcionam os tokens?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl" style={{ color: "var(--text-muted)" }}>
            No plano de manutenção mensal, você recebe tokens mensais conforme
            sua assinatura —{" "}
            <strong style={{ color: "var(--primary)" }}>4 tokens no Básico</strong> e{" "}
            <strong style={{ color: "var(--primary)" }}>8 tokens no Pro</strong>. Cada
            token vale um pedido de suporte ou ajuste no seu app.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: "ti-ticket",   title: "Básico: 4 · Pro: 8", body: "Todo mês você recebe tokens novos conforme seu plano." },
              { icon: "ti-hourglass", title: "Não acumulam",       body: "Tokens não usados expiram no fim do mês. Use sem medo." },
              { icon: "ti-tool",     title: "Suporte e ajustes",   body: "Cada token vale um ajuste ou atendimento de suporte." },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-6"
                style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
              >
                <i className={`ti ${icon} text-3xl`} style={{ color: "var(--primary)" }} />
                <h3 className="mt-3 font-semibold" style={{ color: "var(--text)" }}>{title}</h3>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20">
        <div className="mb-3 flex justify-center">
          <span className="section-chip">FAQ</span>
        </div>
        <h2
          className="text-center font-bold tracking-tight"
          style={{
            color: "var(--text)",
            fontFamily: "var(--font-plus-jakarta), sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 1.1,
          }}
        >
          Dúvidas? A gente responde
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* ── CTA final ───────────────────────────────────────────────── */}
      <section style={{ background: "var(--primary)" }}>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Pronto para tirar sua ideia do papel?
          </h2>
          <p className="mt-3 text-base text-white/75">
            Prévia gratuita. Sem compromisso. Do seu jeito.
          </p>
          <QuoteButton className="mt-8 rounded-full bg-white px-8 py-4 font-semibold transition hover:bg-[#E9E9FC]"
            style={{ color: "var(--primary)" }}>
            Pedir orçamento grátis →
          </QuoteButton>
        </div>
      </section>

      <Footer />

    </main>
  );
}
