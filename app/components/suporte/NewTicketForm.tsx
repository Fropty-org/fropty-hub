"use client";

import { useState, useRef } from "react";
import { createTicket } from "@/app/actions/suporte";
import { createClient } from "@/app/lib/supabase/browser";

interface Project {
  id: string;
  name: string;
}

interface Props {
  projects: Project[];
  onClose: () => void;
}

const CATEGORIES = ["Bug / Erro", "Nova funcionalidade", "Dúvida", "Performance", "Outros"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-bg)",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function NewTicketForm({ projects, onClose }: Props) {
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [files,     setFiles]     = useState<File[]>([]);
  const formRef                   = useRef<HTMLFormElement>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

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
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    // Upload anexos para o Supabase Storage
    if (files.length > 0) {
      const supabase = createClient();
      const paths: string[] = [];
      for (const file of files) {
        const ext  = file.name.split(".").pop() ?? "bin";
        const path = `${crypto.randomUUID()}.${ext}`;
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
    setTimeout(onClose, 1800);
  }

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <i className="ti ti-circle-check" style={{ fontSize: 48, color: "#22c55e", display: "block", marginBottom: 12 }} />
        <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", margin: "0 0 4px" }}>
          Chamado aberto!
        </p>
        <p style={{ color: "var(--text-faint)", fontSize: "13px", margin: 0 }}>
          Nossa equipe responderá em breve.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
          Assunto *
        </label>
        <input
          name="subject"
          required
          placeholder="Descreva brevemente o problema"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
            Categoria
          </label>
          <select
            name="category"
            style={{ ...inputStyle, appearance: "none" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {projects.length > 0 && (
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
              Projeto (opcional)
            </label>
            <select
              name="project_id"
              style={{ ...inputStyle, appearance: "none" }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <option value="">Nenhum</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
          Descrição *
        </label>
        <textarea
          name="body"
          required
          rows={5}
          placeholder="Descreva o problema com detalhes — o que aconteceu, quando ocorre, o que já tentou..."
          style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)"; }}
        />
      </div>

      {/* Anexos */}
      <div>
        <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>
          Anexos (opcional · máx 5 arquivos · 10 MB cada)
        </label>
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
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <i className="ti ti-paperclip" /> Adicionar arquivo
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
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                <i className="ti ti-file" style={{ fontSize: 14, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>
                  {(f.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: 0, display: "flex", fontFamily: "inherit" }}
                >
                  <i className="ti ti-x" style={{ fontSize: 13 }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
          <i className="ti ti-alert-circle" /> {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onClose}
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
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            background: "var(--cta-bg)",
            color: "var(--cta-text)",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "inherit",
          }}
        >
          {loading
            ? <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} /> Enviando...</>
            : <><i className="ti ti-send" /> Abrir chamado</>
          }
        </button>
      </div>
    </form>
  );
}
