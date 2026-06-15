import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PAGE = "/area-cliente";

// Rotas que exigem autenticação
const PROTECTED_PREFIXES = ["/portal", "/dev", "/admin", "/area-cliente/"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Valida JWT contra o Supabase Auth — sem query ao banco de dados
  const { data: { user } } = await supabase.auth.getUser();

  const path        = request.nextUrl.pathname;
  const isLoginPage = path === LOGIN_PAGE;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));

  // Visitante tenta acessar rota protegida → redireciona para login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PAGE;
    return NextResponse.redirect(url);
  }

  // Usuário autenticado acessa a página de login → redireciona para o portal
  // O controle de role (cliente/dev/admin) fica nos layouts — sem query de DB aqui
  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/area-cliente/:path*",
    "/portal/:path*",
    "/dev/:path*",
    "/admin/:path*",
  ],
};
