// Tradução amigável de erros de senha do Supabase Auth.
// Quando a "Leaked Password Protection" (HaveIBeenPwned) ou a verificação de
// força recusam a senha, o GoTrue retorna um AuthError (geralmente code
// "weak_password"). Em vez de expor "senha vazada/comprometida", mostramos uma
// mensagem branda em nome do FroptySentinel.

export const SENTINEL_PASSWORD_MESSAGE =
  "O serviço FroptySentinel classificou a senha como não segura e protegeu sua entrada. Por favor crie outra senha.";

export function isWeakPasswordError(
  error: { code?: string; message?: string } | null | undefined,
): boolean {
  if (!error) return false;
  if (error.code === "weak_password") return true;
  return /weak|leak|pwned|breach|compromis|known to be/i.test(error.message ?? "");
}
