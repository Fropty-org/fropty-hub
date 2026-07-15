"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import { createClient } from "@/app/lib/supabase/browser";
import { sendMessage } from "@/app/actions/suporte";
import {
  Loader2, Image as ImageIcon, File, X, Lock, AlertCircle, Paperclip, Send,
  Bold, Italic, Strikethrough, Link2, List, ListOrdered, Clock, ChevronsUpDown, ChevronDown,
} from "lucide-react";
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
  /** "chat" = bolhas (padrão); "panel" = timeline lateral estilo Service Desk. */
  variant?:        "chat" | "panel";
  /** Nome + avatar por sender_id (mesma foto do perfil). */
  participants?:   Record<string, { name: string; avatarUrl: string | null }>;
}

import { User, Headphones } from "lucide-react";

// ── Mini-markdown seguro (negrito, itálico, tachado, link, listas) ──
// Escapa o HTML primeiro (anti-XSS) e só então aplica a formatação suportada
// pela barra do composer. Links restritos a http(s)/mailto.
function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function inlineFmt(s: string) {
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
    (_m, txt, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s.,!?)])/g, "$1<em>$2</em>");
  return s;
}
function formatRich(raw: string): string {
  const lines = escapeHtml(raw).split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const line of lines) {
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (ul) {
      if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; }
      out.push(`<li>${inlineFmt(ul[1])}</li>`);
    } else if (ol) {
      if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; }
      out.push(`<li>${inlineFmt(ol[1])}</li>`);
    } else {
      close();
      out.push(line.trim() === "" ? "" : `<div>${inlineFmt(line)}</div>`);
    }
  }
  close();
  return out.join("");
}

// Identidade visual de cada papel na conversa
const ROLE_META = {
  cliente: { fallback: "Cliente",       color: "var(--c-info)", Icon: User },
  equipe:  { fallback: "Equipe Fropty", color: "var(--primary)", Icon: Headphones },
};

