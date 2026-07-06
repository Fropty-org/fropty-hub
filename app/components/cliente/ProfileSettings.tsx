"use client";

import { useState, useTransition, useRef } from "react";
import { saveAvatarUrl, updateProfile } from "@/app/actions/profile";
import { createClient } from "@/app/lib/supabase/browser";
import PasswordChangeForm from "@/app/components/cliente/PasswordChangeForm";
import {
  User, Bell, Lock, Shield, AlertTriangle, Camera, Loader2,
  Check, X, Copy, CheckCircle, QrCode,
} from "lucide-react";

type Section = "info" | "notificacoes" | "senha";

interface Props {
  name:            string;
  email:           string;
  role:            "admin" | "cliente";
  avatarUrl?:      string | null;
  googlePhotoUrl?: string | null;
  phoneNumber?:    string | null;
}

export function ProfileSettings({ name: initialName, email, role, avatarUrl, googlePhotoUrl, phoneNumber: initialPhone }: Props) {
  const [section, setSection]         = useState<Section>("info");
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(initialName);
  const [savedName, setSavedName]     = useState(initialName);
  const [nameMsg, setNameMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [namePending, startNameTrans] = useTransition();

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue]     = useState(initialPhone ?? "");
  const [savedPhone, setSavedPhone]     = useState(initialPhone ?? "");
  const [phoneMsg, setPhoneMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [phonePending, startPhoneTrans] = useTransition();

  const fileRef                             = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar]   = useState<string | null | undefined>(avatarUrl || googlePhotoUrl);
  const [uploadMsg, setUploadMsg]           = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading]           = useState(false);

  /* ── Upload client-side direto ao Supabase Storage ── */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadMsg({ ok: false, text: "Formato inválido. Use JPG, PNG ou WebP." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadMsg({ ok: false, text: "Imagem deve ter no máximo 2MB." });
      return;
    }

    setUploading(true);
    setUploadMsg(null);

    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) {
      setUploadMsg({ ok: false, text: "Sessão inválida. Faça login novamente." });
      setUploading(false);
      return;
    }

    const ext  = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploadMsg({ ok: false, text: uploadError.message || "Erro ao fazer upload." });
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    const res = await saveAvatarUrl(urlWithBust);
    if (res.error) {
      setUploadMsg({ ok: false, text: res.error });
    } else {
      setCurrentAvatar(urlWithBust);
      setUploadMsg({ ok: true, text: "Foto atualizada!" });
    }
    setUploading(false);
    e.target.value = "";
  }

  /* ── Salvar telefone ── */
  function savePhone() {
    startPhoneTrans(async () => {
      const { updatePhoneNumber } = await import("@/app/actions/profile");
      const res = await updatePhoneNumber(phoneValue.trim());
      if (res.success) {
        setSavedPhone(phoneValue.trim());
        setEditingPhone(false);
        setPhoneMsg({ ok: true, text: res.success });
        setTimeout(() => setPhoneMsg(null), 3000);
      } else {
        setPhoneMsg({ ok: false, text: res.error ?? "Erro ao salvar." });
      }
    });
  }

  /* ── Salvar nome ── */
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
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .ps-wrap {
          display: flex;
          min-height: 500px;
        }
        .ps-nav {
          width: 210px;
          flex-shrink: 0;
          padding-right: 20px;
        }
        .ps-divider {
          width: 1px;
          background: var(--border);
          flex-shrink: 0;
        }
        .ps-content {
          flex: 1;
          padding-left: 36px;
          min-width: 0;
        }
        .ps-nav-group {
          margin-bottom: 20px;
        }
        .ps-nav-label {
          margin: 0 0 4px 8px;
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.09em; text-transform: uppercase;
          color: var(--text-faint);
        }
        .ps-nav-btn {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px; text-align: left;
          background: transparent; border: none; cursor: pointer;
          font-family: inherit; font-size: 13px; color: var(--text-muted);
          font-weight: 500; transition: background 0.12s;
          white-space: nowrap;
        }
        .ps-nav-btn:hover { background: var(--surface-2); }
        .ps-nav-btn.active {
          background: var(--surface-2);
          color: var(--text);
          font-weight: 600;
        }
        /* mobile tabs (horizontal) */
        .ps-nav-mobile {
          display: none;
          gap: 4px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .ps-nav-desktop { display: flex; flex-direction: column; }

        @media (max-width: 680px) {
          .ps-wrap { flex-direction: column; gap: 0; }
          .ps-nav { width: 100%; padding-right: 0; }
          .ps-divider { display: none; }
          .ps-content { padding-left: 0; padding-top: 20px; }
          .ps-nav-desktop { display: none; }
          .ps-nav-mobile { display: flex; }
          .ps-nav-btn { white-space: nowrap; padding: 6px 14px; border-radius: 99px; flex-shrink: 0; }
        }

        /* 2FA QR layout */
        .ps-2fa-qr {
          display: flex;
          gap: 24px;
          align-items: flex-start;
          flex-wrap: wrap;
        }
        @media (max-width: 560px) {
          .ps-2fa-qr { flex-direction: column; }
        }
      `}</style>

      <div className="ps-wrap">

        {/* ── Nav desktop ── */}
        <nav className="ps-nav">
          <div className="ps-nav-desktop">
            <div className="ps-nav-group">
              <p className="ps-nav-label">Conta</p>
              <button className={`ps-nav-btn${section === "info" ? " active" : ""}`} onClick={() => setSection("info")}>
                <span style={{ opacity: section === "info" ? 1 : 0.6 }}><User size={13} /></span>
                Informações Pessoais
              </button>
              <button className={`ps-nav-btn${section === "notificacoes" ? " active" : ""}`} onClick={() => setSection("notificacoes")}>
                <span style={{ opacity: section === "notificacoes" ? 1 : 0.6 }}><Bell size={13} /></span>
                Notificações
              </button>
            </div>
            <div className="ps-nav-group">
              <p className="ps-nav-label">Segurança</p>
              <button className={`ps-nav-btn${section === "senha" ? " active" : ""}`} onClick={() => setSection("senha")}>
                <span style={{ opacity: section === "senha" ? 1 : 0.6 }}><Lock size={13} /></span>
                Senha &amp; 2FA
              </button>
            </div>
          </div>

          {/* ── Nav mobile (tabs) ── */}
          <div className="ps-nav-mobile">
            {(["info", "notificacoes", "senha"] as Section[]).map((id) => {
              const labels: Record<Section, string> = { info: "Informações", notificacoes: "Notificações", senha: "Senha & 2FA" };
              const icons: Record<Section, React.ReactNode> = { info: <User size={12} />, notificacoes: <Bell size={12} />, senha: <Lock size={12} /> };
              return (
                <button key={id} className={`ps-nav-btn${section === id ? " active" : ""}`} onClick={() => setSection(id)}>
                  <span style={{ opacity: section === id ? 1 : 0.6 }}>{icons[id]}</span>
                  {labels[id]}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Divider ── */}
        <div className="ps-divider" />

        {/* ── Content ── */}
        <div className="ps-content">

          {/* === INFORMAÇÕES === */}
          {section === "info" && (
            <div>
              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 28, borderBottom: "1px solid var(--border)" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {currentAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentAvatar}
                      alt="Avatar"
                      style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", display: "block" }}
                    />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--surface-2)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    title="Trocar foto"
                    style={{ position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: "50%", background: "var(--cta-bg)", border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}
                  >
                    {uploading
                      ? <Loader2 size={11} style={{ color: "var(--cta-text)", animation: "spin 0.8s linear infinite" }} />
                      : <Camera size={11} style={{ color: "var(--cta-text)" }} />}
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
                  {uploadMsg && (
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: uploadMsg.ok ? "var(--c-success)" : "var(--c-danger)", fontWeight: 500 }}>
                      {uploadMsg.text}
                    </p>
                  )}
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--text-faint)" }}>JPG, PNG ou WebP · máx. 2MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleFileChange} />
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
                      style={{ flex: 1, maxWidth: 280, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--primary)", background: "var(--surface-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                    />
                    <button onClick={saveName} disabled={namePending} style={iconBtnStyle("var(--c-success)")}>
                      {namePending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                    </button>
                    <button onClick={() => { setNameValue(savedName); setEditingName(false); }} style={iconBtnStyle("var(--text-faint)")}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                    <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{savedName}</span>
                    <button onClick={() => setEditingName(true)} style={editBtnStyle}>Editar</button>
                  </div>
                )}
                {nameMsg && <p style={{ margin: "4px 0 0", fontSize: 12, color: nameMsg.ok ? "var(--c-success)" : "var(--c-danger)" }}>{nameMsg.text}</p>}
              </FieldRow>

              {/* Email */}
              <FieldRow label="E-mail">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{email}</span>
                  <span style={{ fontSize: 12, color: "var(--text-faint)", fontStyle: "italic" }}>Não editável</span>
                </div>
              </FieldRow>

              {/* Telefone */}
              <FieldRow label="Telefone">
                {editingPhone ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, flexWrap: "wrap" }}>
                    <input
                      value={phoneValue}
                      onChange={e => setPhoneValue(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") savePhone(); if (e.key === "Escape") { setPhoneValue(savedPhone); setEditingPhone(false); } }}
                      autoFocus
                      placeholder="+5511999990000"
                      style={{ flex: 1, maxWidth: 280, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--primary)", background: "var(--surface-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                    />
                    <button onClick={savePhone} disabled={phonePending} style={iconBtnStyle("var(--c-success)")}>
                      {phonePending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                    </button>
                    <button onClick={() => { setPhoneValue(savedPhone); setEditingPhone(false); }} style={iconBtnStyle("var(--text-faint)")}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                    <span style={{ fontSize: 14, color: savedPhone ? "var(--text)" : "var(--text-faint)", fontWeight: savedPhone ? 500 : 400 }}>
                      {savedPhone || "Não informado"}
                    </span>
                    <button onClick={() => setEditingPhone(true)} style={editBtnStyle}>Editar</button>
                  </div>
                )}
                {phoneMsg && <p style={{ margin: "4px 0 0", fontSize: 12, color: phoneMsg.ok ? "var(--c-success)" : "var(--c-danger)" }}>{phoneMsg.text}</p>}
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-faint)" }}>
                  Usado para verificação via SMS. Formato: +5511999990000
                </p>
              </FieldRow>

              {/* Papel */}
              <FieldRow label="Papel" noBorder>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 12, fontWeight: 700, color: "var(--text-faint)" }}>
                  <Shield size={9} style={{ color: "var(--primary)" }} />
                  {role === "admin" ? "Administrador" : "Cliente"}
                </span>
              </FieldRow>
            </div>
          )}

          {/* === NOTIFICAÇÕES === */}
          {section === "notificacoes" && (
            <div>
              <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--text-faint)" }}>Configure como deseja receber alertas do Fropty Hub.</p>
              {[
                { id: "tickets",    label: "Atualizações de chamados",  desc: "Notificações quando um chamado mudar de status." },
                { id: "projetos",   label: "Progresso de projetos",     desc: "Avisos sobre marcos e entregas dos seus projetos." },
                { id: "contratos",  label: "Contratos pendentes",       desc: "Alertas de contratos aguardando assinatura." },
                { id: "financeiro", label: "Faturas e pagamentos",      desc: "Confirmações de cobrança e pagamento." },
              ].map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.label}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-faint)" }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch defaultOn />
                </div>
              ))}
              <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-faint)" }}>Em breve: configuração por canal (e-mail, SMS, push).</p>
            </div>
          )}

          {/* === SENHA & 2FA === */}
          {section === "senha" && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <PasswordChangeForm />
              </div>

              <TwoFactorSection />

              {/* Danger zone */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, padding: "22px 0", borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--c-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertTriangle size={13} />
                    Desativar conta
                  </p>
                  <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text-faint)", lineHeight: 1.5 }}>
                    Esta ação removerá imediatamente todos os seus dados. É irreversível — prossiga com cautela.
                  </p>
                </div>
                <button style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid var(--c-danger)", background: "transparent", color: "var(--c-danger)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap", alignSelf: "center" }}>
                  Desativar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

/* ── 2FA Section ── */
import { useEffect } from "react";

function TwoFactorSection() {
  const [step, setStep]         = useState<"loading" | "idle" | "qr" | "done">("loading");
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode]     = useState("");
  const [secret, setSecret]     = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [copied, setCopied]     = useState(false);

  /* Detecta estado real do MFA ao montar */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.totp?.find(f => f.status === "verified");
      if (verified) {
        setStep("done");
        setFactorId(verified.id);
      } else {
        setStep("idle");
      }
    });
  }, []);

  async function startEnroll() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    // Remove fatores não verificados anteriores antes de criar novo
    // Tenta remover fatores existentes não verificados (melhor esforço)
    try {
      const res = await (supabase.auth.mfa as unknown as { listFactors: (o: object) => Promise<{ data?: { totp?: { id: string; status: string }[] } }> }).listFactors({});
      for (const f of res.data?.totp ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    } catch { /* ignora */ }

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
    if (vErr) { setError("Código inválido. Verifique o aplicativo e tente novamente."); setLoading(false); return; }
    setStep("done");
    setLoading(false);
  }

  async function disable2FA() {
    if (!factorId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId });
    setFactorId("");
    setCode("");
    setError("");
    setStep("idle");
    setLoading(false);
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (step === "loading") {
    return (
      <div style={{ padding: "24px 0", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, color: "var(--text-faint)", fontSize: 13 }}>
        <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Verificando 2FA…
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 0", borderTop: "1px solid var(--border)" }}>
      {step === "idle" && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Autenticação em dois fatores</p>
            <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--text-faint)", lineHeight: 1.5 }}>
              Adicione uma camada extra de segurança. Um código será exigido além da sua senha.
            </p>
          </div>
          <button
            onClick={startEnroll}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: "12.5px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap", alignSelf: "center" }}
          >
            {loading ? <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> : <QrCode size={12} />}
            Ativar 2FA
          </button>
        </div>
      )}

      {step === "qr" && (
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 7 }}>
            <QrCode size={15} /> Configure o autenticador
          </p>
          <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-faint)", lineHeight: 1.5 }}>
            Escaneie o QR code com Google Authenticator, Authy ou similar, depois insira o código gerado.
          </p>
          <div className="ps-2fa-qr">
            <div style={{ background: "#fff", padding: 10, borderRadius: 12, border: "1px solid var(--border)", flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qrCode }} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Código manual</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <code style={{ flex: 1, fontSize: 12, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 10px", color: "var(--text)", letterSpacing: "0.1em", wordBreak: "break-all" }}>{secret}</code>
                <button onClick={copySecret} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)", cursor: "pointer", color: copied ? "var(--c-success)" : "var(--text-faint)", fontSize: 11, fontWeight: 600, fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Código do app</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && verify()}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  style={{ width: 120, padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text)", fontSize: 18, letterSpacing: "0.2em", fontFamily: "monospace", outline: "none", textAlign: "center" }}
                />
                <button onClick={verify} disabled={loading || code.length !== 6} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: 13, fontWeight: 700, cursor: (loading || code.length !== 6) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: (loading || code.length !== 6) ? 0.6 : 1, whiteSpace: "nowrap" }}>
                  {loading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Check size={13} />}
                  Verificar
                </button>
                <button onClick={() => { setStep("idle"); setCode(""); setError(""); }} style={{ display: "flex", alignItems: "center", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancelar
                </button>
              </div>
              {error && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--c-danger)" }}>{error}</p>}
            </div>
          </div>
        </div>
      )}

      {step === "done" && (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CheckCircle size={18} style={{ color: "var(--c-success)" }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text)" }}>2FA ativo</p>
              <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "var(--text-faint)" }}>Código exigido em cada login.</p>
            </div>
          </div>
          <button
            onClick={disable2FA}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "1px solid #ef4444", background: "transparent", color: "var(--c-danger)", fontSize: "12px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap", alignSelf: "center" }}
          >
            {loading ? <Loader2 size={11} style={{ animation: "spin 0.8s linear infinite" }} /> : <X size={11} />}
            Desativar 2FA
          </button>
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
      aria-label="Toggle"
    >
      <span style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* ── Helpers ── */
function FieldRow({ label, children, noBorder }: { label: string; children: React.ReactNode; noBorder?: boolean }) {
  return (
    <div style={{ padding: "18px 0", borderBottom: noBorder ? "none" : "1px solid var(--border)" }}>
      <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{label}</p>
      {children}
    </div>
  );
}

const editBtnStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "var(--text)", background: "none",
  border: "none", cursor: "pointer", fontFamily: "inherit", padding: "2px 0",
  textDecoration: "underline", textUnderlineOffset: 3, flexShrink: 0,
};

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
    borderRadius: 7, border: "1px solid var(--border)", background: "var(--surface-2)",
    cursor: "pointer", color,
  };
}
