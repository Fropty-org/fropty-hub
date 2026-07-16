// Utilitários de URL compartilhados (cliente + servidor) para a verificação
// de segurança de link do FroptySentinel. Sem dependências de runtime — só
// regex e URL nativa — para poder rodar tanto no browser quanto no server.

// Captura tanto o alvo de um link markdown `[texto](alvo)` quanto URLs "cruas"
// (http/https ou começando com www.) espalhadas no corpo da mensagem.
const MD_LINK   = /\[[^\]]*\]\(([^)\s]+)\)/g;
const BARE_URL  = /(?:https?:\/\/|www\.)[^\s<>()]+/gi;

/**
 * Normaliza um alvo de link para uma URL http(s) segura, ou retorna null quando
 * o valor não é uma URL válida/segura (ex.: `javascript:`, `mailto:`, texto solto).
 * URLs sem esquema (ex.: `www.exemplo.com`) recebem `https://`.
 */
export function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  let candidate = raw.trim();
  // mailto é tratado à parte no formatador (não é URL http navegável).
  if (/^mailto:/i.test(candidate)) return null;
  if (/^https?:\/\//i.test(candidate)) {
    // ok
  } else if (/^www\./i.test(candidate) || /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i.test(candidate)) {
    candidate = `https://${candidate}`;
  } else {
    return null; // esquemas não http (javascript:, data:, etc.) ou não-URL
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Extrai todas as URLs http(s) navegáveis de um corpo de mensagem (dedupe). */
export function extractUrls(body: string): string[] {
  if (!body) return [];
  const found = new Set<string>();
  for (const m of body.matchAll(MD_LINK)) {
    const n = normalizeUrl(m[1]);
    if (n) found.add(n);
  }
  for (const m of body.matchAll(BARE_URL)) {
    const n = normalizeUrl(m[0]);
    if (n) found.add(n);
  }
  return [...found];
}

/** Há pelo menos uma URL navegável no corpo? */
export function hasUrl(body: string): boolean {
  return extractUrls(body).length > 0;
}
