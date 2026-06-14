"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email    = (formData.get("email")    as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!email || !password) {
    return { error: "Preencha email e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email ou senha incorretos." };
  }

  redirect("/area-cliente/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/area-cliente");
}
