import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PAGE = "/area-cliente";
const PROTECTED_PREFIXES = ["/dev", "/admin", "/area-cliente/"];

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

  if (isLoginPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/area-cliente/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/area-cliente/:path*",
    "/dev/:path*",
    "/admin/:path*",
  ],
};
