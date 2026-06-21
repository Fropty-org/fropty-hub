import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/app/lib/email/send";

const ALLOWED_NEXT_PREFIXES = ["/area-cliente", "/portal", "/admin"];

function sanitizeNext(next: string | null): string {
  const fallback = "/area-cliente/dashboard";
  if (!next) return fallback;
  if (ALLOWED_NEXT_PREFIXES.some((p) => next.startsWith(p))) return next;
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
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      // Convite aceito — dispara boas-vindas com resumo do plano (não bloqueia redirect)
      if (type === "invite" && data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, plan, token_balance")
          .eq("id", data.user.id)
          .single();

        const email = data.user.email ?? "";
        const name  = profile?.name || email.split("@")[0] || "Cliente";
        sendWelcomeEmail({
          toEmail:      email,
          toName:       name,
          plan:         profile?.plan ?? "sem_plano",
          tokenBalance: profile?.token_balance ?? 0,
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Fluxo 2: PKCE code exchange (OAuth, magic link)
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/area-cliente?error=link-expirado`);
}
