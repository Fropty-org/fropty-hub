import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";
import { ROLE_HOME, DEFAULT_ROLE, type UserRole } from "@/app/lib/auth/roles";

/**
 * Login por POST nativo de formulário (sem depender de JS no cliente).
 *
 * O <form> em /area-cliente envia method="post" action="/api/login". O browser
 * faz o POST nativo; aqui autenticamos, gravamos o cookie de sessão e devolvemos
 * um 303 para a home do papel. O browser segue o 303 no nível HTTP — navegação
 * garantida, imune a quirks de Server Action / cache de bundle. Em erro,
 * voltamos para /area-cliente?error=... para a tela exibir a mensagem.
 */
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const back = (code: string) =>
    NextResponse.redirect(new URL(`/area-cliente?error=${code}`, origin), 303);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return back("interno");
  }

  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  if (!email || !password) return back("credenciais");

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !user) return back("credenciais");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    return back("acesso-revogado");
  }

  const role = (profile?.role as UserRole) ?? DEFAULT_ROLE;
  // 303 → o browser troca o POST por GET na home do papel, levando o cookie
  // recém-gravado. O middleware vê a sessão e libera /portal ou /admin.
  return NextResponse.redirect(new URL(ROLE_HOME[role], origin), 303);
}
