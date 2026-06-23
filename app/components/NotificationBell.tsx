"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createClient } from "@/app/lib/supabase/browser";
import type { Database } from "@/app/lib/supabase/types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

const TYPE_ICON: Record<string, string> = {
  ticket_opened:  "ti-ticket",
  ticket_updated: "ti-circle-check",
  ticket_message: "ti-message-circle",
  client_joined:  "ti-user-plus",
};

const TYPE_COLOR: Record<string, string> = {
  ticket_opened:  "#EF9F27",
  ticket_updated: "#22c55e",
  ticket_message: "#3b82f6",
  client_joined:  "#a855f7",
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return "agora";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]                   = useState(false);
  const [dropPos, setDropPos]             = useState({ top: 0, left: 0 });
  const btnRef                            = useRef<HTMLButtonElement>(null);
  const dropRef                           = useRef<HTMLDivElement>(null);
  const supabase                          = useMemo(() => createClient(), []);

  const unread = notifications.filter((n) => !n.read_at).length;

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (data) setNotifications(data);
  }, [userId, supabase]);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => setNotifications((prev) => [payload.new as Notification, ...prev].slice(0, 30))
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchNotifications, supabase]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropW = 320;
      const dropH = 420; // altura aproximada (header + lista)
      const left = Math.max(8, Math.min(rect.right - dropW, window.innerWidth - dropW - 8));
      // Abre para cima quando não há espaço abaixo (ex.: botão flutuante no rodapé)
      const openUp = rect.bottom + dropH > window.innerHeight;
      const top = openUp ? Math.max(8, rect.top - dropH - 8) : rect.bottom + 8;
      setDropPos({ top, left });
    }
    setOpen((o) => !o);
  }

  async function markRead(id: string, link: string | null) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setOpen(false);
    if (link) window.location.href = link;
  }

  async function markAllRead() {
    const ids = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        aria-label="Notificacoes"
        style={{
          position: "relative",
          width: 32, height: 32, borderRadius: 8,
          background: open ? "var(--surface-2)" : "transparent",
          border: "1px solid " + (open ? "var(--border)" : "transparent"),
          cursor: "pointer", color: "var(--text-muted)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.15s",
        }}
      >
        <i className="ti ti-bell" style={{ fontSize: 17 }} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            minWidth: 14, height: 14, borderRadius: 999,
            background: "#ef4444", color: "#fff",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1, padding: "0 3px", pointerEvents: "none",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown em position:fixed — não é cortado por overflow do sidebar */}
      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: 320,
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>
              Notificacoes{unread > 0 && <span style={{ color: "#ef4444", marginLeft: 4 }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ fontSize: "11px", color: "var(--text-faint)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                Marcar tudo lido
              </button>
            )}
          </div>

          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ padding: "28px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
                <i className="ti ti-bell-off" style={{ display: "block", fontSize: 22, marginBottom: 8 }} />
                Nenhuma notificacao
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id, n.link)}
                  style={{
                    display: "flex", gap: 12, padding: "11px 16px",
                    borderBottom: "1px solid var(--border)",
                    cursor: n.link ? "pointer" : "default",
                    background: n.read_at ? "transparent" : "rgba(239,159,39,0.04)",
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${TYPE_COLOR[n.type] ?? "#888"}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <i className={`ti ${TYPE_ICON[n.type] ?? "ti-bell"}`} style={{ fontSize: 14, color: TYPE_COLOR[n.type] ?? "#888" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: "12px", fontWeight: n.read_at ? 600 : 700, color: "var(--text)", display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-faint)", flexShrink: 0 }}>{timeAgo(n.created_at)}</span>
                    </p>
                    {n.body && (
                      <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</p>
                    )}
                  </div>
                  {!n.read_at && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0, alignSelf: "center" }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
