"use client";

export type ToastState = { visible: boolean; message?: string; color?: string };

export function Toast({ message, visible, color = "#22c55e" }: { message?: string; visible: boolean; color?: string }) {
  return (
    <div style={{
      position: "absolute", bottom: 20, left: 12, right: 12,
      background: "#181490", color: "#fff",
      borderRadius: 12, padding: "10px 14px",
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 12, fontWeight: 500,
      transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
      opacity: visible ? 1 : 0,
      pointerEvents: "none",
      zIndex: 100,
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {message}
    </div>
  );
}
