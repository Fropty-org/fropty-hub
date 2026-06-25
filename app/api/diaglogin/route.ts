import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// DIAGNÓSTICO TEMPORÁRIO — remover após investigar o login do hub.
// Protegido por token fixo para não ficar aberto.
const DIAG_TOKEN = "fropty-diag-9f3a";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("t") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const email = url.searchParams.get("email") ?? "";
  const password = url.searchParams.get("password") ?? "";

  const out: Record<string, unknown> = {
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      hubHost: process.env.NEXT_PUBLIC_HUB_HOST ?? null,
      hubUrl: process.env.NEXT_PUBLIC_HUB_URL ?? null,
    },
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    out.signIn = {
      ok: !error,
      errorMessage: error?.message ?? null,
      errorStatus: error?.status ?? null,
      userId: data?.user?.id ?? null,
      hasSession: !!data?.session,
    };
    if (data?.user) {
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", data.user.id)
        .single();
      out.profile = { profile, error: pErr?.message ?? null };
    }
  } catch (err) {
    out.exception = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }

  return NextResponse.json(out);
}
