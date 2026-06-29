"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminInviteClient } from "@/app/actions/admin";
import { SERVICES } from "@/app/lib/constants/services";
import {
  ArrowLeft, UserPlus, Mail, User, Phone, Loader2,
  CheckCircle, XCircle, CreditCard, Coins, Camera,
} from "lucide-react";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg,     setMsg]          = useState<{ ok: boolean; text: string } | null>(null);
  const [services, setServices]    = useState<Set<string>>(new Set());
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function toggleService(id: string) {
    setServices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    services.forEach(s => fd.append("services", s));

    if (avatarFile) fd.append("avatar_file", avatarFile);

    startTransition(async () => {
      const res = await adminInviteClient(fd);
      if (res.success) {
        setMsg({ ok: true, text: res.success });
        setTimeout(() => router.push("/admin/usuarios"), 1800);
      } else {
        setMsg({ ok: false, text: res.error ?? "Erro ao convidar." });
      }
    });
  }

  return (
    <div style={{ padding: "36px 32px", maxWidth: 780, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <Link
          href="/admin/usuarios"
          style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}
        >
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>Novo usuário</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>Convida um novo cliente por e-mail.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, overflow: "hidden" }}>

          {/* Avatar upload */}
          <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                onClick={() => fileRef.current?.click()}
                style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface-2)", border: avatarPreview ? "2px solid var(--primary)" : "2px dashed var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <User size={26} style={{ color: "var(--text-faint)" }} />}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "var(--primary)", border: "2px solid var(--card-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <Camera size={12} style={{ color: "#fff" }} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
            </div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Foto do usuário</p>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "var(--text-faint)", lineHeight: 1.5 }}>
                JPG, PNG ou WebP. Máx. 2 MB.
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
              >
                {avatarPreview ? "Trocar foto" : "Escolher foto"}
              </button>
            </div>
          </div>

          {/* Campos */}
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Nome + E-mail */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Nome completo" icon={<User size={13} />}>
                <input
                  name="name"
                  placeholder="João Silva"
                  style={inputStyle}
                />
              </Field>
              <Field label="E-mail *" icon={<Mail size={13} />}>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="joao@empresa.com"
                  style={inputStyle}
                />
              </Field>
            </div>

            {/* Telefone */}
            <Field label="Telefone" icon={<Phone size={13} />}>
              <input
                name="phone"
                placeholder="+5511999990000"
                style={{ ...inputStyle, maxWidth: 280 }}
              />
            </Field>

            {/* Plano + Tokens */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="Plano" icon={<CreditCard size={13} />}>
                <select name="plan" style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="sem_plano">Sem plano</option>
                  <option value="basico">Básico</option>
                  <option value="pro">Pro</option>
                </select>
              </Field>
              <Field label="Tokens iniciais" icon={<Coins size={13} />}>
                <input
                  name="token_balance"
                  type="number"
                  defaultValue={0}
                  min={0}
                  max={99999}
                  style={inputStyle}
                />
              </Field>
              <Field label="Início do contrato" icon={<span style={{ fontSize: 13 }}>📅</span>}>
                <input name="contract_start" type="date" style={inputStyle} />
              </Field>
            </div>

            {/* Serviços */}
            <div>
              <p style={labelStyle}>Serviços contratados</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {SERVICES.map(s => {
                  const on = services.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 999,
                        border: `1.5px solid ${on ? s.color : "var(--border)"}`,
                        background: on ? `${s.color}18` : "var(--surface-2)",
                        color: on ? s.color : "var(--text-muted)",
                        fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                    >
                      <s.Icon size={13} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              {msg && (
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: msg.ok ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
                  {msg.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  {msg.text}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/admin/usuarios" style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={pending}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 9, border: "none", background: pending ? "var(--surface-2)" : "var(--cta-bg)", color: pending ? "var(--text-muted)" : "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <UserPlus size={13} />}
                {pending ? "Enviando convite…" : "Convidar usuário"}
              </button>
            </div>
          </div>
        </div>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ color: "var(--text-faint)" }}>{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  padding: "9px 12px", borderRadius: 9,
  border: "1px solid var(--border)",
  background: "var(--surface)", color: "var(--text)",
  fontSize: "13px", fontFamily: "inherit", outline: "none",
};
