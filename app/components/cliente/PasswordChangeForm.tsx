"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { SentinelScan } from "@/app/components/auth/SentinelScan";
import { createClient } from "@/app/lib/supabase/browser";
import {
  Lock, Info, CheckCircle, XCircle, MessageCircle,
  Phone, Send, KeyRound, Loader2, ArrowRight,
} from "lucide-react";

type Tab = "password" | "sms";
type SmsStep = "phone" | "code" | "newpwd";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  issues: string[];
}

function analyzePassword(password: string): PasswordStrength {
  const issues: string[] = [];
  if (password.length < 10)           issues.push("mínimo 10 caracteres");
  if (!/[A-Z]/.test(password))        issues.push("pelo menos 1 maiúscula");
  if (!/[a-z]/.test(password))        issues.push("pelo menos 1 minúscula");
  if (!/[0-9]/.test(password))        issues.push("pelo menos 1 número");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("pelo menos 1 caractere especial");
  const score = Math.max(0, 4 - issues.length) as 0 | 1 | 2 | 3 | 4;
  const levels: { label: string; color: string }[] = [
    { label: "Muito fraca", color: "#ef4444" },
    { label: "Fraca",       color: "#f97316" },
    { label: "Razoável",    color: "#EF9F27" },
    { label: "Boa",         color: "#84cc16" },
    { label: "Forte",       color: "#22c55e" },
  ];
  return { score, issues, ...levels[score] };
}