export function TicketConversation({
  ticketId,
  initialMessages,
  currentUserId,
  currentUserName,
  ticketStatus,
  senderRole = "cliente",
  clientName,
  variant = "chat",
  participants,
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
          setMessages((prev) => {
            // Já presente (mesma id) → ignora.
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Reconcilia o eco otimista: remove a versão local (opt-*) do mesmo
            // autor/corpo para não duplicar quando o realtime traz a real.
            const withoutOpt = prev.filter(
              (m) => !(m.id.startsWith("opt-") && m.sender_id === newMsg.sender_id && m.body === newMsg.body)
            );
            return [...withoutOpt, newMsg];
          });
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

  // Envolve a seleção do textarea (ou insere marcador) — toolbar do composer "painel".
  function wrapSelection(before: string, after: string = before, linePrefix?: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? body.length;
    const end   = ta.selectionEnd ?? body.length;
    const sel   = body.slice(start, end);
    let next: string;
    if (linePrefix) {
      const block = (sel || "item").split("\n").map((l) => `${linePrefix}${l}`).join("\n");
      next = body.slice(0, start) + block + body.slice(end);
    } else {
      next = body.slice(0, start) + before + (sel || "texto") + after + body.slice(end);
    }
    setBody(next);
    requestAnimationFrame(() => ta.focus());
  }

  const fileInput = (
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
  );

  /* ── Variant "panel": timeline lateral (Service Desk) ── */
  if (variant === "panel") {
    const ToolBtn = ({ onClick, title, children, disabled }: { onClick?: () => void; title: string; children: React.ReactNode; disabled?: boolean }) => (
      <button type="button" title={title} onClick={onClick} disabled={disabled}
        style={{ width: 28, height: 28, borderRadius: 6, background: "none", border: "none", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)", opacity: disabled ? 0.4 : 1 }}>
        {children}
      </button>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
        <style>{`
          .rich-msg a { color: var(--primary); text-decoration: underline; }
          .rich-msg strong { font-weight: 700; color: var(--text); }
          .rich-msg em { font-style: italic; }
          .rich-msg del { opacity: 0.7; }
          .rich-msg ul, .rich-msg ol { margin: 4px 0; padding-left: 20px; }
          .rich-msg li { margin: 2px 0; }
          .rich-msg div:empty { display: none; }
        `}</style>
        {/* Timeline */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 22, padding: "4px 2px 16px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: "13px", padding: "24px 0" }}>
              Nenhuma ação registrada ainda.
            </div>
          )}
          {messages.map((msg) => {
            const isClienteMsg = msg.sender_role === "cliente";
            const meta = isClienteMsg ? ROLE_META.cliente : ROLE_META.equipe;
            const person = participants?.[msg.sender_id];
            const senderLabel = person?.name
              ?? (isClienteMsg
                ? (clientName ?? ROLE_META.cliente.fallback)
                : (currentUserName && msg.sender_id === currentUserId ? currentUserName : ROLE_META.equipe.fallback));
            const avatarUrl = person?.avatarUrl ?? null;
            const stamp = new Date(msg.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) +
              " • " + new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
            const atts = msg.attachments ?? [];
            return (
              <div key={msg.id} style={{ display: "flex", gap: 10, opacity: msg.id.startsWith("opt-") ? 0.7 : 1 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: `${meta.color}1f`, border: `1px solid ${meta.color}40`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt={senderLabel} referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    : <meta.Icon size={14} style={{ color: meta.color }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{senderLabel}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-faint)", flexShrink: 0 }}>{stamp}</span>
                  </div>
                  <div
                    className="rich-msg"
                    style={{ margin: "4px 0 0", fontSize: "13px", lineHeight: 1.55, color: "var(--text-muted)", wordBreak: "break-word" }}
                    dangerouslySetInnerHTML={{ __html: formatRich(msg.body) }}
                  />
                  {atts.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                      {atts.map((path) => {
                        const url = signedUrls[path];
                        const name = path.split("/").pop() ?? path;
                        const isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
                        return (
                          <a key={path} href={url ?? "#"} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", opacity: url ? 1 : 0.5 }}>
                            {isImg ? <ImageIcon size={13} /> : <File size={13} />}
                            {name.length > 30 ? name.slice(0, 27) + "…" : name}
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

        {/* Composer */}
        {isClosed ? (
          <div style={{ padding: "14px", textAlign: "center", fontSize: "13px", color: "var(--text-faint)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderTop: "1px solid var(--border)" }}>
            <Lock size={14} /> Este chamado está encerrado.
          </div>
        ) : (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            {error && (
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 5 }}>
                <AlertCircle size={14} /> {error}
              </p>
            )}
            {files.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: "4px 8px", fontSize: "11px", color: "var(--text-muted)" }}>
                    <File size={12} />
                    <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex" }}><X size={11} /></button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", overflow: "hidden" }}>
              {/* Toolbar */}
              <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "4px 6px", borderBottom: "1px solid var(--border)" }}>
                <ToolBtn title="Negrito" onClick={() => wrapSelection("**")}><Bold size={15} /></ToolBtn>
                <ToolBtn title="Itálico" onClick={() => wrapSelection("_")}><Italic size={15} /></ToolBtn>
                <ToolBtn title="Tachado" onClick={() => wrapSelection("~~")}><Strikethrough size={15} /></ToolBtn>
                <ToolBtn title="Link" onClick={() => wrapSelection("[", "](url)")}><Link2 size={15} /></ToolBtn>
                <ToolBtn title="Lista" onClick={() => wrapSelection("", "", "- ")}><List size={15} /></ToolBtn>
                <ToolBtn title="Lista numerada" onClick={() => wrapSelection("", "", "1. ")}><ListOrdered size={15} /></ToolBtn>
                <ToolBtn title="Anexar" onClick={() => fileInputRef.current?.click()} disabled={files.length >= 5}><Paperclip size={15} /></ToolBtn>
                <div style={{ flex: 1 }} />
                <ToolBtn title="Registrar tempo"><Clock size={15} /></ToolBtn>
                <ToolBtn title="Expandir"><ChevronsUpDown size={15} /></ToolBtn>
              </div>
              {fileInput}
              <textarea
                ref={textareaRef}
                value={body}
                onChange={autoResize}
                onKeyDown={handleKeyDown}
                placeholder="O que gostaria de registrar?"
                rows={2}
                disabled={isPending}
                style={{ width: "100%", background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "13.5px", fontFamily: "inherit", resize: "none", lineHeight: 1.5, padding: "12px 14px", minHeight: 56, boxSizing: "border-box" }}
              />
              {/* Rodapé: selecionar ação + enviar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 10px", borderTop: "1px solid var(--border)", background: "var(--surface-2)" }}>
                <button type="button" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)", cursor: "pointer", fontFamily: "inherit" }}>
                  Selecionar ação <ChevronDown size={13} />
                </button>
                <button onClick={handleSend} disabled={(!body.trim() && files.length === 0) || isPending}
                  title="Enviar"
                  style={{ width: 34, height: 34, borderRadius: 8, background: (body.trim() || files.length > 0) && !isPending ? "var(--primary)" : "var(--surface)", border: (body.trim() || files.length > 0) && !isPending ? "none" : "1px solid var(--border)", cursor: (body.trim() || files.length > 0) && !isPending ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
                  {isPending
                    ? <Loader2 size={15} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
                    : <Send size={15} style={{ color: (body.trim() || files.length > 0) ? "#fff" : "var(--text-faint)" }} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
              <meta.Icon size={13} style={{ color: meta.color }} />
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
                {isOpt && <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />}
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
                          {isImg ? <ImageIcon size={13} /> : <File size={13} />}
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
          <Lock size={14} />
          Este chamado está encerrado.
        </div>
      ) : (
        <div className="conv-reply" style={{ padding: "16px 20px" }}>
          {error && (
            <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={14} /> {error}
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
                  <File size={12} />
                  <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}
                  >
                    <X size={11} />
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
              <Paperclip size={16} />
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
              {isPending
                ? <Loader2 size={16} style={{ color: "#fff", animation: "spin 1s linear infinite" }} />
                : <Send size={16} style={{ color: (body.trim() || files.length > 0) ? "#fff" : "var(--text-faint)" }} />
              }
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
