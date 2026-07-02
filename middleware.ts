import { NextResponse, type NextRequest } from "next/server";

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

// Middleware totalmente stateless: sem Supabase client, sem chamadas de rede.
// Verifica apenas a presença do cookie de sessão do Supabase (sb-*-auth-token).
// A validação real do JWT acontece nos layouts server-side (Node.js runtime).
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const path = request.nextUrl.pathname;

  // Subdomínio demo.fropty.com — serve /demo na raiz
  if (host === "demo.fropty.com" && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/demo";
    return NextResponse.rewrite(url);
  }

  // ── Roteamento do hub (ativa só quando o host do hub está configurado) ──
  // Aceita NEXT_PUBLIC_HUB_HOST ("hub.fropty.com") ou deriva de
  // NEXT_PUBLIC_HUB_URL ("https://hub.fropty.com"). Normaliza protocolo/porta/case.
  const HUB_HOST = resolveHubHost();
  const reqHost = host.toLowerCase().split(":")[0];
  const onHub = !!HUB_HOST && reqHost === HUB_HOST;

  // O cookie de sessão do Supabase pode vir fragmentado: sb-<ref>-auth-token
  // ou sb-<ref>-auth-token.0 / .1 (sessões maiores). Cobre os dois formatos.
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );

  if (HUB_HOST) {
    if (onHub) {
      // Raiz do hub: visitante sem sessão vê a landing (app/page.tsx) normalmente.
      // Com sessão ativa, vai direto para o portal — cliente logado não precisa
      // rever a landing. (Login continua morando em /area-cliente, URL real.)
      if (path === "/" && hasSession) {
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

  const isLoginPage = path === LOGIN_PAGE;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PAGE;
    return NextResponse.redirect(url);
  }

  // Usuário já autenticado tenta acessar a página de login → manda para o portal
  if (isLoginPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/dashboard";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", path);
  return res;
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
