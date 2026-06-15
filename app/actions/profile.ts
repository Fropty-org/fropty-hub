"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { requireAuth } from "@/app/lib/auth/require-role";

export async function updateAvatarUrl(url: string): Promise<void> {
  const userId = await requireAuth();
  if (!url || !url.startsWith("https://")) return;

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
