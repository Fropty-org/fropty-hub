"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile, uploadAvatar } from "@/app/actions/profile";
import { createClient } from "@/app/lib/supabase/browser";
import PasswordChangeForm from "@/app/components/cliente/PasswordChangeForm";
import Image from "next/image";
import {
  User, Bell, Lock, Shield, AlertTriangle, Check, X, Loader2,
  Camera, Copy, CheckCircle, QrCode,
} from "lucide-react";

type Section = "info" | "notificacoes" | "senha";

interface Props {
  name:           string;
  email:          string;
  role:           "admin" | "cliente";
  avatarUrl?:     string | null;
  googlePhotoUrl?: string | null;
}

export function ProfileSettings({ name: initialName, email, role, avatarUrl, googlePhotoUrl }: Props) {
  const [section, setSection]         = useState<Section>("info");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(initialName);
  const [savedName, setSavedName]     = useState(initialName);
  const [nameMsg, setNameMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [namePending, startNameTrans] = useTransition();

  /* ── Avatar upload ── */
  const fileRef                               = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar]     = useState<string | null | undefined>(avatarUrl || googlePhotoUrl);
  const [uploadMsg, setUploadMsg]             = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading]             = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await uploadAvatar(fd);
    if (res.url) {
      setCurrentAvatar(res.url);
      setUploadMsg({ ok: true, text: "Foto atualizada!" });
    } else {
      setUploadMsg({ ok: false, text: res.error ?? "Erro no upload." });
    }
    setUploading(false);
    e.target.value = "";
  }

  /* ── Name save ── */
  function saveName() {
    if (!nameValue.trim()) return;
    startNameTrans(async () => {
      const fd = new FormData();
      fd.append("name", nameValue.trim());
      const res = await updateProfile(fd);
      if (res.success) {
        setSavedName(nameValue.trim());
        setEditingName(false);
        setNameMsg({ ok: true, text: res.success });
        setTimeout(() => setNameMsg(null), 3000);
      } else {
        setNameMsg({ ok: false, text: res.error ?? "Erro ao salvar." });
      }
    });
  }

  const initials = savedName.slice(0, 2).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: 500 }}>
      {/* ── Left nav ── */}
      <nav style={{ width: 220, flexShrink: 0, paddingRight: 20 }}>
        <SectionGroup label="Conta">
          <NavItem active={section === "info"} onClick={() => setSection("info")} icon={<User size={13} />}>
            Informações Pessoais
          </NavItem>
          <NavItem active={section === "notificacoes"} onClick={() => setSection("notificacoes")} icon={<Bell size={13} />}>
            Notificações
          </NavItem>
        </SectionGroup>
        <SectionGroup label="Segurança" style={{ marginTop: 20 }}>
          <NavItem active={section === "senha"} onClick={() => setSection("senha")} icon={<Lock size={13} />}>
            Senha &amp; 2FA
          </NavItem>
        </SectionGroup>
      </nav>

      {/* ── Divider ── */}
      <div style={{ width: 1, background: "var(--border)", flexShrink: 0 }} />

      {/* ── Content ── */}
      <div style={{ flex: 1, paddingLeft: 40 }}>

        {/* === INFORMAÇÕES PESSOAIS === */}
        {section === "info" && (
          <div>
            {/* Avatar upload */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 28, borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {currentAvatar ? (
                  <Image
                    src={currentAvatar}
                    alt="Avatar"
                    width={72} height={72}
                    style={{ borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 800, color: "var(--text)" }}>
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  title="Trocar foto"
                  style={{ position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: "50%", background: "var(--primary)", border: "2px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}
                >
                  {uploading ? <Loader2 size={11} color="#fff" style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={11} color="#fff" />}
                </button>
              </div>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 8, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "12.5px", fontWeight: 500, cursor: uploading ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  {uploading ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <Camera size={12} />}
                  {uploading ? "Enviando…" : "Upload foto"}
                </button>
                {googlePhotoUrl && !avatarUrl && (
                  <p style={{ margin: "5px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
                    Usando foto da conta Google.
                  </p>
                )}
                {uploadMsg && (
                  <p style={{ margin: "5px 0 0", fontSize: "12px", color: uploadMsg.ok ? "#22c55e" : "#ef4444", fontWeight: 500 }}>{uploadMsg.text}</p>
                )}
                <p style={{ margin: "5px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>JPG, PNG ou WebP. Máx. 2MB.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display: "none" }} onChange={handleFileChange} />
            </div>

            {/* Nome */}
            <FieldRow label="Nome">
              {editingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <input
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setNameValue(savedName); setEditingName(false); } }}
                    autoFocus
                    style={{ flex: 1, maxWidth: 280, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--primary)", background: "var(--surface-2)", color: "var(--text)", fontSize: "14px", fontFamily: "inherit", outline: "none" }}
                  />
                  <button onClick={saveName} disabled={namePending} style={iconBtnStyle("#22c55e")}>
                    {namePending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                  </button>
                  <button onClick={() => { setNameValue(savedName); setEditingName(false); }} style={iconBtnStyle("var(--text-faint)")}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span style={{ fontSize: "14px", color: "var(--primary-muted, #5B57E8)", fontWeight: 500 }}>{savedName}</span>
                  <button onClick={() => setEditingName(true)} style={editBtnStyle}>Editar</button>
                </div>
              )}
              {nameMsg && <p style={{ margin: "4px 0 0", fontSize: "12px", color: nameMsg.ok ? "#22c55e" : "#ef4444" }}>{nameMsg.text}</p>}
            </FieldRow>

            {/* Email */}
            <FieldRow label="E-mail">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                <span style={{ fontSize: "14px", color: "var(--primary-muted, #5B57E8)", fontWeight: 500 }}>{email}</span>
                <span style={{ fontSize: "12px", color: "var(--text-faint)", fontStyle: "italic" }}>Não editável</span>
              </div>
            </FieldRow>

            {/* Papel */}
            <FieldRow label="Papel" noBorder>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "12px", fontWeight: 700, color: "var(--text-faint)" }}>
                <Shield size={9} style={{ color: "var(--primary)" }} />
                {role === "admin" ? "Administrador" : "Cliente"}
              </span>
            </FieldRow>
          </div>
        )}

        {/* === NOTIFICAÇÕES === */}
        {section === "notificacoes" && (
          <div>
            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "var(--text-faint)" }}>Configure como deseja receber alertas do Fropty Hub.</p>
            {[
              { id: "tickets",    label: "Atualizações de chamados",  desc: "Notificações quando um chamado mudar de status." },
              { id: "projetos",   label: "Progresso de projetos",     desc: "Avisos sobre marcos e entregas dos seus projetos." },
              { id: "contratos",  label: "Contratos pendentes",       desc: "Alertas de contratos aguardando assinatura." },
              { id: "financeiro", label: "Faturas e pagamentos",      desc: "Confirmações de cobrança e pagamento." },
            ].map(item => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                  <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-faint)" }}>{item.desc}</p>
                </div>
                <ToggleSwitch defaultOn />
              </div>
            ))}
            <p style={{ marginTop: 16, fontSize: "12px", color: "var(--text-faint)" }}>Em breve: configuração por canal (e-mail, SMS, push).</p>
          </div>
        )}

        {/* === SENHA & 2FA === */}
        {section === "senha" && (
          <div>
            <FieldRow label="Senha" noBorder={false}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                <span style={{ fontSize: "20px", letterSpacing: "0.12em", color: "var(--text-muted)" }}>••••••••••</span>
              </div>
            </FieldRow>
            <div style={{ marginTop: 24, marginBottom: 8 }}>
              <PasswordChangeForm />
            </div>

            {/* 2FA */}
            <TwoFactorSection />

            {/* Danger zone */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "22px 0", borderTop: "1px solid var(--border)" }}>
              <div style={{ maxWidth: 400 }}>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={13} />
                  Desativar conta
                </p>
                <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.5 }}>
                  Esta ação removerá imediatamente todos os seus dados. É irreversível — prossiga com cautela.
                </p>
              </div>
              <button style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--c-danger)", background: "transparent", color: "var(--c-danger)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap" }}>
                Desativar
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── 2FA Section ── */
function TwoFactorSection() {
  const [step, setStep]       = useState<"idle" | "qr" | "done">("idle");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode]   = useState("");
  const [secret, setSecret]   = useState("");
  const [code, setCode]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  async function startEnroll() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    if (err || !data) {
      setError(err?.message ?? "Erro ao iniciar. Tente novamente.");
      setLoading(false);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep("qr");
    setLoading(false);
  }

  async function verify() {
    if (code.length !== 6) { setError("Digite o código de 6 dígitos."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !challenge) { setError("Erro ao criar desafio."); setLoading(false); return; }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
    if (vErr) {
      setError("Código inválido. Verifique o aplicativo e tente novamente.");
      setLoading(false);
      return;
    }
    setStep("done");
    setLoading(false);
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ padding: "22px 0", borderTop: "1px solid var(--border)" }}>
      {step === "idle" && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ maxWidth: 400 }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Autenticação em dois fatores</p>
            <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.5 }}>
              Adicione uma camada extra de segurança. Um código será exigido além da sua senha.
            </p>
          </div>
          <button
            onClick={startEnroll}
            disabled={loading}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: "12.5px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <QrCode size={12} />}
            Ativar
          </button>
        </div>
      )}

      {step === "qr" && (
        <div>
          <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
            <QrCode size={14} style={{ marginRight: 7, verticalAlign: "middle" }} />
            Configure o autenticador
          </p>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.5 }}>
            Escaneie o QR code com o seu app autenticador (Google Authenticator, Authy, etc.), depois insira o código de 6 dígitos gerado.
          </p>
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* QR code */}
            <div style={{ background: "#fff", padding: 10, borderRadius: 10, border: "1px solid var(--border)", flexShrink: 0 }}
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Código manual</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <code style={{ fontSize: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 10px", color: "var(--text)", letterSpacing: "0.1em", wordBreak: "break-all" }}>{secret}</code>
                <button onClick={copySecret} style={{ padding: "6px 8px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", color: copied ? "#22c55e" : "var(--text-faint)", display: "flex", alignItems: "center", gap: 4, fontSize: "11px", fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Código do app</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ width: 110, padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: "18px", letterSpacing: "0.2em", fontFamily: "monospace", outline: "none", textAlign: "center" }}
                />
                <button
                  onClick={verify}
                  disabled={loading || code.length !== 6}
                  style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: (loading || code.length !== 6) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (loading || code.length !== 6) ? 0.6 : 1, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  {loading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                  Verificar
                </button>
                <button onClick={() => { setStep("idle"); setCode(""); setError(""); }} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
              </div>
              {error && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#ef4444" }}>{error}</p>}
            </div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle size={18} color="#22c55e" />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>Autenticação em dois fatores ativa</p>
            <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-faint)" }}>Sua conta está protegida. Um código será exigido em cada login.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Toggle switch ── */
function ToggleSwitch({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <button
      onClick={() => setOn(o => !o)}
      style={{ position: "relative", display: "inline-flex", width: 40, height: 22, borderRadius: 999, background: on ? "var(--primary)" : "var(--surface-2)", border: `1px solid ${on ? "var(--primary)" : "var(--border)"}`, cursor: "pointer", padding: 0, transition: "background 0.2s, border-color 0.2s", flexShrink: 0 }}
    >
      <span style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* ── Sub-components ── */
function SectionGroup({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <p style={{ margin: "0 0 4px 8px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", color: "var(--text-faint)" }}>{label}</p>
      {children}
    </div>
  );
}

function NavItem({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, textAlign: "left", background: active ? "var(--surface-2)" : "transparent", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", fontWeight: active ? 600 : 500, color: active ? "var(--text)" : "var(--text-muted)", transition: "background 0.1s", whiteSpace: "nowrap" }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{icon}</span>
      {children}
    </button>
  );
}

function FieldRow({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div style={{ padding: "18px 0", borderBottom: noBorder ? "none" : "1px solid var(--border)" }}>
      <p style={{ margin: "0 0 5px", fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>{label}</p>
      {children}
    </div>
  );
}

const editBtnStyle: React.CSSProperties = {
  fontSize: "13px", fontWeight: 600, color: "var(--text)", background: "none",
  border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 0",
  textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0, whiteSpace: "nowrap",
};

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)",
    cursor: "pointer", color, flexShrink: 0,
  };
}
