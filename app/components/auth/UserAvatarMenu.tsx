"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { ROLE_LABEL, type UserRole } from "@/app/lib/auth/roles";

interface Props {
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  plan?: "sem_plano" | "basico" | "pro" | null;
}

export function UserAvatarMenu({ name, email, initials, role, plan }: Props) {
  const [open, setOpen]       = useState(false);
  const [pending, startTrans] = useTransition();
  const containerRef          = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  const planLabel = plan === "pro" ? "Plano Pro" : plan === "basico" ? "Plano Básico" : "Sem plano";

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "8px 10px",
          cursor: "pointer",
          width: "100%",
          color: "var(--text)",
          fontFamily: "inherit",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            letterSpacing: "0.02em",
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, overflow: "hidden", textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name.split(" ")[0]}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
            {planLabel}
          </p>
        </div>
        <i
          className={`ti ${open ? "ti-chevron-up" : "ti-chevron-down"}`}
          style={{ fontSize: 14, color: "var(--text-faint)", flexShrink: 0 }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 12,
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          {/* Identidade */}
          <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{name}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", marginTop: 2 }}>{email}</p>
            <span
              style={{
                display: "inline-block",
                marginTop: 6,
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
                background: "rgba(91,87,232,0.15)",
                color: "var(--primary)",
              }}
            >
              {ROLE_LABEL[role]}
            </span>
          </div>

          {/* Sair */}
          <button
            onClick={() => {
              setOpen(false);
              startTrans(() => signOut());
            }}
            disabled={pending}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              width: "100%",
              background: "none",
              border: "none",
              cursor: pending ? "not-allowed" : "pointer",
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "inherit",
              opacity: pending ? 0.6 : 1,
            }}
          >
            <i className={`ti ${pending ? "ti-loader-2" : "ti-logout"}`} style={{ fontSize: 16 }} />
            {pending ? "Saindo..." : "Sair da conta"}
          </button>
        </div>
      )}
    </div>
  );
}
