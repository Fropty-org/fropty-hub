"use client";

import { NotificationBell } from "@/app/components/NotificationBell";
import { PortalThemeToggle } from "@/app/components/cliente/PortalThemeToggle";

/**
 * Botões flutuantes (notificações + tema) fixos no canto inferior direito,
 * fora do sidebar — assim o dropdown de notificações tem espaço para abrir.
 */
export function PortalFloatingControls({ userId, initialTheme }: { userId: string; initialTheme: "dark" | "light" }) {
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        zIndex: 1500,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={fabStyle}><NotificationBell userId={userId} /></div>
      <div style={fabStyle}><PortalThemeToggle initialTheme={initialTheme} /></div>
    </div>
  );
}

const fabStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: "var(--card-bg)",
  border: "1px solid var(--card-border)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
