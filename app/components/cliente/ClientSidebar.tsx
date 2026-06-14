"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ClientUser } from "../../lib/types/cliente";

interface Props {
  user: ClientUser;
  active: "dashboard" | "tokens";
}

const NAV = [
  { id: "dashboard", href: "/area-cliente/dashboard", icon: "ti-layout-dashboard", label: "Painel" },
  { id: "tokens",    href: "/area-cliente/tokens",    icon: "ti-coins",             label: "Tokens" },
];

export function ClientSidebar({ user }: Props) {
  const pathname = usePathname();

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
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, textDecoration: "none" }}>
        <Image src="/logo-icon.png" alt="Fropty Apps" width={26} height={26} className="rounded-md" />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
          Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
        </span>
      </Link>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "12px", background: "var(--surface-2)", borderRadius: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user.avatarInitials}
        </div>
        <div style={{ overflow: "hidden" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.name.split(" ")[0]}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Plano {user.plan === "pro" ? "Pro" : "Básico"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {NAV.map(({ id, href, icon, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={id}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 9,
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                background: isActive ? "rgba(91,87,232,0.15)" : "transparent",
                color: isActive ? "var(--primary)" : "var(--text-muted)",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <i className={`ti ${icon}`} style={{ fontSize: 16 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <Link
        href="/area-cliente"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          borderRadius: 9,
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--text-faint)",
          textDecoration: "none",
          marginTop: 8,
        }}
      >
        <i className="ti ti-logout" style={{ fontSize: 16 }} />
        Sair
      </Link>
    </aside>
  );
}
