"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/browser";
import { sendMessage } from "@/app/actions/suporte";
import type { Database } from "@/app/lib/supabase/types";
import type { TicketStatus } from "@/app/lib/types/cliente";

type MessageRow = Database["public"]["Tables"]["ticket_messages"]["Row"];

interface Props {
  ticketId:        string;
  initialMessages: MessageRow[];
  currentUserId:   string;
  currentUserName: string;
  ticketStatus:    TicketStatus;
  senderRole?:     "cliente" | "admin";
  clientName?:     string;
}

// Identidade visual de cada papel na conversa
const ROLE_META = {
  cliente: { fallback: "Cliente",       color: "#3b82f6", icon: "ti-user" },
  equipe:  { fallback: "Equipe Fropty", color: "var(--primary)", icon: "ti-headset" },
};

export function TicketConversation({
  ticketId,
  initialMessages,
  currentUserId,
  currentUserName,
  ticketStatus,
  senderRole = "cliente",
  clientName,
}: Props) {
  const [messages,    setMessages]    = useState<MessageRow[]>(initialMessages);
  const [body,        setBody]        = useState("");
  const [error,       setError]       = useState("");
  const [files,       setFiles]       = useState<File[]>([]);
  const [signedUrls,  setSignedUrls]  = useState<Record<string, string>>({});
  const [isPending, startTransition]  = useTransition();
  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fechado trava para todos. "Aguardando validação" (resolvido) trava só para
  // o cliente — ele deve avaliar a solução, não conversar; o analista ainda pode comentar.
  const isClosed     = ticketStatus === "fechado" || (senderRole === "cliente" && ticketStatus === "resolvido");

  // Gera signed URLs para attachments exibidos
  const resolveSignedUrls = useCallback(async (paths: string[]) => {
    const toResolve = paths.filter((p) => !signedUrls[p]);
    if (toResolve.length === 0) return;
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("ticket-attachments")
      .createSignedUrls(toResolve, 3600);
    if (data) {
      setSignedUrls((prev) => {
        const next = { ...prev };
        data.forEach((item) => { if (item.signedUrl && item.path) next[item.path] = item.signedUrl; });
        return next;
      });
    }
  }, [signedUrls]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Resolve signed URLs para attachments
  useEffect(() => {
    const allPaths = messages.flatMap((m) => m.attachments ?? []);
    if (allPaths.length > 0) resolveSignedUrls(allPaths);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`ticket_messages:${ticketId}`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "ticket_messages",
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          // Evita duplicar mensagem enviada pelo próprio cliente (já adicionada otimisticamente)
          setMessages((prev) =>
            prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  async function handleSend() {
    const trimmed = body.trim();
    if ((!trimmed && files.length === 0) || isPending) return;

    setError("");

    // Upload de arquivos antes do envio
    let uploadedPaths: string[] = [];
    if (files.length > 0) {
      const supabase = createClient();
      const paths: string[] = [];
      for (const file of files) {
        const ext  = file.name.split(".").pop() ?? "bin";
        const path = `${ticketId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("ticket-attachments")
          .upload(path, file, { upsert: false });
        if (uploadErr) { setError(`Erro ao enviar "${file.name}".`); return; }
        paths.push(path);
      }
      uploadedPaths = paths;
      setFiles([]);
    }

    // Mensagem otimista
    const optimistic: MessageRow = {
      id:          `opt-${Date.now()}`,
      ticket_id:   ticketId,
      sender_id:   currentUserId,
      sender_role: senderRole,
      body:        trimmed || "📎",
      attachments: uploadedPaths,
      created_at:  new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setBody("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const fd = new FormData();
    fd.append("ticket_id", ticketId);
    fd.append("body", trimmed || "📎");
    fd.append("sender_role", senderRole);
    uploadedPaths.forEach((p) => fd.append("attachments[]", p));

    startTransition(async () => {
      const result = await sendMessage(fd);
      if (result?.error) {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(result.error);
        setBody(trimmed);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoResize(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBody(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
    <style>{`
      @media (max-width: 640px) {
        .conv-messages { padding: 14px !important; gap: 12px !important; max-height: 60vh !important; }
        .conv-reply { padding: 12px !important; }
        .conv-bubble { max-width: 90% !important; font-size: 13px !important; }
      }
    `}</style>
      {/* Thread de mensagens */}
      <div
        className="conv-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minHeight: 300,
          maxHeight: 520,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: "13px", padding: "32px 0" }}>
            Nenhuma mensagem ainda.
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          const isOpt = msg.id.startsWith("opt-");
          // Papel identifica claramente cliente vs equipe, independente de quem visualiza
          const isClienteMsg = msg.sender_role === "cliente";
          const meta = isClienteMsg ? ROLE_META.cliente : ROLE_META.equipe;
          const senderLabel = isClienteMsg
            ? (clientName?.split(" ")[0] ?? ROLE_META.cliente.fallback)
            : ROLE_META.equipe.fallback;
          const time = new Date(msg.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit", minute: "2-digit",
          });

          const avatar = (
            <div style={{
              width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
              background: `${meta.color}1f`, border: `1px solid ${meta.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <i className={`ti ${meta.icon}`} style={{ fontSize: 13, color: meta.color }} />
            </div>
          );

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isMe ? "flex-end" : "flex-start",
                opacity: isOpt ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {/* Avatar + nome + hora */}
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-faint)",
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexDirection: isMe ? "row-reverse" : "row",
                }}
              >
                {avatar}
                <span style={{ fontWeight: 700, color: meta.color }}>{senderLabel}</span>
                <span>{time}</span>
                {isOpt && <i className="ti ti-loader-2" style={{ fontSize: 11, animation: "spin 1s linear infinite" }} />}
              </div>

              {/* Bubble */}
              <div
                className="conv-bubble"
                style={{
                  maxWidth: "76%",
                  padding: "10px 14px",
                  borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: isMe ? "var(--primary)" : "var(--surface)",
                  color: isMe ? "#fff" : "var(--text)",
                  fontSize: "14px",
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  border: isMe ? "none" : "1px solid var(--border)",
                }}
              >
                {msg.body}
                {/* Attachments */}
                {(msg.attachments ?? []).length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                    {(msg.attachments ?? []).map((path) => {
                      const url  = signedUrls[path];
                      const name = path.split("/").pop() ?? path;
                      const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
                      return (
                        <a
                          key={path}
                          href={url ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: "12px",
                            fontWeight: 600,
                            color: isMe ? "rgba(255,255,255,0.85)" : "var(--primary)",
                            textDecoration: "none",
                            opacity: url ? 1 : 0.5,
                          }}
                        >
                          <i className={`ti ${isImg ? "ti-photo" : "ti-file"}`} style={{ fontSize: 13 }} />
                          {name.length > 28 ? name.slice(0, 25) + "…" : name}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Divisor */}
      <div style={{ height: 1, background: "var(--border)" }} />

      {/* Área de reply */}
      {isClosed ? (
        <div
          style={{
            padding: "16px 24px",
            textAlign: "center",
            fontSize: "13px",
            color: "var(--text-faint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <i className="ti ti-lock" />
          Este chamado está encerrado.
        </div>
      ) : (
        <div className="conv-reply" style={{ padding: "16px 20px" }}>
          {error && (
            <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
              <i className="ti ti-alert-circle" /> {error}
            </p>
          )}

          {/* Arquivos selecionados */}
          {files.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {files.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 7,
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                  }}
                >
                  <i className="ti ti-file" style={{ fontSize: 12 }} />
                  <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}
                  >
                    <i className="ti ti-x" style={{ fontSize: 11 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "8px 8px 8px 14px",
            }}
          >
            {/* Botão de anexo */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,video/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []).filter((f) => f.size <= 10 * 1024 * 1024);
                setFiles((prev) => [...prev, ...selected].slice(0, 5));
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending || files.length >= 5}
              title="Anexar arquivo"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-faint)",
                flexShrink: 0,
                opacity: files.length >= 5 ? 0.4 : 1,
              }}
            >
              <i className="ti ti-paperclip" style={{ fontSize: 16 }} />
            </button>

            <textarea
              ref={textareaRef}
              value={body}
              onChange={autoResize}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem… (Enter para enviar, Shift+Enter para nova linha)"
              rows={1}
              disabled={isPending}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--text)",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                lineHeight: 1.5,
                padding: "4px 0",
                minHeight: 28,
              }}
            />
            <button
              onClick={handleSend}
              disabled={(!body.trim() && files.length === 0) || isPending}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: (body.trim() || files.length > 0) && !isPending ? "var(--primary)" : "var(--surface-2)",
                border: "none",
                cursor: (body.trim() || files.length > 0) && !isPending ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.15s",
              }}
            >
              <i
                className={`ti ${isPending ? "ti-loader-2" : "ti-send"}`}
                style={{
                  fontSize: 16,
                  color: (body.trim() || files.length > 0) && !isPending ? "#fff" : "var(--text-faint)",
                  animation: isPending ? "spin 1s linear infinite" : "none",
                }}
              />
            </button>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
            Enter para enviar · Shift+Enter para nova linha
          </p>
        </div>
      )}
    </div>
  );
}
