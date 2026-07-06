import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const LOGIN_PAGE = "/area-cliente";
const PROTECTED_PREFIXES = ["/admin", "/area-cliente/", "/portal/"];
// Área autenticada (cliente + admin) — quando o hub está configurado, vive só lá.
const HUB_PREFIXES = ["/area-cliente", "/portal", "/admin"];

// Resolve o host do hub a partir de NEXT_PUBLIC_HUB_HOST ou NEXT_PUBLIC_HUB_URL,
// tolerando protocolo, barra final, porta e maiúsculas.
function resolveHubHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_HUB_HOST || process.env.NEXT_PUBLIC_HUB_URL;
  if (!raw) return null;
  let h = raw.trim();
  if (h.includes("://")) { try { h = new URL(h).host; } catch { /* mantém raw */ } }
  return h.replace(/\/+$/, "").toLowerCase().split(":")[0] || null;
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

  // Response que carrega os cookies eventualmente renovados pelo Supabase.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
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
      // Raiz do hub: com sessão válida vai direto para o portal; sem sessão vê a landing.
      if (path === "/" && isAuthed) {
        const url = request.nextUrl.clone();
        url.pathname = "/portal/dashboard";
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
