"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminUpdateUserProfile } from "@/app/actions/admin";
import { SERVICES } from "@/app/lib/constants/services";
import { useT } from "@/app/lib/i18n/I18nProvider";
import {
  ArrowLeft, Save, Mail, User, Phone, Loader2,
  CheckCircle, XCircle, CreditCard, Coins, Building2, CalendarDays,
} from "lucide-react";

interface EditUser {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  role: "cliente" | "admin";
  plan: "sem_plano" | "basico" | "pro";
  token_balance: number;
  services: string[];
  contract_start: string;
  plan_renewal: string;
}

export function EditUsuarioForm({ user }: { user: EditUser }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [services, setServices] = useState<Set<string>>(new Set(user.services));

  function toggleService(id: string) {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    fd.set("user_id", user.id);
    services.forEach((s) => fd.append("services", s));

    startTransition(async () => {
      const res = await adminUpdateUserProfile(fd);
      if (res.success) {
        setMsg({ ok: true, text: res.success });
        setTimeout(() => { router.push("/admin/usuarios"); router.refresh(); }, 1200);
      } else {
        setMsg({ ok: false, text: res.error ?? t("admin.users.edit.saveError") });
      }
    });
  }

  return (
    <div className="hub-page" style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <Link
          href="/admin/usuarios"
          style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", textDecoration: "none", flexShrink: 0 }}
        >
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "var(--text)", letterSpacing: "-0.02em" }}>{t("admin.users.edit.title")}</h1>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-faint)" }}>
            {t("admin.users.edit.subtitle", { name: user.name || user.email })}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="hub-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Nome + E-mail */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("admin.users.edit.fullName")} icon={<User size={13} />}>
                <input name="name" defaultValue={user.name} placeholder="João Silva" style={inputStyle} />
              </Field>
              <Field label={`${t("admin.users.edit.email")} *`} icon={<Mail size={13} />}>
                <input name="email" type="email" required defaultValue={user.email} placeholder="joao@empresa.com" style={inputStyle} />
              </Field>
            </div>

            {/* Empresa + Telefone */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t("admin.users.edit.company")} icon={<Building2 size={13} />}>
                <input name="company" defaultValue={user.company} placeholder={t("admin.users.edit.companyPlaceholder")} style={inputStyle} />
              </Field>
              <Field label={t("admin.users.edit.phone")} icon={<Phone size={13} />}>
                <input name="phone" defaultValue={user.phone} placeholder="+5511999990000" style={inputStyle} />
              </Field>
            </div>

            {/* Plano + Tokens + Contrato */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label={t("admin.users.edit.plan")} icon={<CreditCard size={13} />}>
                <select name="plan" defaultValue={user.plan} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="sem_plano">{t("admin.plans.sem_plano")}</option>
                  <option value="basico">{t("admin.plans.basico")}</option>
                  <option value="pro">{t("admin.plans.pro")}</option>
                </select>
              </Field>
              <Field label={t("admin.users.edit.tokens")} icon={<Coins size={13} />}>
                <input name="token_balance" type="number" defaultValue={user.token_balance} min={0} max={99999} style={inputStyle} />
              </Field>
              <Field label={t("admin.users.edit.contractStart")} icon={<CalendarDays size={13} />}>
                <input name="contract_start" type="date" defaultValue={user.contract_start} style={{ ...inputStyle, colorScheme: "dark" }} />
              </Field>
            </div>

            {/* Vigência do acesso */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 6 }}>
              <Field label={t("admin.users.edit.renewal")} icon={<CalendarDays size={13} />}>
                <input name="plan_renewal" type="date" defaultValue={user.plan_renewal} style={{ ...inputStyle, colorScheme: "dark" }} />
                <span style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: 4, display: "block" }}>
                  {t("admin.users.edit.renewalHint")}
                </span>
              </Field>
            </div>

            {/* Serviços */}
            <div>
              <p style={labelStyle}>{t("admin.users.edit.services")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {SERVICES.map((s) => {
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
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: msg.ok ? "var(--c-success)" : "var(--c-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                  {msg.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  {msg.text}
                </p>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/admin/usuarios" style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                {t("admin.users.edit.cancel")}
              </Link>
              <button
                type="submit"
                disabled={pending}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 9, border: "none", background: pending ? "var(--surface-2)" : "var(--cta-bg)", color: pending ? "var(--text-muted)" : "var(--cta-text)", fontSize: "13px", fontWeight: 700, cursor: pending ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {pending ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={13} />}
                {pending ? t("admin.users.edit.saving") : t("admin.users.edit.save")}
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
