export type Plan = {
  name: string;
  price: string;
  period: string;
  badge: string;
  highlight: boolean;
  description: string;
  features: string[];
  savingsStrike: string;
  savingsText: string;
  note: string;
  href?: string;
};

export const plans: Plan[] = [
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
    savingsStrike: "",
    savingsText: "",
    note: "",
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
      "App publicado e entregue em funcionamento",
      "Suporte na entrega",
    ],
    savingsStrike: "",
    savingsText: "",
    note: "O plano base não inclui backup automático. Recomendamos fortemente a contratação do add-on de backup.",
  },
  {
    name: "Manutenção Básico",
    price: "R$49,90",
    period: "/mês",
    badge: "",
    highlight: false,
    description:
      "Mantenha seu app funcionando com 4 tokens mensais de suporte e ajustes.",
    features: [
      "4 tokens por mês para ajustes",
      "Correções e pequenas melhorias",
      "Atendimento prioritário",
    ],
    savingsStrike: "4 tokens = R$ 1.200,00 avulso",
    savingsText: "Você economiza R$ 1.150,10",
    note: "Fidelidade mínima: 3 meses",
    href: "/configurador",
  },
  {
    name: "Manutenção Pro",
    price: "R$89,90",
    period: "/mês",
    badge: "MELHOR CUSTO",
    highlight: false,
    description:
      "Mais tokens, mais liberdade. Ideal para quem usa o suporte com frequência.",
    features: [
      "8 tokens por mês para ajustes",
      "Correções e pequenas melhorias",
      "Atendimento prioritário",
    ],
    savingsStrike: "8 tokens = R$ 2.400,00 avulso",
    savingsText: "Você economiza R$ 2.310,10",
    note: "Fidelidade mínima: 3 meses",
    href: "/configurador",
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
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
    a: "Você recebe tokens mensais de acordo com seu plano: 4 no Básico e 8 no Pro. Cada token vale um pedido de ajuste ou suporte: mudar um texto, ajustar uma cor, corrigir algo. Os tokens não acumulam. Tokens extras podem ser comprados avulsos sempre que precisar.",
  },
  {
    q: "O que é um token exatamente?",
    a: "Um token representa uma demanda de suporte ou ajuste no seu app: correção de bug, alteração visual, mudança de texto, atualização de conteúdo ou pequena melhoria funcional. Demandas mais complexas podem consumir mais de um token — isso é combinado antes da execução.",
  },
  {
    q: "Os tokens acumulam se eu não usar?",
    a: "Não. Tokens não utilizados expiram no fim de cada mês e não são transferidos para o mês seguinte. Use sem medo, mas planeje suas demandas.",
  },
  {
    q: "Posso cancelar o plano quando quiser?",
    a: "Os planos têm fidelidade mínima de 3 meses. Após esse período, o cancelamento é livre e sem multa. Cancelamentos antecipados estão sujeitos à cobrança da diferença entre os tokens utilizados e o valor avulso (R$300,00/token). Clientes que cancelaram e desejam retornar pagam uma taxa de reativação de R$79,90 no primeiro mês.",
  },
  {
    q: "Posso cancelar e assinar novamente depois?",
    a: "Sim, desde que respeitada a fidelidade mínima de 3 meses do plano. Clientes que cancelaram e desejam reativar o plano pagam uma taxa de reativação de R$79,90 no primeiro mês de retorno. A partir do segundo mês, a mensalidade volta ao valor normal do plano escolhido.",
  },
  {
    q: "O que acontece com meu app se eu não tiver plano?",
    a: "O app continua funcionando normalmente — ele é seu. Mas sem plano ativo, nenhum suporte, ajuste ou melhoria pode ser solicitado. Para demandas pontuais sem plano, o valor é de R$300,00 por token avulso.",
  },
  {
    q: "Tenho direito a reembolso?",
    a: "Sim. Para contratos celebrados online, o CDC garante 7 dias de arrependimento a partir da contratação (Art. 49). Fora desse prazo, reembolsos são analisados caso a caso conforme os termos de uso.",
  },
];

import { Lock, Wrench, MessageCircle, Bell, BarChart2, Globe, type LucideIcon } from "lucide-react";

export type PreviewAddon = { Icon: LucideIcon; label: string };

export const previewAddons: PreviewAddon[] = [
  { Icon: Lock,          label: "Login" },
  { Icon: Wrench,        label: "Admin" },
  { Icon: MessageCircle, label: "WhatsApp" },
  { Icon: Bell,          label: "Push" },
  { Icon: BarChart2,     label: "Relatórios" },
  { Icon: Globe,         label: "Domínio" },
];
