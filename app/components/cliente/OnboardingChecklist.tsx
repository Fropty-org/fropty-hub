"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { CheckCircle, Circle, X, Loader2 } from "lucide-react";
import { dismissOnboarding } from "@/app/actions/profile";
import type { OnboardingStep } from "@/app/lib/onboarding";

interface Props {
  steps: OnboardingStep[];
}

export function OnboardingChecklist({ steps }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [pending, start]          = useTransition();

  const completedCount = steps.filter((s) => s.completed).length;
  const progress       = Math.round((completedCount / steps.length) * 100);

  function handleDismiss() {
    start(async () => {
      await dismissOnboarding();
      setDismissed(true);
    });
  }

  if (dismissed) return null;

  return (
    <div style={{
      background:   "var(--surface)",
      border:       "1px solid var(--primary)",
      borderRadius: 14,
      padding:      "20px 22px",
      marginBottom: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 800, color: "var(--text)" }}>
            Bem-vindo ao Fropty Hub!
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-faint)" }}>
            Complete os passos abaixo para tirar o máximo da plataforma.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          disabled={pending}
          title="Dispensar"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-faint)", padding: 4, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: pending ? 0.5 : 1,
          }}
        >
          {pending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <X size={14} />}
        </button>
      </div>

      {/* Barra de progresso */}
      <div style={{
        height: 5, borderRadius: 999,
        background: "var(--border)",
        marginBottom: 16, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 999,
          background: "var(--primary)",
          width: `${progress}%`,
          transition: "width 0.4s ease",
        }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step.completed
              ? <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
              : <Circle      size={16} style={{ color: "var(--border)", flexShrink: 0 }} />}
            {step.href && !step.completed ? (
              <Link href={step.href} style={{
                fontSize: "13px", color: "var(--text-muted)", textDecoration: "none",
                fontWeight: step.completed ? 400 : 600,
              }}>
                {step.label}
              </Link>
            ) : (
              <span style={{
                fontSize: "13px",
                color:    step.completed ? "var(--text-faint)" : "var(--text-muted)",
                textDecoration: step.completed ? "line-through" : "none",
                fontWeight: step.completed ? 400 : 600,
              }}>
                {step.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <p style={{ margin: "12px 0 0", fontSize: "11px", color: "var(--text-faint)" }}>
        {completedCount} de {steps.length} concluídos
      </p>
    </div>
  );
}
