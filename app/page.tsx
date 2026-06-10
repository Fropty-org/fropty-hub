"use client";

import { useState } from "react";
import Link from "next/link";
import QuoteForm from "./components/QuoteForm";
import AppDemos from "./components/AppDemos";

const plans = [
  {
    name: "Prévia gratuita",
    price: "R$0",
    period: "",
    badge: "",
    highlight: false,
    description:
      "Conte sua ideia e receba uma prévia visual do seu app, sem compromisso.",
    features: [
      "Como vão ficar as telas do seu app",
      "Sem custo e sem compromisso",
      "Entrega em poucos dias",
    ],
  },
  {
    name: "App completo",
    price: "a partir de R$499",
    period: "pagamento único",
    badge: "MAIS POPULAR",
    highlight: true,
    description:
      "Seu app desenvolvido do início ao fim, pronto para usar e publicar.",
    features: [
      "Desenvolvimento completo",
      "Design personalizado com suas cores e logo",
      "Publicação e entrega do código",
      "Suporte na entrega",
    ],
  },
  {
    name: "Manutenção mensal",
    price: "R$49,90",
    period: "/mês",
    badge: "",
    highlight: false,
    description:
      "Mantenha seu app sempre funcionando e evoluindo com suporte contínuo.",
    features: [
      "4 tokens por mês para ajustes e suporte",
      "Correções e pequenas melhorias",
      "Atendimento prioritário",
    ],
  },
];

const faqs = [
  {
    q: "A prévia é gratuita mesmo?",
    a: "Sim. Você conta sua ideia, a gente monta uma visualização das telas principais e te envia sem nenhum custo. Só depois, se gostar, você decide se quer o app completo.",
  },
  {
    q: "Quanto tempo leva para ficar pronto?",
    a: "A prévia sai em poucos dias. O app completo depende da complexidade, mas a maioria dos projetos é entregue em poucas semanas.",
  },
  {
    q: "Preciso entender de tecnologia?",
    a: "Não. Você descreve a ideia com suas palavras e a gente cuida de toda a parte técnica, da construção à publicação.",
  },
  {
    q: "Como funcionam os tokens da manutenção?",
    a: "Você recebe 4 tokens por mês. Cada token vale um pedido de ajuste ou suporte: mudar um texto, ajustar uma cor, corrigir algo. Eles não acumulam. Todo mês você começa com 4 novos.",
  },
  {
    q: "O app é meu mesmo?",
    a: "Sim. No plano App completo você recebe o código e a publicação. O projeto é seu.",
  },
];

