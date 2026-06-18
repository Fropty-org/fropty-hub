"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth/require-role";

export async function updateAvatarUrl(url: string): Promise<void> {
  const userId = await requireAuth();
  const storageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/`;
  if (!url || !url.startsWith(storageBase)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);

  revalidatePath("/portal");
  revalidatePath("/portal/dashboard");
}

export async function updateTheme(theme: "dark" | "light"): Promise<void> {
  const userId = await requireAuth();
  if (theme !== "dark" && theme !== "light") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ theme }).eq("id", userId);
}
