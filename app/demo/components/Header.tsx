"use client";

import { useEffect, useRef, useState } from "react";
import type { Role, Section } from "./data";
import type { Segment } from "../page";

type Props = {
  role: Role;
  activeSection: Section;
  notifCount: number;
  cartCount: number;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNotifications: () => void;
  onCart: () => void;
  onProfile: () => void;
  onLogout: () => void;
  sectionLabels: Record<Section, string>;
  onMenuOpen: () => void;
  segment?: Segment;
  onSwitchSegment?: (seg: Segment) => void;
};

export default function Header({
  role,
  activeSection,
  notifCount,
  cartCount,
  theme,
  onToggleTheme,
  onNotifications,
  onCart,
  onProfile,
  onLogout,
  sectionLabels,
  onMenuOpen,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const isAdmin = role === "admin";
  const avatarLetter = isAdmin ? "A" : "V";
  const avatarGradient = isAdmin
    ? "linear-gradient(135deg, #EF9F27, #e07b10)"
    : "linear-gradient(135deg, #5B57E8, #3f3cc0)";

  return (
    <>
      <style>{`
        @media (max-width: 479px) {
          .header-brand-text { display: none !important; }
          .header-separator { display: none !important; }
          .header-section-label { display: none !important; }
          .header-role-badge { display: none !important; }
        }
      `}</style>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          zIndex: 100,
          background: "var(--nav-bg)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        {/* Left side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
          {/* Hamburger */}
          <button
            onClick={onMenuOpen}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Abrir menu"
          >
            <i className="ti ti-menu-2" style={{ fontSize: 20 }} />
          </button>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "#5B57E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: "-0.5px",
              }}
            >
              F
            </div>
            <span
              className="header-brand-text"
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text)",
                letterSpacing: "-0.3px",
              }}
            >
              Fropty
            </span>
          </div>

          {/* Separator + section label */}
          <span
            className="header-separator"
            style={{ color: "var(--border)", fontSize: 18, userSelect: "none" }}
          >
            |
          </span>
          <span
            className="header-section-label"
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sectionLabels[activeSection]}
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Alternar tema"
          >
            <i className={`ti ${theme === "dark" ? "ti-sun" : "ti-moon"}`} style={{ fontSize: 16 }} />
          </button>

          {/* Cart */}
          <button
            onClick={onCart}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            aria-label="Carrinho"
          >
            <i className="ti ti-shopping-cart" style={{ fontSize: 16 }} />
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: "#EF9F27",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={onNotifications}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            aria-label="Notificações"
          >
            <i className="ti ti-bell" style={{ fontSize: 16 }} />
            {notifCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: "#e53e3e",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 3px",
                  lineHeight: 1,
                }}
              >
                {notifCount}
              </span>
            )}
          </button>

          {/* Role badge */}
          <span
            className="header-role-badge"
            style={{
              background: isAdmin ? "#EF9F27" : "#5B57E8",
              color: isAdmin ? "#000" : "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 999,
              letterSpacing: "0.4px",
              userSelect: "none",
            }}
          >
            {isAdmin ? "ADMIN" : "Visitante"}
          </span>

          {/* Avatar + dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: avatarGradient,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Menu do usuário"
            >
              {avatarLetter}
            </button>

            {dropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  minWidth: 160,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  zIndex: 200,
                }}
              >
                {[
                  { label: "Perfil", icon: "ti-user-circle", action: onProfile },
                  { label: "Configurações", icon: "ti-settings", action: onProfile },
                  { label: "Sair", icon: "ti-logout", action: onLogout },
                ].map(({ label, icon, action }, i) => (
                  <button
                    key={label}
                    onClick={() => {
                      setDropdownOpen(false);
                      action();
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "none",
                      border: "none",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                      color: label === "Sair" ? "#e53e3e" : "var(--text)",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <i className={`ti ${icon}`} style={{ fontSize: 16, opacity: 0.8 }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
