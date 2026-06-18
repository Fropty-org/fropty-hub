"use client";

import { useRef, useState, useTransition } from "react";
import { AvatarUpload } from "@/app/components/cliente/AvatarUpload";
import { updateProfile } from "@/app/actions/profile";

interface Props {
  userId:     string;
  name:       string;
  email:      string;
  avatarUrl:  string | null;
  initials:   string;
}

export default function ProfileForm({ userId, name, email, avatarUrl, initials }: Props) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg]                = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef                      = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfile(fd);
      if (result.success) setMsg({ type: "success", text: result.success });
      else                setMsg({ type: "error",   text: result.error ?? "Erro desconhecido." });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Avatar */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "28px 28px 24px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
          <i className="ti ti-photo" style={{ marginRight: 8 }} />
          Foto de perfil
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <AvatarUpload userId={userId} currentUrl={avatarUrl} initials={initials} size={72} />
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Clique na imagem para alterar</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>JPG, PNG, WebP ou GIF · máx. 2 MB</p>
          </div>
        </div>
      </div>

      {/* Dados pessoais */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "28px 28px 24px" }}>
        <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
          <i className="ti ti-user" style={{ marginRight: 8 }} />
          Dados pessoais
        </h2>
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Nome completo
            </label>
            <input
              type="text"
              name="name"
              defaultValue={name}
              required
              maxLength={100}
              placeholder="Seu nome"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text)", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              readOnly
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text-muted)", padding: "10px 14px", fontSize: "14px", fontFamily: "inherit", outline: "none", cursor: "not-allowed", opacity: 0.7 }}
            />
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>O e-mail não pode ser alterado aqui.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button
              type="submit"
              disabled={isPending}
              style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: "#185FA5", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isPending ? 0.7 : 1 }}
            >
              <i className="ti ti-device-floppy" style={{ marginRight: 6 }} />
              {isPending ? "Salvando…" : "Salvar alterações"}
            </button>
            {msg && (
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: msg.type === "success" ? "#22c55e" : "#ef4444" }}>
                <i className={`ti ${msg.type === "success" ? "ti-circle-check" : "ti-circle-x"}`} style={{ marginRight: 5 }} />
                {msg.text}
              </p>
            )}
          </div>
        </form>
      </div>

    </div>
  );
}
