import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — Fropty Apps",
  description: "Termos de uso dos serviços da Fropty Apps: tokens, planos de manutenção, cancelamento, reembolso e responsabilidades.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-400">{children}</div>
    </section>
  );
}

export default function TermosPage() {
  return (
    <div className="min-h-screen" style={{ background: "#080e1c" }}>

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
        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">Termos de Uso</h1>
        <p className="mt-3 text-sm text-slate-500">Última atualização: 12 de junho de 2026</p>

        <Section title="1. Identificação">
          <p>
            Estes Termos de Uso regulam a contratação dos serviços da <strong className="text-slate-300">Fropty Apps</strong>,
            responsável: <strong className="text-slate-300">Fernando Bueno</strong>. Ao solicitar um orçamento ou contratar
            qualquer serviço pelo site fropty.com, você declara ter lido e aceitado estes termos.
          </p>
        </Section>

        <Section title="2. Descrição dos serviços">
          <p>A Fropty Apps oferece:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-slate-300">Prévia gratuita:</strong> visualização das telas principais da sua ideia de app, sem custo e sem compromisso.</li>
            <li><strong className="text-slate-300">App completo:</strong> desenvolvimento do app do início ao fim, a partir de R$ 499,00 (pagamento único), incluindo 1 rodada de ajustes na entrega.</li>
            <li><strong className="text-slate-300">Recursos adicionais (add-ons):</strong> funcionalidades extras contratadas à parte, com preço único ou mensal, conforme exibido no configurador.</li>
            <li><strong className="text-slate-300">Planos de manutenção mensal:</strong> Básico (R$ 49,90/mês, 4 tokens) e Pro (R$ 89,90/mês, 8 tokens).</li>
          </ul>
        </Section>

        <Section title="3. Política de tokens">
          <p>
            Um token representa uma demanda de suporte ou ajuste no seu app: correção de bug, alteração visual, mudança de
            texto, atualização de conteúdo ou pequena melhoria funcional. Demandas mais complexas podem consumir mais de um
            token — isso é combinado antes da execução.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Tokens <strong className="text-slate-300">não cobrem</strong> novas funcionalidades de grande porte, redesenhos completos ou integrações novas — esses casos são orçados à parte.</li>
            <li><strong className="text-slate-300">Validade mensal:</strong> tokens não utilizados expiram no fim de cada mês e não são transferidos para o mês seguinte.</li>
            <li>Tokens extras para assinantes de plano: <strong className="text-slate-300">R$ 150,00 cada</strong>.</li>
            <li>Tokens avulsos para não assinantes: <strong className="text-slate-300">R$ 300,00 cada</strong>.</li>
            <li>Sem plano ativo, nenhum suporte, ajuste ou melhoria pode ser solicitado — o app continua funcionando normalmente.</li>
          </ul>
        </Section>

        <Section title="4. Carência e cancelamento">
          <p className="font-bold" style={{ color: "#EF9F27" }}>
            Os planos de manutenção têm fidelidade mínima de 3 (três) meses.
          </p>
          <p>
            O cancelamento antes desse período sujeita o cliente ao pagamento da diferença entre os tokens utilizados e o
            valor avulso (R$ 300,00/token). Após o período mínimo, o cancelamento pode ser feito a qualquer momento, sem
            multa.
          </p>
          <p className="font-bold" style={{ color: "#EF9F27" }}>
            Clientes que cancelaram e desejam reativar o plano pagam taxa de reativação de R$ 79,90 no primeiro mês de
            retorno.
          </p>
        </Section>

        <Section title="5. Política de reembolso">
          <p>
            Para contratos celebrados online, o cliente tem direito de arrependimento no prazo de{" "}
            <strong className="text-slate-300">7 (sete) dias</strong> a partir da contratação, conforme o Art. 49 do Código
            de Defesa do Consumidor (Lei 8.078/1990), com devolução integral dos valores pagos. Fora desse prazo, pedidos de
            reembolso são analisados caso a caso conforme estes termos.
          </p>
        </Section>

        <Section title="6. Limitação de responsabilidade">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-slate-300">Backup:</strong> o plano base não inclui backup automático. Sem a contratação do add-on de backup, a Fropty Apps não se responsabiliza por perda de dados.</li>
            <li><strong className="text-slate-300">Domínio próprio:</strong> a Fropty Apps realiza apenas a configuração técnica (DNS, SSL). A titularidade, o registro e a renovação do domínio são de responsabilidade exclusiva do cliente.</li>
            <li><strong className="text-slate-300">Dados e conteúdo:</strong> o cliente é responsável pelo conteúdo publicado no seu app e pela legalidade dos dados que coleta de seus próprios usuários.</li>
          </ul>
        </Section>

        <Section title="7. Foro de eleição">
          <p>
            Fica eleito o foro da comarca de <strong className="text-slate-300">Indaiatuba/SP</strong> para dirimir
            quaisquer controvérsias decorrentes destes termos, sem prejuízo do foro do domicílio do consumidor, quando
            aplicável por lei.
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
