import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SESSION_COOKIE_OPTIONS } from "./app/lib/supabase/cookies";

const LOGIN_PAGE = "/area-cliente";
const PROTECTED_PREFIXES = ["/admin", "/area-cliente/", "/portal/"];
// Área autenticada (cliente + admin) — quando o hub está configurado, vive só lá.
const HUB_PREFIXES = ["/area-cliente", "/portal", "/admin"];
// Rotas do Hub que recebem a CSP estrita em Report-Only (ver abaixo e SECURITY.md §5.1).
const CSP_PREFIXES = ["/area-cliente", "/portal", "/admin"];

// Resolve o host do hub a partir de NEXT_PUBLIC_HUB_HOST ou NEXT_PUBLIC_HUB_URL,
// tolerando protocolo, barra final, porta e maiúsculas.
function resolveHubHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_HUB_HOST || process.env.NEXT_PUBLIC_HUB_URL;
  if (!raw) return null;
  let h = raw.trim();
  if (h.includes("://")) { try { h = new URL(h).host; } catch { /* mantém raw */ } }
  return h.replace(/\/+$/, "").toLowerCase().split(":")[0] || null;
}

// CSP ESTRITA usada SÓ em Report-Only (observação — SECURITY.md §5.1). Não
// bloqueia nada: o header enforced (permissivo, em next.config.ts) continua
// valendo. Isto só reporta o que QUEBRARIA sob uma CSP com nonce, sem
// 'unsafe-inline'/'unsafe-eval'. style-src mantém 'unsafe-inline' (só o script
// está sendo endurecido).
function buildReportOnlyCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: https://cdn.jsdelivr.net https://randomuser.me https://loremflickr.com https://loremflickr.com/cache https://lh3.googleusercontent.com https://avatars.githubusercontent.com ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

// Middleware com renovação de sessão (padrão @supabase/ssr).
// Diferente da versão stateless anterior, aqui a sessão é VALIDADA e RENOVADA:
// getUser() atualiza o access token expirado e escreve os cookies novos na
// response (único lugar do Next onde isso é permitido). Isso mantém o usuário
// logado ao longo do tempo e, quando a sessão é de fato inválida, o cookie ruim
// é limpo — eliminando o loop de redirect (ERR_TOO_MANY_REDIRECTS) que forçava
// apagar os cookies manualmente.
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;

  // Subdomínio demo.fropty.com — serve /demo na raiz (sem necessidade de auth)
  if (host === "demo.fropty.com" && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/demo";
    return NextResponse.rewrite(url);
  }

  // Nonce por request para navegações HTML do Hub — habilita a CSP Report-Only
  // com nonce (o Next lê o header CSP do request e injeta o mesmo nonce nos
  // próprios <script>). Só para GET de página no Hub; assets/data/redirects e a
  // landing não precisam (e a landing não deve virar dinâmica).
  const isHtmlGet =
    request.method === "GET" &&
    (request.headers.get("accept") ?? "").includes("text/html");
  const onCspPath = CSP_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const nonce = isHtmlGet && onCspPath ? btoa(crypto.randomUUID()) : null;
  const reportOnlyCsp = nonce ? buildReportOnlyCsp(nonce) : null;

  // Headers do request repassados ao app. Quando há nonce, o Next os lê para
  // noncear os scripts. Reconstruído dentro do setAll para não perder os cookies
  // renovados pela sessão (ver nota do repasse de cookie abaixo).
  function buildRequestHeaders(): Headers {
    const h = new Headers(request.headers);
    if (nonce && reportOnlyCsp) {
      h.set("x-nonce", nonce);
      h.set("content-security-policy", reportOnlyCsp); // header de REQUEST (interno; não vai ao browser)
    }
    return h;
  }

  // Response que carrega os cookies eventualmente renovados pelo Supabase.
  let response = NextResponse.next({ request: { headers: buildRequestHeaders() } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: SESSION_COOKIE_OPTIONS,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          // buildRequestHeaders() reflete os cookies recém-setados em request.cookies
          // (além do nonce), então os Server Components enxergam a sessão renovada.
          response = NextResponse.next({ request: { headers: buildRequestHeaders() } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Valida + renova a sessão. Em falha de rede (Supabase indisponível), não
  // decide auth aqui — deixa passar e o layout server-side resolve (fail-open).
  let user = null;
  let authKnown = true;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    authKnown = false;
  }
  const isAuthed = !!user;

  // ── Roteamento do hub (ativa só quando o host do hub está configurado) ──
  const HUB_HOST = resolveHubHost();
  const reqHost = host.toLowerCase().split(":")[0];
  const onHub = !!HUB_HOST && reqHost === HUB_HOST;

  if (HUB_HOST) {
    if (onHub) {
      // Raiz do hub: é sempre login/portal (nunca a landing de marketing).
      // Logado → portal; deslogado → tela de login. Assim um cliente que digita
      // hub.fropty.com cai direto no lugar certo, sem passar pela landing.
      if (path === "/" && authKnown) {
        const url = request.nextUrl.clone();
        url.pathname = isAuthed ? "/portal/dashboard" : LOGIN_PAGE;
        return NextResponse.redirect(url);
      }
    } else {
      // Domínio público: a área autenticada foi movida para o hub
      if (HUB_PREFIXES.some((p) => path === p || path.startsWith(p + "/"))) {
        return NextResponse.redirect(
          new URL(`https://${HUB_HOST}${path}${request.nextUrl.search}`),
          308,
        );
      }
    }
  }

  // Decisões de auth só quando a validação foi conclusiva (evita logout em falha de rede).
  if (authKnown) {
    const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

    // Rota protegida sem sessão válida → login.
    if (isProtected && !isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PAGE;
      return NextResponse.redirect(url);
    }

    // Já autenticado tentando ver o login → portal. (Baseado no usuário REAL,
    // então nunca mais entra em loop com cookie inválido presente.)
    if (path === LOGIN_PAGE && isAuthed) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal/dashboard";
      return NextResponse.redirect(url);
    }
  }

  response.headers.set("x-pathname", path);
  // CSP estrita SÓ em Report-Only (não bloqueia). O header enforced vem do
  // next.config.ts. Ver SECURITY.md §5.1.
  if (reportOnlyCsp) response.headers.set("content-security-policy-report-only", reportOnlyCsp);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/area-cliente",
    "/area-cliente/:path*",
    "/admin/:path*",
    "/portal/:path*",
  ],
};
