"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageCircle, Mail, CreditCard, X, Lock, Loader2, ShieldCheck } from "lucide-react";
import { WHATSAPP_URL, CONTACT_EMAIL } from "@/app/lib/config";

interface Props {
  name?: string;
  planLabel?: string;
  renewalStr?: string;
}

/**
 * Tela de bloqueio quando a vigência do plano venceu (pagamento não efetuado).
 * Substitui o portal: o cliente pode falar com o suporte (WhatsApp/e-mail) ou
 * prosseguir para o pagamento (Stripe — hoje um placeholder). O FroptySentinel
 * assina a área de segurança/pagamento.
 */
export function PaymentDueScreen({ name, planLabel, renewalStr }: Props) {
  const [payOpen, setPayOpen] = useState(false);
  const firstName = name?.split(" ")[0];

  const subject = encodeURIComponent("Renovação do plano — Fropty Hub");
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}`;
  const wa = `${WHATSAPP_URL}?text=${encodeURIComponent("Olá! Quero renovar meu plano no Fropty Hub.")}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: 20 }} className="hub-bg-diagonal">
      <div className="hub-card" style={{ width: "100%", maxWidth: 460, padding: "34px 30px", textAlign: "center", position: "relative" }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", background: "color-mix(in srgb, var(--c-warning) 12%, transparent)", color: "var(--c-warning)" }}>
          <Lock size={26} />
        </div>

        <h1 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "var(--text)" }}>
          {firstName ? `${firstName}, ` : ""}sua vigência terminou
        </h1>
        <p style={{ margin: "0 0 4px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          O acesso ao portal fica disponível enquanto o {planLabel ? `plano ${planLabel} ` : "plano "}
          está vigente. {renewalStr ? `A vigência encerrou em ${renewalStr}.` : ""}
        </p>
        <p style={{ margin: "0 0 24px", fontSize: "13.5px", color: "var(--text-muted)", lineHeight: 1.55 }}>
          Para retomar o acesso, renove o pagamento ou fale com a nossa equipe.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            type="button"
            onClick={() => setPayOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            <CreditCard size={16} /> Prosseguir para o pagamento
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={wa} target="_blank" rel="noreferrer" style={secondaryBtn}>
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a href={mailto} style={secondaryBtn}>
              <Mail size={15} /> E-mail
            </a>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Image src="/sentinel-logo.png" alt="FroptySentinel" width={15} height={15} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "11px", color: "var(--text-faint)" }}>
            Pagamento protegido pelo <span style={{ color: "#ef4444", fontWeight: 700 }}>FroptySentinel</span>
          </span>
        </div>
      </div>

      {payOpen && <FakeStripeModal onClose={() => setPayOpen(false)} planLabel={planLabel} />}
    </div>
  );
}

/**
 * Placeholder do checkout (Stripe planejado). Estrutura pronta para plugar o
 * Stripe Checkout depois; hoje apenas informa que a integração está a caminho.
 */
function FakeStripeModal({ onClose, planLabel }: { onClose: () => void; planLabel?: string }) {
  const [loading, setLoading] = useState(false);

  function proceed() {
    setLoading(true);
    // TODO: criar sessão de checkout no Stripe e redirecionar.
    setTimeout(() => setLoading(false), 1400);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="hub-card" style={{ width: "100%", maxWidth: 400, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "13px", fontWeight: 800, color: "var(--text)" }}>
            <CreditCard size={15} /> Pagamento seguro
          </span>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", display: "flex" }}><X size={16} /></button>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, padding: "8px 12px", borderRadius: 9, background: "color-mix(in srgb, #ef4444 7%, transparent)", border: "1px solid color-mix(in srgb, #ef4444 20%, transparent)" }}>
            <Image src="/sentinel-logo.png" alt="FroptySentinel" width={16} height={16} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: "11.5px", fontWeight: 600, color: "var(--text-muted)" }}>
              Transação monitorada pelo <span style={{ color: "#ef4444", fontWeight: 700 }}>FroptySentinel</span>
            </span>
          </div>

          <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.55 }}>
            {planLabel ? `Renovação do plano ${planLabel}. ` : ""}O checkout será processado via <strong>Stripe</strong> — ambiente seguro e criptografado.
          </p>

          {/* Campo de cartão desabilitado (placeholder do Stripe Elements) */}
          <div style={{ opacity: 0.6, pointerEvents: "none" }}>
            <label style={fakeLabel}>Cartão</label>
            <div style={fakeField}>0000 0000 0000 0000</div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <div style={{ ...fakeField, flex: 1 }}>MM / AA</div>
              <div style={{ ...fakeField, width: 90 }}>CVC</div>
            </div>
          </div>

          <p style={{ margin: "12px 0 0", fontSize: "11px", color: "var(--text-faint)", display: "flex", alignItems: "center", gap: 5 }}>
            <ShieldCheck size={12} style={{ color: "var(--c-success)" }} /> Integração Stripe em preparação — nenhum dado é cobrado ainda.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text-muted)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Fechar</button>
          <button type="button" onClick={proceed} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, border: "none", background: "var(--primary)", color: "#fff", fontSize: "12.5px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {loading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <CreditCard size={13} />}
            {loading ? "Preparando…" : "Pagar com Stripe"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const secondaryBtn: React.CSSProperties = {
  flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  padding: "11px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)",
  color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, textDecoration: "none", fontFamily: "inherit",
};
const fakeLabel: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-faint)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" };
const fakeField: React.CSSProperties = { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--text-faint)", fontSize: "13px", fontFamily: "monospace" };
