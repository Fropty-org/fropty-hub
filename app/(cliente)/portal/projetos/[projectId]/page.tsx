import { redirect } from "next/navigation";

// O fluxo de "projetos" foi removido do portal do cliente (novo modelo:
// serviços contratados, tokens e contrato). A rota apenas redireciona.
export default function ProjetoDetalhePage() {
  redirect("/portal/dashboard");
}