export default function PasswordChangeForm() {
  /* ── Tab state ── */
  const [tab, setTab] = useState<Tab>("password");

  /* ── Password tab ── */
  const [isPending,  startTransition] = useTransition();
  const [msg,        setMsg]          = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPwd,     setNewPwd]       = useState("");
  const [scanning,   setScanning]     = useState(false);
  const formRef                       = useRef<HTMLFormElement>(null);
  const strength = newPwd ? analyzePassword(newPwd) : null;

  /* ── SMS tab ── */
  const [smsStep,   setSmsStep]   = useState<SmsStep>("phone");
  const [smsPhone,  setSmsPhone]  = useState("");
  const [channel,   setChannel]   = useState<"sms" | "whatsapp">("sms");
  const [smsCode,   setSmsCode]   = useState("");
  const [smsPwd,    setSmsPwd]    = useState("");
  const [smsConf,   setSmsConf]   = useState("");
  const [totpCode,  setTotpCode]  = useState("");
  const [needTotp,  setNeedTotp]  = useState(false);
  const [smsMsg,    setSmsMsg]    = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [smsLoad,   setSmsLoad]   = useState(false);
  const smsPwdStr = smsPwd ? analyzePassword(smsPwd) : null;

  /* Pre-fill phone from profile */
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.phone) setSmsPhone(user.phone);
    });
    // Tenta buscar do profile também
    supabase.from("profiles").select("phone_number").single().then(({ data }) => {
      const phone = (data as { phone_number?: string | null } | null)?.phone_number;
      if (phone) setSmsPhone(phone);
    });
  }, []);

  /* ── Handlers password tab ── */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd      = new FormData(e.currentTarget);
    const current = fd.get("current_password") as string;
    const next    = fd.get("new_password")     as string;
    const confirm = fd.get("confirm_password") as string;
    if (!current || !next || !confirm) { setMsg({ type: "error", text: "Preencha todos os campos." }); return; }
    if (next !== confirm)              { setMsg({ type: "error", text: "Nova senha e confirmação não conferem." }); return; }
    const analysis = analyzePassword(next);
    if (analysis.issues.length > 0)   { setMsg({ type: "error", text: "Requisitos: " + analysis.issues.join(", ") + "." }); return; }
    setScanning(true);
    startTransition(async () => {
      const { changePassword } = await import("@/app/actions/profile");
      const [result] = await Promise.all([changePassword(fd), new Promise(r => setTimeout(r, 2400))]);
      setScanning(false);
      if (result.success) { setMsg({ type: "success", text: result.success }); formRef.current?.reset(); setNewPwd(""); }
      else                { setMsg({ type: "error",   text: result.error ?? "Erro desconhecido." }); }
    });
  }

  /* ── Handlers SMS tab ── */
  async function handleSendOtp() {
    setSmsMsg(null);
    const phone = smsPhone.trim();
    if (!phone) { setSmsMsg({ type: "error", text: "Informe o número de telefone." }); return; }
    if (!/^\+?\d{8,15}$/.test(phone.replace(/\s/g, ""))) {
      setSmsMsg({ type: "error", text: "Formato inválido. Use +5511999990000." }); return;
    }
    setSmsLoad(true);
    const supabase = createClient();
    // updateUser({ phone }) envia OTP para o número sem criar novo usuário
    const { error } = await supabase.auth.updateUser({ phone });
    setSmsLoad(false);
    if (error) { setSmsMsg({ type: "error", text: error.message }); return; }
    setSmsStep("code");
    setSmsMsg({ type: "success", text: `Código enviado para ${phone} via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}.` });
  }

  async function handleVerifyOtp() {
    setSmsMsg(null);
    if (smsCode.length !== 6) { setSmsMsg({ type: "error", text: "Digite o código de 6 dígitos." }); return; }
    setSmsLoad(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ phone: smsPhone.trim(), token: smsCode, type: "phone_change" });
    setSmsLoad(false);
    if (error) { setSmsMsg({ type: "error", text: "Código inválido ou expirado." }); return; }
    setSmsStep("newpwd");
    setSmsMsg(null);
  }

  async function handleChangePwdSms() {
    setSmsMsg(null);
    if (!smsPwd || !smsConf)        { setSmsMsg({ type: "error", text: "Preencha os dois campos." }); return; }
    if (smsPwd !== smsConf)         { setSmsMsg({ type: "error", text: "Senhas não conferem." }); return; }
    const analysis = analyzePassword(smsPwd);
    if (analysis.issues.length > 0) { setSmsMsg({ type: "error", text: "Requisitos: " + analysis.issues.join(", ") + "." }); return; }
    setSmsLoad(true);
    const supabase = createClient();

    // Se AAL1 e tem 2FA ativo, precisa fazer o challenge TOTP antes de trocar senha
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
      if (!needTotp) { setNeedTotp(true); setSmsLoad(false); return; }
      // Verifica o código TOTP informado
      if (totpCode.length !== 6) { setSmsMsg({ type: "error", text: "Digite o código 2FA de 6 dígitos." }); setSmsLoad(false); return; }
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find(f => f.status === "verified");
      if (!totp) { setSmsMsg({ type: "error", text: "Fator 2FA não encontrado." }); setSmsLoad(false); return; }
      const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (cErr || !challenge) { setSmsMsg({ type: "error", text: "Erro ao criar desafio 2FA." }); setSmsLoad(false); return; }
      const { error: vErr } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: challenge.id, code: totpCode });
      if (vErr) { setSmsMsg({ type: "error", text: "Código 2FA inválido." }); setSmsLoad(false); return; }
    }

    const { error } = await supabase.auth.updateUser({ password: smsPwd });
    setSmsLoad(false);
    if (error) { setSmsMsg({ type: "error", text: error.message }); return; }
    setSmsMsg({ type: "success", text: "Senha alterada com sucesso! Redirecionando para o login…" });
    setTimeout(() => { window.location.href = "/area-cliente"; }, 2200);
  }

  function resetSms() { setSmsStep("phone"); setSmsCode(""); setSmsPwd(""); setSmsConf(""); setTotpCode(""); setNeedTotp(false); setSmsMsg(null); }

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 28px 24px" }}>
      <SentinelScan active={scanning} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {([
          { id: "password", label: "Por senha atual", icon: <Lock size={12} /> },
          { id: "sms",      label: "Via SMS / WhatsApp", icon: <MessageCircle size={12} /> },
        ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setMsg(null); setSmsMsg(null); }}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: "8px 8px 0 0",
              border: "1px solid var(--border)", borderBottom: tab === t.id ? "1px solid var(--surface)" : "1px solid var(--border)",
              background: tab === t.id ? "var(--surface)" : "var(--surface-2)",
              color: tab === t.id ? "var(--text)" : "var(--text-muted)",
              fontSize: "12.5px", fontWeight: tab === t.id ? 700 : 500,
              cursor: "pointer", fontFamily: "inherit",
              marginBottom: tab === t.id ? -1 : 0,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Por senha atual ── */}
      {tab === "password" && (
        <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Senha atual</label>
            <input type="password" name="current_password" required autoComplete="current-password" placeholder="••••••••••" style={inputStyle} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Nova senha</label>
            <input type="password" name="new_password" required autoComplete="new-password" placeholder="••••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} style={inputStyle} />
            {newPwd && strength && (
              <div>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < strength.score ? strength.color : "var(--border)", transition: "background 0.2s" }} />
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: strength.color, fontWeight: 600 }}>{strength.label}</p>
                {strength.issues.length > 0 && (
                  <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.7 }}>
                    {strength.issues.map(i => <li key={i}>{i}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Confirmar nova senha</label>
            <input type="password" name="confirm_password" required autoComplete="new-password" placeholder="••••••••••" style={inputStyle} />
          </div>

          <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", background: "var(--surface)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.7 }}>
            <Info size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />
            Mínimo 10 caracteres — maiúsculas, minúsculas, número e caractere especial.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <button
              type="submit"
              disabled={isPending || (!!newPwd && !!strength && strength.issues.length > 0)}
              style={{ padding: "10px 22px", borderRadius: 9, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Lock size={14} />
              {isPending ? "Alterando…" : "Alterar senha"}
            </button>
            {msg && (
              <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: msg.type === "success" ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
                {msg.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {msg.text}
              </p>
            )}
          </div>
        </form>
      )}

      {/* ── Tab: Via SMS / WhatsApp ── */}
      {tab === "sms" && (
        <div style={{ maxWidth: 420 }}>

          {/* Step indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
            {[
              { step: "phone",  label: "Telefone", icon: <Phone size={11} /> },
              { step: "code",   label: "Código",   icon: <Send size={11} /> },
              { step: "newpwd", label: "Nova senha", icon: <KeyRound size={11} /> },
            ].map((s, idx) => {
              const steps: SmsStep[] = ["phone", "code", "newpwd"];
              const current = steps.indexOf(smsStep);
              const isActive = steps.indexOf(s.step as SmsStep) <= current;
              return (
                <div key={s.step} style={{ display: "flex", alignItems: "center", flex: idx < 2 ? 1 : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, background: isActive ? "var(--cta-bg)" : "var(--surface-2)", border: `1px solid ${isActive ? "transparent" : "var(--border)"}`, color: isActive ? "var(--cta-text)" : "var(--text-muted)", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                    {s.icon} {s.label}
                  </div>
                  {idx < 2 && <div style={{ flex: 1, height: 1, background: isActive && current > idx ? "var(--cta-bg)" : "var(--border)", margin: "0 4px" }} />}
                </div>
              );
            })}
          </div>

          {/* Step 1: Telefone + canal */}
          {smsStep === "phone" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Número de telefone</label>
                <input
                  value={smsPhone}
                  onChange={e => setSmsPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                  placeholder="+5511999990000"
                  style={inputStyle}
                />
                <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>
                  Use o número cadastrado no perfil. Formato internacional: +55...
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Receber via</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {([
                    { id: "sms",      label: "SMS",       color: "#3b82f6" },
                    { id: "whatsapp", label: "WhatsApp",  color: "#22c55e" },
                  ] as { id: "sms" | "whatsapp"; label: string; color: string }[]).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setChannel(c.id)}
                      style={{
                        flex: 1, padding: "9px 12px", borderRadius: 9, fontFamily: "inherit",
                        border: `1.5px solid ${channel === c.id ? c.color : "var(--border)"}`,
                        background: channel === c.id ? `${c.color}15` : "var(--surface-2)",
                        color: channel === c.id ? c.color : "var(--text-muted)",
                        fontSize: "13px", fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={smsLoad}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 9, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: smsLoad ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {smsLoad ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <Send size={14} />}
                {smsLoad ? "Enviando…" : `Enviar código via ${channel === "whatsapp" ? "WhatsApp" : "SMS"}`}
              </button>
            </div>
          )}

          {/* Step 2: Código OTP */}
          {smsStep === "code" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-faint)", lineHeight: 1.6 }}>
                Código enviado para <strong style={{ color: "var(--text)" }}>{smsPhone}</strong>.
                Válido por 10 minutos.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Código de 6 dígitos</label>
                <input
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  style={{ ...inputStyle, fontSize: 22, letterSpacing: "0.25em", textAlign: "center", fontFamily: "monospace", maxWidth: 180 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleVerifyOtp}
                  disabled={smsLoad || smsCode.length !== 6}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 9, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: (smsLoad || smsCode.length !== 6) ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: smsCode.length !== 6 ? 0.6 : 1 }}
                >
                  {smsLoad ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <ArrowRight size={14} />}
                  {smsLoad ? "Verificando…" : "Verificar código"}
                </button>
                <button onClick={resetSms} style={{ padding: "11px 16px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-muted)", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                  Voltar
                </button>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={smsLoad}
                style={{ background: "none", border: "none", color: "var(--text-faint)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3, alignSelf: "flex-start" }}
              >
                Reenviar código
              </button>
            </div>
          )}

          {/* Step 3: Nova senha */}
          {smsStep === "newpwd" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#22c55e", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} /> Identidade confirmada. Defina sua nova senha.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Nova senha</label>
                <input type="password" value={smsPwd} onChange={e => setSmsPwd(e.target.value)} autoComplete="new-password" placeholder="••••••••••" style={inputStyle} />
                {smsPwd && smsPwdStr && (
                  <div>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i < smsPwdStr.score ? smsPwdStr.color : "var(--border)" }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: "11px", color: smsPwdStr.color, fontWeight: 600 }}>{smsPwdStr.label}</p>
                    {smsPwdStr.issues.length > 0 && (
                      <ul style={{ margin: "4px 0 0", paddingLeft: 16, fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.7 }}>
                        {smsPwdStr.issues.map(i => <li key={i}>{i}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Confirmar nova senha</label>
                <input type="password" value={smsConf} onChange={e => setSmsConf(e.target.value)} autoComplete="new-password" placeholder="••••••••••" style={inputStyle} />
              </div>

              {needTotp && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "14px", borderRadius: 10, border: "1px solid rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.06)" }}>
                  <label style={{ ...labelStyle, color: "#818cf8" }}>Código 2FA (Google Authenticator)</label>
                  <input
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    style={{ ...inputStyle, fontSize: 20, letterSpacing: "0.2em", textAlign: "center", fontFamily: "monospace", maxWidth: 160 }}
                  />
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)" }}>Sua conta tem 2FA ativo. Confirme para concluir.</p>
                </div>
              )}

              <button
                onClick={handleChangePwdSms}
                disabled={smsLoad || !smsPwd || (!!smsPwdStr && smsPwdStr.issues.length > 0)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "11px 20px", borderRadius: 9, border: "none", background: "var(--cta-bg)", color: "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: smsLoad ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {smsLoad ? <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> : <KeyRound size={14} />}
                {smsLoad ? "Salvando…" : "Definir nova senha"}
              </button>
            </div>
          )}

          {/* Mensagem global da tab SMS */}
          {smsMsg && (
            <p style={{ marginTop: 14, fontSize: "13px", fontWeight: 600, color: smsMsg.type === "success" ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 5 }}>
              {smsMsg.type === "success" ? <CheckCircle size={13} /> : <XCircle size={13} />}
              {smsMsg.text}
            </p>
          )}

          <p style={{ marginTop: 16, fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.6 }}>
            Requer SMS habilitado na conta Supabase (Twilio). O número deve estar
            cadastrado em <strong>Perfil → Telefone</strong>.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "11px", fontWeight: 700, color: "var(--text-faint)",
  textTransform: "uppercase", letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: 9, color: "var(--text)", padding: "10px 14px",
  fontSize: "14px", fontFamily: "inherit", outline: "none",
  width: "100%", boxSizing: "border-box",
};
