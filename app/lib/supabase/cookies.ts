import type { CookieOptions } from "@supabase/ssr";

// Durabilidade do "lembrar de mim" (cookies de sessão do Supabase).
//
// Sem maxAge explícito, o @supabase/ssr pode gravar cookies de sessão que
// morrem ao fechar o navegador — o que fazia um cliente que sumiu por um tempo
// cair na tela de login "do nada". A SESSÃO em si (auth.sessions/refresh_tokens)
// não expira por desuso no Supabase; o elo fraco é a persistência do cookie no
// navegador. Fixamos aqui um prazo longo e previsível.
//
// Isto controla só por quanto tempo o cliente fica logado SEM redigitar a senha.
// Não tem relação com a conta existir (permanente) nem com o logout por
// inatividade de 30 min do SessionGuard (aba aberta e parada).
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  maxAge: SESSION_MAX_AGE_SECONDS,
};
