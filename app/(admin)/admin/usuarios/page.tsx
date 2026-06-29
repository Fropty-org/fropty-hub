import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase/server";
import { BulkUsuariosClient } from "@/app/components/admin/BulkUsuariosClient";
import { ChevronLeft, ChevronRight, UserPlus, Users, UserCheck, UserX, ShieldCheck, Download, Upload, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Usuários — Admin" };

const PAGE_SIZE = 20;

interface Props {
  searchParams: Promise<{ page?: string; tab?: string; q?: string }>;
}

export default async function AdminUsuariosPage({ searchParams }: Props) {
  const { page: pageParam, tab = "todos", q = "" } = await searchParams;
  const page   = Math.max(1, parseInt(pageParam ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const supabase = await createClient();

  const [
    { count: total },
    { count: ativos },
    { count: inativos },
    { count: admins },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
  ]);

  let query = supabase
    .from("profiles")
    .select("id,name,email,role,plan,token_balance,is_active,phone_number,created_at")
    .order("created_at", { ascending: false });

  if (tab === "ativos")   query = query.eq("is_active", true);
  if (tab === "inativos") query = query.eq("is_active", false);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);

  const [{ data: usersFiltered }, { count: filteredTotal }] = await Promise.all([
    query.range(offset, offset + PAGE_SIZE - 1),
    (async () => {
      let cq = supabase.from("profiles").select("*", { count: "exact", head: true });
      if (tab === "ativos")   cq = cq.eq("is_active", true);
      if (tab === "inativos") cq = cq.eq("is_active", false);
      if (q) cq = cq.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
      return cq;
    })(),
  ]);

  const list       = usersFiltered ?? [];
  const totalPages = Math.ceil((filteredTotal ?? 0) / PAGE_SIZE);

  const stats = [
    { label: "Total de Usuários", value: total ?? 0,    icon: <Users size={16} />,      color: "#6366f1", bg: "rgba(99,102,241,0.10)" },
    { label: "Usuários Ativos",   value: ativos ?? 0,   icon: <UserCheck size={16} />,  color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
    { label: "Bloqueados",        value: inativos ?? 0, icon: <UserX size={16} />,      color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
    { label: "Administradores",   value: admins ?? 0,   icon: <ShieldCheck size={16} />,color: "#f97316", bg: "rgba(249,115,22,0.10)" },
  ];

  const TABS = [
    { id: "todos",    label: "Todos",      count: total ?? 0 },
    { id: "ativos",   label: "Ativos",     count: ativos ?? 0 },
    { id: "inativos", label: "Bloqueados", count: inativos ?? 0 },
  ];

  function tabHref(t: string) {
    const p = new URLSearchParams();
    if (t !== "todos") p.set("tab", t);
    if (q) p.set("q", q);
    const s = p.toString();
    return `/admin/usuarios${s ? `?${s}` : ""}`;
  }

  return (
    <div style={{ padding: "24px 24px", maxWidth: 1400, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 2px", color: "var(--text)", letterSpacing: "-0.02em" }}>Usuários</h1>
          <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-faint)" }}>
            Gerencie contas, planos e acessos do ecossistema.
          </p>
        </div>
        <Link
          href="/admin/usuarios/novo"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "12.5px", fontWeight: 700, textDecoration: "none", flexShrink: 0 }}
        >
          <UserPlus size={13} /> + Novo Usuário
        </Link>
      </div>

      {/* Stats cards — compactos, sem bordas grossas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: "0 0 1px", fontSize: "10.5px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
              <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.1 }}>{s.value.toLocaleString("pt-BR")}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, overflow: "hidden" }}>

        {/* Toolbar: tabs + search + actions */}
        <div style={{ padding: "0 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <Link
                  key={t.id}
                  href={tabHref(t.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "12px 14px", fontSize: "12.5px", fontWeight: active ? 700 : 500,
                    color: active ? "var(--text)" : "var(--text-muted)",
                    borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
                    textDecoration: "none", transition: "color 0.15s", whiteSpace: "nowrap",
                  }}
                >
                  {t.label}
                  <span style={{ fontSize: "10.5px", fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: active ? "rgba(99,102,241,0.12)" : "var(--surface-2)", color: active ? "var(--primary)" : "var(--text-faint)" }}>
                    {t.count}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Search + Import/Export + Filter */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 0" }}>
            <form method="GET" action="/admin/usuarios" style={{ display: "flex" }}>
              {tab !== "todos" && <input type="hidden" name="tab" value={tab} />}
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Buscar…"
                  style={{ paddingLeft: 28, paddingRight: 10, paddingTop: 6, paddingBottom: 6, borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", fontSize: "12.5px", fontFamily: "inherit", outline: "none", width: 200 }}
                />
              </div>
            </form>

            {/* Import / Export split button */}
            <div style={{ display: "inline-flex", borderRadius: 7, border: "1px solid var(--border)", overflow: "hidden" }}>
              <button style={actionBtn}><Upload size={12} /><span>Importar</span></button>
              <div style={{ width: 1, background: "var(--border)" }} />
              <button style={actionBtn}><Download size={12} /><span>Exportar</span></button>
            </div>

            {/* Filter */}
            <button style={{ ...actionBtn, border: "1px solid var(--border)", borderRadius: 7, padding: "5px 10px", gap: 5 }}>
              <SlidersHorizontal size={12} />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <BulkUsuariosClient
          users={list.map(u => ({
            id:            u.id,
            name:          u.name ?? null,
            email:         u.email ?? null,
            role:          (u.role as "cliente" | "admin"),
            plan:          ((u.plan ?? "sem_plano") as "sem_plano" | "basico" | "pro"),
            token_balance: u.token_balance ?? 0,
            is_active:     u.is_active !== false,
            phone:         u.phone_number ?? null,
            created_at:    u.created_at ?? null,
          }))}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-faint)" }}>
              Página {page} de {totalPages} · {filteredTotal ?? 0} resultado{(filteredTotal ?? 0) !== 1 ? "s" : ""}
            </span>
            <div style={{ display: "flex", gap: 5 }}>
              {page > 1 && (
                <Link href={`/admin/usuarios?page=${page - 1}${tab !== "todos" ? `&tab=${tab}` : ""}${q ? `&q=${q}` : ""}`} style={paginBtn}>
                  <ChevronLeft size={12} /> Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/usuarios?page=${page + 1}${tab !== "todos" ? `&tab=${tab}` : ""}${q ? `&q=${q}` : ""}`} style={paginBtn}>
                  Próxima <ChevronRight size={12} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5,
  padding: "5px 10px", background: "var(--surface)", color: "var(--text-muted)",
  border: "none", fontSize: "12px", fontWeight: 600, cursor: "pointer",
  fontFamily: "inherit", whiteSpace: "nowrap",
};

const paginBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 12px", borderRadius: 7, border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text-muted)", fontSize: "11.5px",
  fontWeight: 600, textDecoration: "none",
};
