import { createClient } from "@/app/lib/supabase/server";

export interface AuditFilters {
  action?:  string;
  adminId?: string;
  from?:    string; // ISO date (yyyy-mm-dd)
  to?:      string;
  q?:       string;
  page?:    number;
  pageSize?: number;
}

export interface ResolvedAuditLog {
  id:          string;
  created_at:  string;
  action:      string;
  target_type: string | null;
  target_id:   string | null;
  metadata:    Record<string, unknown> | null;
  adminName:   string;
  targetName:  string | null;
}

export async function queryAuditLogs(
  filters: AuditFilters,
  opts: { paginate?: boolean } = { paginate: true },
): Promise<{ rows: ResolvedAuditLog[]; total: number }> {
  const supabase = await createClient();
  const pageSize = filters.pageSize ?? 30;
  const page     = Math.max(0, filters.page ?? 0);

  let query = supabase
    .from("admin_audit_log")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.action)  query = query.eq("action", filters.action);
  if (filters.adminId) query = query.eq("admin_id", filters.adminId);
  if (filters.from)    query = query.gte("created_at", `${filters.from}T00:00:00`);
  if (filters.to)      query = query.lte("created_at", `${filters.to}T23:59:59`);

  const usingSearch = !!filters.q?.trim();

  // Com busca textual (sobre nomes resolvidos/metadata) precisamos filtrar tudo
  // em memória, então não paginamos no banco nesse caso.
  if (opts.paginate && !usingSearch) {
    query = query.range(page * pageSize, page * pageSize + pageSize - 1);
  } else {
    query = query.limit(5000);
  }

  const { data, count } = await query;
  const logs = data ?? [];

  // Resolve nomes de admins e alvos em lote
  const adminIds   = [...new Set(logs.map((l) => l.admin_id).filter(Boolean))];
  const userIds    = [...new Set(logs.filter((l) => l.target_type === "user").map((l) => l.target_id).filter(Boolean))] as string[];

  const allProfileIds = [...new Set([...adminIds, ...userIds])];

  const profilesData = allProfileIds.length
    ? (await supabase.from("profiles").select("id, name").in("id", allProfileIds)).data ?? []
    : [];

  const profileMap = new Map(profilesData.map((p) => [p.id, p.name]));

  // Busca textual aplicada após resolução (cobre nome do alvo e metadata)
  const q = filters.q?.toLowerCase().trim();

  const rows: ResolvedAuditLog[] = logs.map((l) => {
    let targetName: string | null = null;
    if (l.target_type === "user") {
      targetName = (l.target_id && profileMap.get(l.target_id))
        ?? (l.metadata as Record<string, unknown> | null)?.name as string
        ?? (l.metadata as Record<string, unknown> | null)?.email as string
        ?? null;
    }
    return {
      id:          l.id,
      created_at:  l.created_at,
      action:      l.action,
      target_type: l.target_type,
      target_id:   l.target_id,
      metadata:    l.metadata as Record<string, unknown> | null,
      adminName:   profileMap.get(l.admin_id) ?? l.admin_id.slice(0, 8),
      targetName,
    };
  });

  if (!usingSearch) {
    return { rows, total: count ?? rows.length };
  }

  // Filtra por busca textual e pagina em memória
  const filtered = rows.filter((r) =>
    r.adminName.toLowerCase().includes(q!) ||
    (r.targetName?.toLowerCase().includes(q!) ?? false) ||
    r.action.toLowerCase().includes(q!) ||
    JSON.stringify(r.metadata ?? {}).toLowerCase().includes(q!));

  if (opts.paginate) {
    const start = page * pageSize;
    return { rows: filtered.slice(start, start + pageSize), total: filtered.length };
  }
  return { rows: filtered, total: filtered.length };
}

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
