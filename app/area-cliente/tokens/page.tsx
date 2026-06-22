import { redirect } from "next/navigation";

// Página legada de tokens — substituída por /portal/financeiro (saldo, plano,
// contrato e extrato). Mantida apenas como redirect.
export default function TokensPage() {
  redirect("/portal/financeiro");
}
