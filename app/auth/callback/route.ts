import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function sanitizeNext(next: string | null): string {
  const fallback = "/area-cliente/dashboard";
  if (!next) return fallback;
  // Aceita apenas caminhos internos: começa com "/" mas não com "//" ou "/\"
  if (/^\/(?![/\\])/.test(next)) return next;
  return fallback;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = sanitizeNext(searchParams.get("next"));
  const supabase = await createClient();

  // Fluxo 1: token_hash (recovery, invite, signup) — sem PKCE, sem cookie
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // Fluxo 2: PKCE code exchange (OAuth, magic link)
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/area-cliente?error=link-expirado`);
}
