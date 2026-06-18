import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { adminCreditTokens, adminUpdateUserRole } from "@/app/actions/admin";

export const metadata: Metadata = { title: "Usuários — Admin" };

const PAGE_SIZE = 20;

const PLAN_LABEL: Record<string, string> = {
  sem_plano: "Sem plano",
  basico:    "Básico",
  pro:       "Pro",
};

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
    <div style={{ padding: "40px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Usuários</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {total ?? 0} usuário{(total ?? 0) !== 1 ? "s" : ""} · página {page} de {Math.max(1, totalPages)}
        </p>
      </div>

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 110px 220px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <span>Nome</span>
          <span>Role</span>
          <span>Plano</span>
          <span style={{ textAlign: "right" }}>Tokens</span>
          <span style={{ textAlign: "center" }}>Ações</span>
        </div>

        {list.map((u, i) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 110px 220px", padding: "14px 20px", borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", gap: 8 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{u.name}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>{u.id.slice(0, 8)}…</p>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: `${ROLE_COLOR[u.role]}15`, color: ROLE_COLOR[u.role], border: `1px solid ${ROLE_COLOR[u.role]}30`, display: "inline-block" }}>
              {u.role}
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{PLAN_LABEL[u.plan ?? "sem_plano"] ?? "—"}</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", textAlign: "right" }}>{u.token_balance ?? 0}</span>

            {/* Ações */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {/* Creditar tokens */}
              <form action={adminCreditTokens}>
                <input type="hidden" name="user_id" value={u.id} />
                <input type="hidden" name="amount" value="1" />
                <input type="hidden" name="description" value="Crédito admin" />
                <button type="submit" title="Creditar 1 token" style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  <i className="ti ti-plus" /> Token
                </button>
              </form>
              {/* Mudar role */}
              <form action={adminUpdateUserRole} style={{ display: "flex", gap: 4 }}>
                <input type="hidden" name="user_id" value={u.id} />
                <select name="role" defaultValue={u.role} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7, color: "var(--text)", padding: "4px 6px", fontSize: "11px", fontFamily: "inherit", cursor: "pointer" }}>
                  <option value="cliente">cliente</option>
                  <option value="admin">admin</option>
                </select>
                <button type="submit" style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  OK
                </button>
              </form>
            </div>
          </div>
        ))}

        {list.length === 0 && <p style={{ padding: "32px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>Nenhum usuário ainda.</p>}
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
