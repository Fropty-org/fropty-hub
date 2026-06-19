"use client";

import { useRef, useState, useTransition } from "react";

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  issues: string[];
}

function analyzePassword(password: string): PasswordStrength {
  const issues: string[] = [];
  if (password.length < 10)          issues.push("mínimo 10 caracteres");
  if (!/[A-Z]/.test(password))       issues.push("pelo menos 1 letra maiúscula");
  if (!/[a-z]/.test(password))       issues.push("pelo menos 1 letra minúscula");
  if (!/[0-9]/.test(password))       issues.push("pelo menos 1 número");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("pelo menos 1 caractere especial (!@#$%...)");

  const score = Math.max(0, 4 - issues.length) as 0 | 1 | 2 | 3 | 4;
  const levels: { label: string; color: string }[] = [
    { label: "Muito fraca",  color: "#ef4444" },
    { label: "Fraca",        color: "#f97316" },
    { label: "Razoável",     color: "#EF9F27" },
    { label: "Boa",          color: "#84cc16" },
    { label: "Forte",        color: "#22c55e" },
  ];
  return { score, issues, ...levels[score] };
}

export default function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg]                = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPwd, setNewPwd]          = useState("");
  const formRef                      = useRef<HTMLFormElement>(null);

  const strength = newPwd ? analyzePassword(newPwd) : null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd       = new FormData(e.currentTarget);
    const current  = fd.get("current_password") as string;
    const next     = fd.get("new_password") as string;
    const confirm  = fd.get("confirm_password") as string;

    if (!current || !next || !confirm) {
      setMsg({ type: "error", text: "Preencha todos os campos." });
      return;
    }
    if (next !== confirm) {
      setMsg({ type: "error", text: "Nova senha e confirmação não conferem." });
      return;
    }
    const analysis = analyzePassword(next);
    if (analysis.issues.length > 0) {
      setMsg({ type: "error", text: "Senha não atende aos requisitos: " + analysis.issues.join(", ") + "." });
      return;
    }

    startTransition(async () => {
      // Importação dinâmica para não vazar credenciais no bundle server
      const { changePassword } = await import("@/app/actions/profile");
      const result = await changePassword(fd);
      if (result.success) {
        setMsg({ type: "success", text: result.success });
        formRef.current?.reset();
        setNewPwd("");
      } else {
        setMsg({ type: "error", text: result.error ?? "Erro desconhecido." });
      }
    });
  }

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "28px 28px 24px" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
        <i className="ti ti-lock" style={{ marginRight: 8 }} />
        Alterar senha
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 420 }}>
        {/* Senha atual */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Senha atual
          </label>
          <input
            type="password"
            name="current_password"
            required
            autoComplete="current-password"
            placeholder="••••••••••"
            style={inputStyle}
          />
        </div>

        {/* Nova senha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Nova senha
          </label>
          <input
            type="password"
            name="new_password"
            required
            autoComplete="new-password"
            placeholder="••••••••••"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            style={inputStyle}
          />

          {/* Medidor de força */}
          {newPwd && strength && (
            <div>
              <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: 4, borderRadius: 999,
                      background: i < strength.score ? strength.color : "var(--border)",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: strength.color, fontWeight: 600 }}>
                {strength.label}
              </p>
              {strength.issues.length > 0 && (
                <ul style={{ margin: "6px 0 0", paddingLeft: 16, fontSize: "11px", color: "var(--text-faint)", lineHeight: 1.7 }}>
                  {strength.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Confirmar nova senha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Confirmar nova senha
          </label>
          <input
            type="password"
            name="confirm_password"
            required
            autoComplete="new-password"
            placeholder="••••••••••"
            style={inputStyle}
          />
        </div>

        {/* Política */}
        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-faint)", background: "var(--surface)", borderRadius: 8, padding: "10px 12px", lineHeight: 1.7 }}>
          <i className="ti ti-info-circle" style={{ marginRight: 5 }} />
          A senha deve ter no mínimo 10 caracteres, com letras maiúsculas e minúsculas, um número e um caractere especial.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
          <button
            type="submit"
            disabled={isPending || (!!newPwd && !!strength && strength.issues.length > 0)}
            style={{
              padding: "10px 22px", borderRadius: 9, border: "none",
              background: "#185FA5", color: "#fff",
              fontSize: "13px", fontWeight: 700,
              cursor: (isPending || (!!newPwd && !!strength && strength.issues.length > 0)) ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: (isPending || (!!newPwd && !!strength && strength.issues.length > 0)) ? 0.6 : 1,
            }}
          >
            <i className="ti ti-lock-check" style={{ marginRight: 6 }} />
            {isPending ? "Alterando…" : "Alterar senha"}
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
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 9,
  color: "var(--text)",
  padding: "10px 14px",
  fontSize: "14px",
  fontFamily: "inherit",
  outline: "none",
};
