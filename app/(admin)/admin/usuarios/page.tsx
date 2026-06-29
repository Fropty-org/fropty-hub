import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { BulkUsuariosClient } from "@/app/components/admin/BulkUsuariosClient";
import { CSVExportButton } from "@/app/components/ui/CSVExportButton";
import InviteForm from "./InviteForm";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Usuários — Admin" };

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
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text)" }}>Usuários</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)" }}>
            {total ?? 0} usuário{(total ?? 0) !== 1 ? "s" : ""} · página {page} de {Math.max(1, totalPages)}
          </p>
        </div>
        <CSVExportButton
          data={list as unknown as Record<string, unknown>[]}
          columns={[
            { key: "name",          label: "Nome" },
            { key: "email",         label: "Email" },
            { key: "role",          label: "Role" },
            { key: "plan",          label: "Plano" },
            { key: "token_balance", label: "Tokens" },
            { key: "is_active",     label: "Ativo" },
            { key: "created_at",    label: "Criado em" },
          ]}
          filename="usuarios.csv"
        />
      </div>

      {/* Invite form — convidar novo cliente */}
      <InviteForm />

      <BulkUsuariosClient
        users={list.map((u) => ({
          id:            u.id,
          name:          u.name ?? null,
          email:         u.email ?? null,
          role:          (u.role as "cliente" | "admin"),
          plan:          ((u.plan ?? "sem_plano") as "sem_plano" | "basico" | "pro"),
          token_balance: u.token_balance ?? 0,
          is_active:     u.is_active !== false,
        }))}
      />

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

