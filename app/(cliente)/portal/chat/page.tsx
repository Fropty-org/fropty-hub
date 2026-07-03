import { redirect } from "next/navigation";

// O Chat foi fundido ao Suporte — havia sobreposição total (ambos liam
// tickets/ticket_messages). O Suporte é agora o único canal de conversas:
// lista de chamados + conversa em tempo real no detalhe do chamado.
// Mantemos a rota como redirect para não quebrar links/bookmarks antigos.
export default function ChatPage() {
  redirect("/portal/suporte");
}
