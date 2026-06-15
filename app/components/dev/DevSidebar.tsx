"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";

const NAV = [
  { id: "tasks",    href: "/dev/tasks",    icon: "ti-inbox",            label: "Fila de Tickets" },
  { id: "projetos", href: "/dev/projetos", icon: "ti-layout-kanban",    label: "Projetos" },
];

interface Props {
  name: string;
  initials: string;
  initialTheme?: "dark" | "light";
}

export function DevSidebar({ name, initials, initialTheme = "dark" }: Props) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <aside
      style={{
        width: 220,
        minHeight: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        flexShrink: 0,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
        <Image src="/logo-icon.png" alt="Fropty" width={26} height={26} className="rounded-md" />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Dev</span>
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "12px", background: "var(--surface-2)", borderRadius: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name.split(" ")[0]}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "#22c55e" }}>Desenvolvedor</p>
        </div>
        <PortalThemeToggle initialTheme={initialTheme} />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map(({ id, href, icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={id} href={href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, fontSize: "13px", fontWeight: 600, textDecoration: "none", background: isActive ? "rgba(34,197,94,0.12)" : "transparent", color: isActive ? "#22c55e" : "var(--text-muted)", transition: "background 0.15s, color 0.15s" }}>
              <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => startTransition(async () => {
          const result = await signOut();
          if (result?.redirectTo) window.location.href = result.redirectTo;
        })}
        disabled={pending}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 9, fontSize: "13px", fontWeight: 600, color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", opacity: pending ? 0.6 : 1, marginTop: 8, fontFamily: "inherit", width: "100%", textAlign: "left" }}
      >
        <i className={`ti ${pending ? "ti-loader-2" : "ti-logout"}`} style={{ fontSize: 16 }} />
        {pending ? "Saindo..." : "Sair"}
      </button>
    </aside>
  );
}
