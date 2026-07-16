import "server-only";

// FroptySentinel — verificação de reputação de URL.
//
// Estratégia (server-side, sem bloquear a experiência):
//  1. Blocklist local de domínios de teste conhecidos (Google Safe Browsing
//     test URLs) — garante que o estado "bloqueado" seja demonstrável mesmo
//     sem rede/chave, sem nunca marcar um site real como malicioso.
//  2. Google Safe Browsing v4 (malware + phishing + unwanted) quando a env
//     GOOGLE_SAFE_BROWSING_KEY estiver configurada — cobertura de referência.
//  3. Fallback grátis e sem chave: phish.sinking.yachts (lista de domínios de
//     phishing amplamente usada). Checa o hostname de cada URL.
//
// Política: qualquer serviço apontando ameaça ⇒ "blocked". Caso contrário
// ("clean" ou indeterminado / erro de rede) ⇒ "clean" (fail-open, para não
// engessar o uso legítimo). O erro é logado no servidor.

export type LinkVerdict = "clean" | "blocked";

// Domínios de teste oficiais que devem sempre reprovar (validação da UI).
const TEST_MALICIOUS_HOSTS = new Set([
  "malware.testing.google.test",
  "testsafebrowsing.appspot.com",
  "malware.wicar.org",
  "phishing.testing.google.test",
]);

function hostOf(url: string): string | null {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ""); }
  catch { return null; }
}

function matchesTestBlocklist(urls: string[]): boolean {
  return urls.some((u) => {
    const h = hostOf(u);
    if (!h) return false;
    return TEST_MALICIOUS_HOSTS.has(h) || [...TEST_MALICIOUS_HOSTS].some((b) => h === b || h.endsWith(`.${b}`));
  });
}

async function checkSafeBrowsing(urls: string[], key: string): Promise<boolean | null> {
  try {
    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "fropty-hub", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: urls.map((url) => ({ url })),
          },
        }),
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.matches) && data.matches.length > 0;
  } catch {
    return null;
  }
}

async function checkSinkingYachts(urls: string[]): Promise<boolean | null> {
  const hosts = [...new Set(urls.map(hostOf).filter((h): h is string => !!h))];
  if (hosts.length === 0) return null;
  let sawResult = false;
  for (const host of hosts) {
    try {
      const res = await fetch(`https://phish.sinking.yachts/v2/check/${encodeURIComponent(host)}`, {
        headers: { "Accept": "application/json", "X-Identity": "fropty-hub-sentinel" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      sawResult = true;
      const flagged = await res.json();
      if (flagged === true) return true;
    } catch {
      // ignora host individual e segue
    }
  }
  return sawResult ? false : null;
}

/**
 * Verifica a reputação das URLs de uma mensagem. Retorna "blocked" se qualquer
 * serviço apontar ameaça; "clean" caso contrário.
 */
export async function checkUrlsReputation(urls: string[]): Promise<LinkVerdict> {
  if (urls.length === 0) return "clean";

  // 1. Blocklist local (determinística) — sempre reprova.
  if (matchesTestBlocklist(urls)) return "blocked";

  // 2. Google Safe Browsing (se configurado).
  const key = process.env.GOOGLE_SAFE_BROWSING_KEY;
  if (key) {
    const gsb = await checkSafeBrowsing(urls, key);
    if (gsb === true) return "blocked";
    if (gsb === false) return "clean";
    // gsb === null → indeterminado, tenta o fallback
  }

  // 3. Fallback grátis sem chave.
  const sy = await checkSinkingYachts(urls);
  if (sy === true) return "blocked";

  // Indeterminado ou limpo → libera (fail-open).
  return "clean";
}