const PREVIEW_ADDONS = [
  { icon: "lock", label: "Login" },
  { icon: "tool", label: "Admin" },
  { icon: "brand-whatsapp", label: "WhatsApp" },
  { icon: "bell", label: "Push" },
  { icon: "chart-bar", label: "Relatórios" },
  { icon: "world", label: "Domínio" },
];

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openForm = () => setFormOpen(true);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-700">

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Fropty<span className="text-[#185FA5]">Apps</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm text-slate-500 sm:flex">
            <a href="#planos" className="hover:text-slate-900">Planos</a>
            <a href="#exemplos" className="hover:text-slate-900">Exemplos</a>
            <a href="#tokens" className="hover:text-slate-900">Tokens</a>
            <a href="#faq" className="hover:text-slate-900">FAQ</a>
          </nav>
          <button
            onClick={openForm}
            className="rounded-full bg-[#185FA5] px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Pedir orçamento
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">
          Seu app sob medida,{" "}
          <span className="text-[#185FA5]">do jeito que você imaginou</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
          Conte sua ideia e receba uma prévia dela em forma de app, totalmente
          gratuita! Sem complicação técnica, sem precisar falar difícil. Conte
          a sua ideia com suas palavras e a gente faz o resto para você :)
        </p>
        <button
          onClick={openForm}
          className="mt-10 rounded-full bg-[#185FA5] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110"
        >
          Pedir orçamento grátis →
        </button>
      </section>

      {/* Métricas */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-6 py-10 text-center">
          <div>
            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">R$0</p>
            <p className="mt-1 text-sm text-slate-400">para começar</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">dias</p>
            <p className="mt-1 text-sm text-slate-400">para ver sua prévia</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 sm:text-3xl">100%</p>
            <p className="mt-1 text-sm text-slate-400">seu, com código</p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Planos
        </h2>
        <p className="mt-3 text-center text-slate-500">
          Comece de graça e evolua quando fizer sentido.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlight
                  ? "border border-[#185FA5] bg-[#185FA5] shadow-2xl shadow-blue-500/20"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#EF9F27] px-3 py-1 text-xs font-bold tracking-wide text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className={`text-xl font-semibold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                {plan.name}
              </h3>
              <p className="mt-4">
                <span className={`text-2xl font-bold ${plan.highlight ? "text-white" : "text-[#185FA5]"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`ml-1 text-sm ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>
                    {plan.period}
                  </span>
                )}
              </p>
              <p className={`mt-3 text-sm ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                {plan.description}
              </p>
              <ul className={`mt-6 flex-1 space-y-3 text-sm ${plan.highlight ? "text-white" : "text-slate-600"}`}>
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <i className={`ti ti-check mt-0.5 flex-shrink-0 text-base ${plan.highlight ? "text-blue-200" : "text-[#185FA5]"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openForm}
                className={`mt-8 rounded-full px-4 py-3 text-center font-semibold transition ${
                  plan.highlight
                    ? "bg-white text-[#185FA5] hover:bg-blue-50"
                    : "border border-slate-300 text-slate-600 hover:border-[#185FA5] hover:text-[#185FA5]"
                }`}
              >
                Quero esse →
              </button>
            </div>
          ))}
        </div>

        {/* Card configurador — entrada premium */}
        <Link href="/configurador" className="group mt-10 block">
          <div className="relative overflow-hidden rounded-2xl p-8 ring-1 ring-slate-700 transition hover:ring-[#185FA5] hover:shadow-2xl hover:shadow-blue-900/20 sm:p-10"
            style={{ background: "#0f172a" }}
          >
            {/* glow blobs */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(24,95,165,0.2)" }}
            />
            <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "rgba(24,95,165,0.12)" }}
            />

            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
              {/* esquerda */}
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
                  {PREVIEW_ADDONS.map(({ icon, label }) => (
                    <span key={icon} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-slate-300"
                      style={{ borderColor: "#334155", background: "#1e293b" }}
                    >
                      <i className={`ti ti-${icon} text-[#185FA5]`} />
                      {label}
                    </span>
                  ))}
                  <span className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm text-slate-500"
                    style={{ borderColor: "#334155", background: "#1e293b" }}
                  >
                    +4 mais
                  </span>
                </div>
              </div>

              {/* direita */}
              <div className="flex flex-row items-center gap-6 sm:flex-col sm:items-end">
                <div className="sm:text-right">
                  <div className="text-sm text-slate-500">a partir de</div>
                  <div className="text-4xl font-bold text-white">R$499</div>
                  <div className="text-sm text-slate-500">pagamento único</div>
                </div>
                <div className="rounded-full bg-[#185FA5] px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition group-hover:brightness-110 whitespace-nowrap">
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
      <section id="tokens" className="scroll-mt-20 border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Como funcionam os tokens?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-500">
            No plano de manutenção mensal, você recebe{" "}
            <strong className="text-[#185FA5]">4 tokens por mês</strong>. Cada
            token vale um pedido de suporte ou ajuste no seu app, como mudar
            um texto, ajustar uma cor ou corrigir algo que não está
            funcionando.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <i className="ti ti-ticket text-3xl text-[#185FA5]" />
              <h3 className="mt-3 font-semibold text-slate-900">4 por mês</h3>
              <p className="mt-1 text-sm text-slate-500">
                Todo mês você começa com 4 tokens novinhos.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <i className="ti ti-hourglass text-3xl text-[#185FA5]" />
              <h3 className="mt-3 font-semibold text-slate-900">Não acumulam</h3>
              <p className="mt-1 text-sm text-slate-500">
                Tokens não usados expiram no fim do mês. Use sem medo.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <i className="ti ti-tool text-3xl text-[#185FA5]" />
              <h3 className="mt-3 font-semibold text-slate-900">Suporte e ajustes</h3>
              <p className="mt-1 text-sm text-slate-500">
                Cada token vale um ajuste ou atendimento de suporte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium text-slate-800 hover:bg-slate-50"
              >
                {faq.q}
                <span className="ml-4 text-slate-400">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-500">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#185FA5]">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Pronto para tirar sua ideia do papel?
          </h2>
          <p className="mt-3 text-blue-100">
            A prévia é grátis. Você só tem a ganhar.
          </p>
          <button
            onClick={openForm}
            className="mt-8 rounded-full bg-white px-8 py-4 font-semibold text-[#185FA5] shadow-lg transition hover:bg-blue-50"
          >
            Pedir orçamento grátis →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
        © 2025 Fropty Apps
      </footer>

      {/* Modal do formulário */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:p-8"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Peça seu orçamento
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Conte sua ideia e a gente responde com uma prévia gratuita.
            </p>
            <QuoteForm />
          </div>
        </div>
      )}
    </main>
  );
}
