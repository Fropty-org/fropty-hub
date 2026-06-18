import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { adminCreditTokens, adminUpdateUserRole, adminRevokeAccess, adminRestoreAccess, adminSetTokenBalance, adminUpdateUserPlan } from "@/app/actions/admin";
import InviteForm from "./InviteForm";

export const metadata: Metadata = { title: "Usuários — Admin" };

const PAGE_SIZE = 20;

const ROLE_COLOR: Record<string, string> = {
  cliente: "#3b82f6",
  admin:   "#EF9F27",
};

interface Props { searchParams: Promise<{ page?: string }> }

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page    = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset  = (page - 1) * PAGE_SIZE;
  const supabase = await createClient();

  const [{ data: users }, { count: total }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),
  ]);

  const list      = users ?? [];
  const totalPages = Math.ceil((total ?? 0) / PAGE_SIZE);

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Usuários</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {total ?? 0} usuário{(total ?? 0) !== 1 ? "s" : ""} · página {page} de {Math.max(1, totalPages)}
        </p>
      </div>

      {/* Invite form — convidar novo cliente */}
      <InviteForm />

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 180px 90px 130px 130px 80px 90px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 860 }}>
          <span>Nome / Email</span>
          <span>ID</span>
          <span>Role</span>
          <span>Plano</span>
          <span>Tokens</span>
          <span style={{ textAlign: "center" }}>Status</span>
          <span style={{ textAlign: "center" }}>Acesso</span>
        </div>

        {list.map((u, i) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 180px 90px 130px 130px 80px 90px", padding: "14px 20px", borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", gap: 8, minWidth: 860 }}>

            {/* Nome + email */}
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{u.name || "—"}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.email ?? ""}>{u.email ?? "—"}</p>
            </div>

            {/* ID curto */}
            <span style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace" }}>{u.id.slice(0, 8)}…</span>

            {/* Role */}
            <form action={adminUpdateUserRole} style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <input type="hidden" name="user_id" value={u.id} />
              <select name="role" defaultValue={u.role} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: ROLE_COLOR[u.role] ?? "var(--text)", padding: "4px 5px", fontSize: "11px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", width: "100%" }}>
                <option value="cliente">cliente</option>
                <option value="admin">admin</option>
              </select>
              <button type="submit" title="Salvar role" style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>✓</button>
            </form>

            {/* Plano */}
            <form action={adminUpdateUserPlan} style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <input type="hidden" name="user_id" value={u.id} />
              <select name="plan" defaultValue={u.plan ?? "sem_plano"} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 5px", fontSize: "11px", fontFamily: "inherit", cursor: "pointer", width: "100%" }}>
                <option value="sem_plano">Sem plano</option>
                <option value="basico">Básico</option>
                <option value="pro">Pro</option>
              </select>
              <button type="submit" title="Salvar plano" style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>✓</button>
            </form>

            {/* Tokens — set direto + crédito rápido */}
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <form action={adminSetTokenBalance} style={{ display: "flex", gap: 2, flex: 1 }}>
                <input type="hidden" name="user_id" value={u.id} />
                <input type="number" name="balance" defaultValue={u.token_balance ?? 0} min={0} max={99999} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 6px", fontSize: "12px", fontWeight: 700, fontFamily: "inherit", width: "70px" }} />
                <button type="submit" title="Definir saldo" style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "10px", cursor: "pointer", fontFamily: "inherit" }}>✓</button>
              </form>
              <form action={adminCreditTokens}>
                <input type="hidden" name="user_id" value={u.id} />
                <input type="hidden" name="amount" value="1" />
                <input type="hidden" name="description" value="Crédito admin" />
                <button type="submit" title="Adicionar 1 token" style={{ padding: "4px 7px", borderRadius: 6, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+1</button>
              </form>
            </div>

            {/* Status badge */}
            <span style={{ textAlign: "center" }}>
              {u.is_active !== false ? (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)", display: "inline-block" }}>Ativo</span>
              ) : (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", display: "inline-block" }}>Revogado</span>
              )}
            </span>

            {/* Revogar / Restaurar */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              {u.role !== "admin" && (
                u.is_active !== false ? (
                  <form action={adminRevokeAccess}>
                    <input type="hidden" name="user_id" value={u.id} />
                    <button type="submit" title="Revogar acesso" style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <i className="ti ti-ban" />
                    </button>
                  </form>
                ) : (
                  <form action={adminRestoreAccess}>
                    <input type="hidden" name="user_id" value={u.id} />
                    <button type="submit" title="Restaurar acesso" style={{ padding: "5px 9px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      <i className="ti ti-rotate" />
                    </button>
                  </form>
                )
              )}
            </div>
          </div>
        ))}

        {list.length === 0 && <p style={{ padding: "32px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum usuário ainda.</p>}
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {page > 1 && (
            <Link
              href={`/admin/usuarios?page=${page - 1}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }} /> Anterior
            </Link>
          )}
          <span style={{ fontSize: "13px", color: "var(--text-faint)", padding: "0 8px" }}>
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/usuarios?page=${page + 1}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
            >
              Próxima <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
