import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/app/lib/supabase/types";
import { ROLE_HOME, DEFAULT_ROLE, type UserRole } from "@/app/lib/auth/roles";

/**
 * Login por POST nativo de formulário (sem depender de JS no cliente).
 *
 * O <form> em /area-cliente envia method="post" action="/api/login". O browser
 * faz o POST nativo; aqui autenticamos e respondemos 303 para a home do papel.
 *
 * Ponto crítico (causa do bug histórico): o cookie de sessão do Supabase é
 * gravado DIRETAMENTE no objeto de resposta do redirect (res.cookies.set), e
 * não via cookies() do next/headers. No build de produção, mutações de cookie
 * feitas pelo next/headers NÃO eram mescladas num NextResponse.redirect criado
 * à mão — o Set-Cookie sumia, o browser nunca recebia a sessão e o middleware
 * mandava o usuário de volta para a tela de login. Anexar ao próprio response
 * garante o Set-Cookie no 303. A base da URL é request.url (mesmo host/origin),
 * para o cookie (host-only) ser enviado no destino.
 */
export async function POST(request: Request) {
  const back = (code: string) =>
    NextResponse.redirect(new URL(`/area-cliente?error=${code}`, request.url), 303);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return back("interno");
  }

  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  if (!email || !password) return back("credenciais");

  // Cookies que o Supabase quer gravar — coletados aqui e anexados ao response.
  const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const cookieStore = await cookies();

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
  const res = NextResponse.redirect(new URL(ROLE_HOME[role], request.url), 303);
  for (const { name, value, options } of pending) res.cookies.set(name, value, options);
  return res;
}
