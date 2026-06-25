import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// DIAGNÓSTICO TEMPORÁRIO — remover após investigar o login do hub.
const DIAG_TOKEN = "fropty-diag-9f3a";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("t") !== DIAG_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const email = url.searchParams.get("email") ?? "";
  const password = url.searchParams.get("password") ?? "";

  const out: Record<string, unknown> = {};
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
  } catch (err) {
    out.exception = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  }
  return NextResponse.json(out);
}
