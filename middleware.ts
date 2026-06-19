import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PAGE = "/area-cliente";
const PROTECTED_PREFIXES = ["/admin", "/area-cliente/", "/portal/"];

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

  const isLoginPage = path === LOGIN_PAGE;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
  );

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

  return NextResponse.next();
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
