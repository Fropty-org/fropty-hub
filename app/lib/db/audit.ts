import { createClient } from "@/app/lib/supabase/server";

export async function logAdminAction(opts: {
  adminId:     string;
  action:      string;
  targetType?: string;
  targetId?:   string;
  metadata?:   Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.from("admin_audit_log").insert({
      admin_id:    opts.adminId,
      action:      opts.action,
      target_type: opts.targetType ?? null,
      target_id:   opts.targetId   ?? null,
      metadata:    opts.metadata   ?? null,
    });
  } catch {
    // Auditoria nunca bloqueia o fluxo principal
  }
}
