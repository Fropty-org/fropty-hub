import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { UserRowActions } from "@/app/components/admin/UserRowActions";
import InviteForm from "./InviteForm";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Usuários "” Admin" };

const PAGE_SIZE = 20;

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
    <div style={{ padding: "40px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Usuários</h1>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
          {total ?? 0} usuário{(total ?? 0) !== 1 ? "s" : ""} · página {page} de {Math.max(1, totalPages)}
        </p>
      </div>

      {/* Invite form "” convidar novo cliente */}
      <InviteForm />

      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 180px 90px 130px 130px 80px 110px", padding: "12px 20px", borderBottom: "1px solid var(--border)", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 880 }}>
          <span>Nome / Email</span>
          <span>ID</span>
          <span>Role</span>
          <span>Plano</span>
          <span>Tokens</span>
          <span style={{ textAlign: "center" }}>Status</span>
          <span style={{ textAlign: "center" }}>Acesso</span>
        </div>

        {list.map((u, i) => (
          <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 180px 90px 130px 130px 80px 110px", padding: "14px 20px", borderBottom: i < list.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", gap: 8, minWidth: 880 }}>

            {/* Nome + email */}
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{u.name || ""”"}</p>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.email ?? ""}>{u.email ?? ""”"}</p>
            </div>

            {/* ID "” encurtado, com ID completo no hover */}
            <span
              title={u.id}
              style={{ fontSize: "11px", color: "var(--text-faint)", fontFamily: "monospace", cursor: "help", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {u.id.slice(0, 8)}…
            </span>

            {/* Role, Plano, Tokens, Status e Acesso (interativos, com confirmação) */}
            <UserRowActions
              userId={u.id}
              name={u.name ?? ""}
              role={u.role as "cliente" | "admin"}
              plan={(u.plan ?? "sem_plano") as "sem_plano" | "basico" | "pro"}
              tokenBalance={u.token_balance ?? 0}
              isActive={u.is_active !== false}
            />
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
              <ChevronLeft size={14} /> Anterior
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
              Próxima <ChevronRight size={14} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

