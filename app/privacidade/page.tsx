import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Fropty Apps",
  description: "Como a Fropty Apps coleta, usa e protege seus dados pessoais, conforme a LGPD (Lei 13.709/2018).",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">{children}</div>
    </section>
  );
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen" style={{ background: "#040316" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur"
        style={{ background: "rgba(8,14,28,0.85)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <i className="ti ti-arrow-left text-base" />
            Voltar
          </Link>
          <span className="text-base font-bold tracking-tight text-white">
            Fropty<span className="text-[#5B57E8]">Apps</span>
          </span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14">
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">Política de Privacidade</h1>
        <p className="mt-3 text-sm text-slate-500">Última atualização: 12 de junho de 2026</p>

        <p className="mt-6 text-sm leading-relaxed text-slate-400">
          Esta política descreve como a Fropty Apps trata os dados pessoais coletados pelo site fropty.com, em conformidade
          com a Lei Geral de Proteção de Dados — LGPD (Lei 13.709/2018).
        </p>

        <Section title="1. Quais dados coletamos">
          <p>
            Ao preencher o formulário de orçamento ou o configurador de planos, coletamos apenas os dados que você informa:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-slate-300">Nome</strong></li>
            <li><strong className="text-slate-300">E-mail</strong></li>
            <li><strong className="text-slate-300">Informações sobre sua ideia de app</strong> (descrição, preferências de cores, recursos desejados)</li>
          </ul>
          <p>Não coletamos dados sensíveis nem utilizamos cookies de rastreamento para publicidade.</p>
        </Section>

        <Section title="2. Para que usamos seus dados">
          <p>
            Os dados são usados <strong className="text-slate-300">somente para contato comercial</strong>: responder ao seu
            pedido de orçamento, enviar a prévia do seu app e dar continuidade à conversa sobre o projeto. Nada além disso.
          </p>
        </Section>

        <Section title="3. Compartilhamento">
          <p>
            Seus dados <strong className="text-slate-300">não são vendidos nem compartilhados com terceiros</strong> para
            fins comerciais. Utilizamos apenas o serviço de envio de e-mail necessário para que sua mensagem chegue até nós.
          </p>
        </Section>

        <Section title="4. Como pedir a remoção dos seus dados">
          <p>
            Você pode solicitar a exclusão dos seus dados a qualquer momento, sem custo: basta responder a qualquer e-mail
            recebido da Fropty Apps solicitando a remoção, e seus dados serão apagados dos nossos registros de contato.
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-slate-500">
        <p>© 2026 Fropty Apps</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="/termos" className="transition hover:text-slate-300">Termos de Uso</Link>
          <span className="text-slate-700">·</span>
          <Link href="/privacidade" className="transition hover:text-slate-300">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}
