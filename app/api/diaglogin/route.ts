import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/app/lib/supabase/types";

// DIAGNÓSTICO TEMPORÁRIO — remover após investigar o login do hub.
const DIAG_TOKEN = "fropty-diag-9f3a";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("t") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const email = url.searchParams.get("email") ?? "";
  const password = url.searchParams.get("password") ?? "";
  const mode = url.searchParams.get("mode") ?? "json";

  const cookieStore = await cookies();

  // Modo echo: só relata os cookies que CHEGARAM nesta requisição. Usado como
  // destino do modo redirect para provar que o Set-Cookie do 303 sobreviveu.
  if (mode === "echo") {
    const all = cookieStore.getAll();
    return NextResponse.json({
      echo: true,
      receivedCookieNames: all.map((c) => c.name),
      hasAuthCookie: all.some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")),
    });
  }
  const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const c of cookiesToSet) pending.push(c as (typeof pending)[number]);
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Modo redirect: replica EXATAMENTE o /api/login corrigido (303 + cookie no
  // próprio response). Permite seguir o fluxo via fetch e ver onde aterrissa.
  if (mode === "redirect") {
    if (error || !data?.user) {
      return NextResponse.redirect(new URL("/area-cliente?error=credenciais", request.url), 303);
    }
    // Redireciona para o endpoint echo (mesmo domínio, fora do matcher do
    // middleware) para não sofrer o redirect cross-domain dos /portal/*.
    const dest = new URL("/api/diaglogin", request.url);
    dest.searchParams.set("t", DIAG_TOKEN);
    dest.searchParams.set("mode", "echo");
    const res = NextResponse.redirect(dest, 303);
    for (const { name, value, options } of pending) res.cookies.set(name, value, options);
    return res;
  }

  // Round-trip: recria um client SÓ com os cookies recém-gravados e tenta
  // getUser() — prova se a sessão grava/relê corretamente no runtime real.
  let roundTrip: Record<string, unknown> = { skipped: true };
  if (!error && pending.length) {
    const reader = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => pending.map(({ name, value }) => ({ name, value })),
          setAll: () => {},
        },
      }
    );
    const { data: u2, error: e2 } = await reader.auth.getUser();
    roundTrip = { ok: !e2, userId: u2?.user?.id ?? null, error: e2?.message ?? null };
  }

  return NextResponse.json({
    signIn: {
      ok: !error,
      errorMessage: error?.message ?? null,
      userId: data?.user?.id ?? null,
      hasSession: !!data?.session,
    },
    cookiesSet: pending.map((c) => ({
      name: c.name,
      valueLength: c.value.length,
      options: c.options,
    })),
    roundTripGetUser: roundTrip,
    env: {
      requestUrl: request.url,
      origin: url.origin,
      host: request.headers.get("host"),
      xForwardedHost: request.headers.get("x-forwarded-host"),
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hubHost: process.env.NEXT_PUBLIC_HUB_HOST ?? null,
      hubUrl: process.env.NEXT_PUBLIC_HUB_URL ?? null,
    },
  });
}
