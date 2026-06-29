"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "@/app/actions/suporte";
import { CheckCircle, Paperclip, File, X, AlertCircle, Loader2, Send, ArrowDown, ArrowRight, ArrowUp, LucideIcon, Coins } from "lucide-react";
import { createClient } from "@/app/lib/supabase/browser";

interface Props {
  onClose?:  () => void;
  isAdmin?:  boolean;
  clients?:  { id: string; name: string }[];
}

const CATEGORIES = ["Bug / Erro", "Nova funcionalidade", "Dúvida", "Performance", "Outros"];

const PRIORITIES: { value: string; label: string; color: string; Icon: LucideIcon; desc: string; tokens: number }[] = [
  { value: "baixa", label: "Baixa",  color: "#94a3b8", Icon: ArrowDown,  desc: "Não urgente",      tokens: 5  },
  { value: "media", label: "Média",  color: "#EF9F27", Icon: ArrowRight, desc: "Impacto moderado", tokens: 10 },
  { value: "alta",  label: "Alta",   color: "#ef4444", Icon: ArrowUp,    desc: "Bloqueando uso",   tokens: 20 },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-bg)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: "13px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--text-muted)",
  marginBottom: 7,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function NewTicketForm({ onClose, isAdmin, clients }: Props) {
  const router                    = useRouter();
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [files,     setFiles]     = useState<File[]>([]);
  const [priority,  setPriority]  = useState("media");
  const [touched,   setTouched]   = useState({ subject: false, body: false });
  const [values,    setValues]    = useState({ subject: "", body: "" });
  const formRef                   = useRef<HTMLFormElement>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  // Em modo modal, onClose fecha. Em modo página, volta para a lista de chamados.
  function finish() {
    if (onClose) onClose();
    else { router.push("/portal/suporte"); router.refresh(); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const valid    = selected.filter((f) => f.size <= MAX_FILE_SIZE);
    const invalid  = selected.filter((f) => f.size > MAX_FILE_SIZE);
    if (invalid.length) setError(`${invalid.length} arquivo(s) muito grande(s) (máx 10 MB).`);
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ subject: true, body: true });
    if (!values.subject.trim() || !values.body.trim()) return;
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    fd.set("priority", priority);

    if (files.length > 0) {
      const supabase = createClient();
      // A policy do storage exige que o arquivo fique numa pasta com o uid do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Sessão expirada. Faça login novamente."); setLoading(false); return; }
      const paths: string[] = [];
      for (const file of files) {
        const ext  = file.name.split(".").pop() ?? "bin";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ticket-attachments")
          .upload(path, file, { upsert: false });
        if (uploadError) {
          setError(`Erro ao enviar arquivo "${file.name}".`);
          setLoading(false);
          return;
        }
        paths.push(path);
      }
      paths.forEach((p) => fd.append("attachments[]", p));
    }

    const result = await createTicket(fd);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(finish, 1800);
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: "50%",
          background: "rgba(34,197,94,0.12)",
          border: "1px solid rgba(34,197,94,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <CheckCircle size={30} style={{ color: "#22c55e" }} />
        </div>
        <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)", margin: "0 0 6px" }}>
          Chamado aberto!
        </p>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
          Nossa equipe responderá em até 24h.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Seletor de cliente — somente admin */}
      {isAdmin && clients && clients.length > 0 && (
        <div>
          <label style={labelStyle}>Cliente *</label>
          <select
            name="on_behalf_of"
            required
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <option value="">Selecione o cliente</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Assunto */}
      <div>
        <label style={labelStyle}>Assunto *</label>
        <input
          name="subject"
          placeholder="Descreva brevemente o problema"
          value={values.subject}
          onChange={(e) => setValues((v) => ({ ...v, subject: e.target.value }))}
          style={{ ...inputStyle, borderColor: touched.subject && !values.subject.trim() ? "#ef4444" : "var(--border)" }}
          onFocus={(e) => { if (!(touched.subject && !values.subject.trim())) e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => {
            setTouched((t) => ({ ...t, subject: true }));
            e.currentTarget.style.borderColor = !values.subject.trim() ? "#ef4444" : "var(--border)";
          }}
        />
        {touched.subject && !values.subject.trim() && (
          <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertCircle size={11} /> Campo obrigatório
          </p>
        )}
      </div>

      {/* Categoria */}
      <div>
        <label style={labelStyle}>Categoria</label>
        <select
          name="category"
          style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Prioridade */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Prioridade</label>
          {!isAdmin && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "11px", fontWeight: 700, color: "#EF9F27", background: "rgba(239,159,39,0.10)", border: "1px solid rgba(239,159,39,0.25)", borderRadius: 99, padding: "2px 10px" }}>
              <Coins size={11} />
              {PRIORITIES.find((p) => p.value === priority)?.tokens ?? 10} tokens
            </span>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              style={{
                padding: "10px 8px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: priority === p.value ? p.color : "var(--border)",
                background: priority === p.value ? `${p.color}14` : "var(--input-bg)",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s",
              }}
            >
              <p.Icon size={16} style={{ color: priority === p.value ? p.color : "var(--text-faint)" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: priority === p.value ? p.color : "var(--text-muted)" }}>
                {p.label}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text-faint)" }}>{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label style={labelStyle}>Descrição *</label>
        <textarea
          name="body"
          rows={4}
          placeholder="O que aconteceu? Quando ocorre? O que já tentou?"
          value={values.body}
          onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
          style={{ ...inputStyle, resize: "vertical", minHeight: 96, lineHeight: 1.6, borderColor: touched.body && !values.body.trim() ? "#ef4444" : "var(--border)" }}
          onFocus={(e) => { if (!(touched.body && !values.body.trim())) e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e) => {
            setTouched((t) => ({ ...t, body: true }));
            e.currentTarget.style.borderColor = !values.body.trim() ? "#ef4444" : "var(--border)";
          }}
        />
        {touched.body && !values.body.trim() && (
          <p style={{ margin: "5px 0 0", fontSize: "11.5px", color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertCircle size={11} /> Campo obrigatório
          </p>
        )}
      </div>

      {/* Anexos */}
      <div>
        <label style={labelStyle}>Anexos <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(máx 5 · 10 MB cada)</span></label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {files.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--input-bg)",
              border: "1px dashed var(--border)",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <Paperclip size={14} /> Adicionar arquivo
          </button>
        )}
        {files.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {files.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "7px 10px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <File size={14} style={{ flexShrink: 0, color: "var(--primary)" }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ color: "var(--text-faint)", flexShrink: 0, fontSize: "11px" }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "12px", color: "#ef4444" }}>{error}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        <button
          type="button"
          onClick={finish}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
            boxShadow: "0 4px 14px rgba(91,87,232,0.35)",
            transition: "opacity 0.15s",
          }}
        >
          {loading
            ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
            : <><Send size={16} /> Abrir chamado</>
          }
        </button>
      </div>
    </form>
  );
}
