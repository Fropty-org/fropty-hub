"use client";

import { useState } from "react";
import QuoteForm from "./components/QuoteForm";

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
      "Mockup das telas principais",
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
    a: "Sim. Você conta sua ideia, a gente monta um mockup das telas principais e te envia sem nenhum custo. Só depois, se gostar, você decide se quer o app completo.",
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
    a: "Você recebe 4 tokens por mês. Cada token vale um pedido de ajuste ou suporte — mudar um texto, ajustar uma cor, corrigir algo. Eles não acumulam: todo mês você começa com 4 novos.",
  },
  {
    q: "O app é meu mesmo?",
    a: "Sim. No plano App completo você recebe o código e a publicação. O projeto é seu.",
  },
];

export default function Home() {
  const [formOpen, setFormOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const openForm = () => setFormOpen(true);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight">
            Fropty<span className="text-[#185FA5]">Apps</span>
          </span>
          <nav className="hidden items-center gap-6 text-sm text-neutral-600 sm:flex">
            <a href="#planos" className="hover:text-neutral-900">
              Planos
            </a>
            <a href="#tokens" className="hover:text-neutral-900">
              Tokens
            </a>
            <a href="#faq" className="hover:text-neutral-900">
              FAQ
            </a>
          </nav>
          <button
            onClick={openForm}
            className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            Pedir orçamento
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-24 text-center">
        <span className="inline-block rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1 text-sm font-medium text-neutral-700">
          ⚡ Do papel ao app em semanas
        </span>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Seu app sob medida,{" "}
          <span className="text-[#185FA5]">do jeito que você imaginou</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
          Conte sua ideia e receba uma prévia gratuita. Sem complicação, sem
          jargão técnico — só o seu app saindo do papel.
        </p>
        <button
          onClick={openForm}
          className="mt-10 rounded-full bg-[#185FA5] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110"
        >
          Pedir orçamento grátis →
        </button>
        <p className="mt-3 text-sm text-neutral-500">
          Prévia gratuita · Sem compromisso
        </p>
      </section>

      {/* Prova social / métricas */}
      <section className="border-y border-neutral-100 bg-neutral-50">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-6 py-10 text-center">
          <div>
            <p className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              R$0
            </p>
            <p className="mt-1 text-sm text-neutral-500">para começar</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              dias
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              para ver sua prévia
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900 sm:text-3xl">
              100%
            </p>
            <p className="mt-1 text-sm text-neutral-500">seu, com código</p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Planos
        </h2>
        <p className="mt-3 text-center text-neutral-600">
          Comece de graça e evolua quando fizer sentido.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.highlight
                  ? "bg-neutral-900 text-white shadow-2xl"
                  : "border border-neutral-200 bg-white shadow-sm"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#185FA5] px-3 py-1 text-xs font-bold tracking-wide text-white">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-4">
                <span
                  className={`text-2xl font-bold ${
                    plan.highlight ? "text-white" : "text-[#185FA5]"
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`ml-1 text-sm ${
                      plan.highlight ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </p>
              <p
                className={`mt-3 text-sm ${
                  plan.highlight ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-[#4D9BE0]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={openForm}
                className={`mt-8 rounded-full px-4 py-3 text-center font-semibold transition ${
                  plan.highlight
                    ? "bg-[#185FA5] text-white hover:brightness-110"
                    : "border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                Quero esse →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tokens */}
      <section id="tokens" className="scroll-mt-20 bg-neutral-950 text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Como funcionam os tokens?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            No plano de manutenção mensal, você recebe{" "}
            <strong className="text-[#4D9BE0]">4 tokens por mês</strong>. Cada
            token vale um pedido de suporte ou ajuste no seu app — como mudar
            um texto, ajustar uma cor ou corrigir algo que não está
            funcionando.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="text-3xl">🎟️</div>
              <h3 className="mt-3 font-semibold">4 por mês</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Todo mês você começa com 4 tokens novinhos.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="text-3xl">⏳</div>
              <h3 className="mt-3 font-semibold">Não acumulam</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Tokens não usados expiram no fim do mês — use sem medo.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="text-3xl">🛠️</div>
              <h3 className="mt-3 font-semibold">Suporte e ajustes</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Cada token vale um ajuste ou atendimento de suporte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-10 divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {faqs.map((faq, i) => (
            <div key={faq.q}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-medium hover:bg-neutral-50"
              >
                {faq.q}
                <span className="ml-4 text-neutral-400">
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <p className="px-6 pb-5 text-sm leading-relaxed text-neutral-600">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#185FA5] text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Pronto para tirar sua ideia do papel?
          </h2>
          <p className="mt-3 text-blue-100">
            A prévia é grátis. Você só tem a ganhar.
          </p>
          <button
            onClick={openForm}
            className="mt-8 rounded-full bg-white px-8 py-4 font-semibold text-[#185FA5] shadow-lg transition hover:bg-neutral-100"
          >
            Pedir orçamento grátis →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 py-8 text-center text-sm text-neutral-400">
        © 2025 Fropty Apps
      </footer>

      {/* Modal do formulário */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
          onClick={() => setFormOpen(false)}
        >
          <div
            className="relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFormOpen(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold tracking-tight">
              Peça seu orçamento
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Conte sua ideia e a gente responde com uma prévia gratuita.
            </p>
            <QuoteForm />
          </div>
        </div>
      )}
    </main>
  );
}
