import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/app/lib/supabase/types";
import type { EmailOtpType } from "@supabase/supabase-js";

const ALLOWED_NEXT_PREFIXES = ["/area-cliente", "/portal", "/admin"];

function sanitizeNext(next: string | null): string {
  const fallback = "/area-cliente/dashboard";
  if (!next) return fallback;
  if (ALLOWED_NEXT_PREFIXES.some((p) => next.startsWith(p))) return next;
  return fallback;
}

/**
 * Handler de auth por e-mail (recovery, invite, signup) e PKCE.
 *
 * Ponto crítico (mesmo bug do /api/login): o cookie de sessão criado por
 * verifyOtp/exchangeCodeForSession é gravado DIRETAMENTE no objeto de resposta
 * do redirect (res.cookies.set). No build de produção, mutações via next/headers
 * não eram mescladas num NextResponse.redirect criado à mão — o Set-Cookie sumia
 * e a página de destino (ex.: /area-cliente/nova-senha) ficava sem sessão,
 * resultando em "link expirado" ao definir a senha.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = sanitizeNext(url.searchParams.get("next"));

  const cookieStore = await cookies();
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

  // Redirect que leva junto o cookie de sessão recém-criado.
  const redirectWithSession = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    for (const { name, value, options } of pending) res.cookies.set(name, value, options);
    return res;
  };

  // Fluxo 1: token_hash (recovery, invite, signup) — sem PKCE
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      // Nada de boas-vindas aqui: o convite só foi aceito, a senha ainda não
      // foi definida. O e-mail de boas-vindas é enviado quando o cliente
      // conclui a criação da senha (ver updatePassword em actions/auth.ts).
      return redirectWithSession(next);
    }
  }

  // Fluxo 2: PKCE code exchange (OAuth, magic link)
  const code = url.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectWithSession(next);
  }

  return NextResponse.redirect(new URL("/area-cliente?error=link-expirado", request.url));
}
