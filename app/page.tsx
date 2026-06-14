import Link from "next/link";
import AppDemos from "./components/AppDemos";
import FaqAccordion from "./components/FaqAccordion";
import { QuoteButton } from "./components/QuoteModal";
import { plans, faqs, previewAddons } from "./lib/data/plans";

export default function Home() {
  return (
    <main className="min-h-screen text-slate-300" style={{ background: "#0A093F" }}>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur"
        style={{ background: "rgba(10,9,63,0.9)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-white">
            Fropty<span className="text-[#5B57E8]">Apps</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            <a href="#planos" className="hover:text-white transition">Planos</a>
            <a href="#exemplos" className="hover:text-white transition">Exemplos</a>
            <a href="#tokens" className="hover:text-white transition">Tokens</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>
          <Link
            href="/configurador"
            className="rounded-full bg-[#5B57E8] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Pedir orçamento
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Seu app sob medida,{" "}
          <span className="text-[#5B57E8]">do jeito que você imaginou</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Conte sua ideia e receba uma prévia dela em forma de app, totalmente
          gratuita! Sem complicação técnica, sem precisar falar difícil. Conte
          a sua ideia com suas palavras e a gente faz o resto para você :)
        </p>
        <QuoteButton className="mt-10 rounded-full bg-[#5B57E8] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#1E19B8]/40 transition hover:brightness-110">
          Pedir orçamento grátis →
        </QuoteButton>
      </section>

      {/* Métricas */}
      <section className="border-y border-white/10" style={{ background: "#110E67" }}>
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-6 py-10 text-center">
          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">R$0</p>
            <p className="mt-1 text-sm text-slate-500">para começar</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">3 dias</p>
            <p className="mt-1 text-sm text-slate-500">para ver sua prévia</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">100%</p>
            <p className="mt-1 text-sm text-slate-500">do seu jeito</p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Planos
        </h2>
        <p className="mt-3 text-center text-slate-400">
          Comece de graça e evolua quando fizer sentido.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 hover:scale-[1.03] ${
                plan.highlight
                  ? "border border-[#5B57E8] bg-[#5B57E8] shadow-2xl shadow-[#1E19B8]/30 hover:shadow-[0_20px_40px_rgba(91,87,232,0.45)]"
                  : "border border-white/10 bg-[#181490] hover:border-[#5B57E8]/40 hover:shadow-[0_16px_32px_rgba(0,0,0,0.4)]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#EF9F27] px-3 py-1 text-xs font-bold tracking-wide text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
              <p className="mt-4">
                <span className={`text-2xl font-bold ${plan.highlight ? "text-white" : "text-[#5B57E8]"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`ml-1 text-sm ${plan.highlight ? "text-[#C2C0F6]" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                )}
              </p>
              <p className={`mt-3 text-sm ${plan.highlight ? "text-blue-100" : "text-slate-400"}`}>
                {plan.description}
              </p>
              <ul className={`mt-6 flex-1 space-y-3 text-sm ${plan.highlight ? "text-white" : "text-slate-300"}`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <i className={`ti ti-check mt-0.5 flex-shrink-0 text-base ${plan.highlight ? "text-[#C2C0F6]" : "text-[#5B57E8]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.savingsStrike && (
                <div className="mt-4 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
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
                  className={`mt-3 text-xs font-bold ${plan.highlight ? "text-blue-100" : ""}`}
                  style={plan.highlight ? undefined : { color: "#EF9F27" }}
                >
                  {plan.note}
                </p>
              )}
              {plan.href ? (
                <Link
                  href={plan.href}
                  className={`mt-8 rounded-full px-4 py-3 text-center font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-[#5B57E8] hover:bg-[#E9E9FC]"
                      : "border border-white/20 text-slate-300 hover:border-[#5B57E8] hover:text-[#5B57E8]"
                  }`}
                >
                  Quero esse →
                </Link>
              ) : (
                <QuoteButton
                  className={`mt-8 rounded-full px-4 py-3 text-center font-semibold transition ${
                    plan.highlight
                      ? "bg-white text-[#5B57E8] hover:bg-[#E9E9FC]"
                      : "border border-white/20 text-slate-300 hover:border-[#5B57E8] hover:text-[#5B57E8]"
                  }`}
                >
                  Quero esse →
                </QuoteButton>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Valor de referência considerando token avulso de R$ 300,00 para não assinantes.
        </p>

        {/* Card configurador */}
        <Link href="/configurador" className="group mt-10 block">
          <div
            className="relative overflow-hidden rounded-2xl p-8 ring-1 ring-white/10 transition hover:ring-[#5B57E8] hover:shadow-2xl hover:shadow-[#1E19B8]/20 sm:p-10"
            style={{ background: "#0A093F" }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(91,87,232,0.2)" }} />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "rgba(91,87,232,0.12)" }} />

            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="flex-1">
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{ background: "rgba(239,159,39,0.15)", color: "#EF9F27" }}
                >
                  <i className="ti ti-adjustments-horizontal" />
                  Personalizável
                </span>
                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Monte o app perfeito para o seu negócio
                </h3>
                <p className="mt-2 max-w-lg text-slate-400">
                  Login com Google, painel admin, WhatsApp, relatórios... escolha o que faz sentido e veja o preço atualizar na hora.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {previewAddons.map(({ icon, label }) => (
                    <span key={icon} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-slate-300"
                      style={{ borderColor: "#334155", background: "#181490" }}
                    >
                      <i className={`ti ti-${icon} text-[#5B57E8]`} />
                      {label}
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-slate-500"
                    style={{ borderColor: "#334155", background: "#181490" }}
                  >
                    +4 mais
                  </span>
                </div>
              </div>

              <div className="flex flex-row items-center gap-6 sm:flex-col sm:items-end">
                <div className="sm:text-right">
                  <div className="text-sm text-slate-500">a partir de</div>
                  <div className="text-4xl font-bold text-white">R$499</div>
                  <div className="text-sm text-slate-500">pagamento único</div>
                </div>
                <div className="whitespace-nowrap rounded-full bg-[#5B57E8] px-6 py-3 font-semibold text-white shadow-lg shadow-[#1E19B8]/40 transition group-hover:brightness-110">
                  Monte seu App →
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* App Demos */}
      <AppDemos />

      {/* Tokens */}
      <section id="tokens" className="scroll-mt-20 border-y border-white/10" style={{ background: "#110E67" }}>
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Como funcionam os tokens?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            No plano de manutenção mensal, você recebe tokens mensais conforme
            sua assinatura —{" "}
            <strong className="text-[#5B57E8]">4 tokens no Básico</strong> e{" "}
            <strong className="text-[#5B57E8]">8 tokens no Pro</strong>. Cada
            token vale um pedido de suporte ou ajuste no seu app, como mudar
            um texto, ajustar uma cor ou corrigir algo que não está
            funcionando.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#181490] p-6">
              <i className="ti ti-ticket text-3xl text-[#5B57E8]" />
              <h3 className="mt-3 font-semibold text-white">Básico: 4 · Pro: 8</h3>
              <p className="mt-1 text-sm text-slate-400">
                Todo mês você recebe tokens novos conforme seu plano.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#181490] p-6">
              <i className="ti ti-hourglass text-3xl text-[#5B57E8]" />
              <h3 className="mt-3 font-semibold text-white">Não acumulam</h3>
              <p className="mt-1 text-sm text-slate-400">
                Tokens não usados expiram no fim do mês. Use sem medo.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#181490] p-6">
              <i className="ti ti-tool text-3xl text-[#5B57E8]" />
              <h3 className="mt-3 font-semibold text-white">Suporte e ajustes</h3>
              <p className="mt-1 text-sm text-slate-400">
                Cada token vale um ajuste ou atendimento de suporte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Perguntas frequentes
        </h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* CTA final */}
      <section className="bg-[#5B57E8]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Pronto para tirar sua ideia do papel?
          </h2>
          <QuoteButton className="mt-8 rounded-full bg-white px-8 py-4 font-semibold text-[#5B57E8] shadow-lg transition hover:bg-[#E9E9FC]">
            Pedir orçamento grátis →
          </QuoteButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500" style={{ background: "#110E67" }}>
        <p>© 2026 Fropty Apps</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/termos" className="hover:text-slate-300 transition">Termos de Uso</Link>
          <span className="text-slate-700">·</span>
          <Link href="/privacidade" className="hover:text-slate-300 transition">Política de Privacidade</Link>
        </div>
      </footer>
    </main>
  );
}
