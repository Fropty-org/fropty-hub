import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const { data: { user } } = await supabase.auth.getUser();

  const isClientArea = request.nextUrl.pathname.startsWith("/area-cliente");
  const isLoginPage  = request.nextUrl.pathname === "/area-cliente";

  // Redireciona usuário não autenticado para login
  if (isClientArea && !isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/area-cliente";
    return NextResponse.redirect(url);
  }

  // Redireciona usuário autenticado que acessa login para o dashboard
  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/area-cliente/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/area-cliente/:path*"],
};
