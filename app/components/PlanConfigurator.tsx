"use client";

import { useState } from "react";

const BASE_PRICE = 499;

type AddonType = "once" | "month";

interface Addon {
  id: string;
  icon: string;
  label: string;
  desc: string;
  tech: string;
  price: number;
  type: AddonType;
  disclaimer?: string;
}

interface MaintenancePlan {
  id: string;
  label: string;
  tokens: number;
  price: number;
  highlight: boolean;
}

export interface PlanSummary {
  name: string;
  email: string;
  base: number;
  addons: { label: string; price: number; type: string }[];
  maintenance: MaintenancePlan | undefined;
  onceTotal: number;
  monthTotal: number;
}

const ADDONS: Addon[] = [
  { id: "google_auth", icon: "lock", label: "Login com Google", desc: "Seus usuários entram com um clique, sem criar senha.", tech: "Google OAuth 2.0", price: 79, type: "once" },
  { id: "admin", icon: "tool", label: "Painel administrativo", desc: "Gerencie conteúdo, usuários e dados sem precisar de programador.", tech: "Dashboard com controle de acesso", price: 149, type: "once" },
  { id: "push", icon: "bell", label: "Notificações push", desc: "Avise seus clientes sobre novidades, pedidos ou lembretes direto no celular.", tech: "FCM / PWA Notifications", price: 99, type: "once" },
  { id: "multiuser", icon: "users", label: "Múltiplos perfis de acesso", desc: "Defina quem pode ver e editar o que, perfeito pra times ou franquias.", tech: "Role-based access control", price: 129, type: "once" },
  { id: "reports", icon: "chart-bar", label: "Relatórios e exportação", desc: "Baixe seus dados em PDF ou Excel quando quiser.", tech: "Exportação estruturada de dados", price: 89, type: "once" },
  { id: "whatsapp", icon: "brand-whatsapp", label: "Integração com WhatsApp", desc: "Notificações e confirmações automáticas via WhatsApp para seus clientes.", tech: "WhatsApp Business API", price: 119, type: "once" },
  { id: "backup", icon: "database", label: "Backup automático diário", desc: "Seus dados salvos todo dia, com restauração em caso de qualquer problema.", tech: "Backup incremental · retenção 30 dias", price: 29, type: "month" },
  { id: "domain", icon: "world", label: "Domínio próprio", desc: "Seu app em seudominio.com.br em vez de seuapp.fropty.com. Setup incluso.", tech: "DNS · SSL · configuração completa", disclaimer: "* Sujeito à disponibilidade do domínio. O registro é por conta do cliente (~R$40/ano).", price: 49, type: "once" },
  { id: "onboarding", icon: "school", label: "Treinamento e onboarding", desc: "Videochamada de até 1h ensinando você e sua equipe a usar o app.", tech: "Sessão gravada + material de apoio", price: 79, type: "once" },
  { id: "sourcecode", icon: "package", label: "Licença do código-fonte", desc: "Receba todos os arquivos do seu app. A partir daí, o código é seu.", tech: "Repositório GitHub transferido · você gerencia hospedagem", disclaimer: "* Inclui o código, mas não a infraestrutura (banco de dados, hospedagem, domínio).", price: 299, type: "once" },
];

const MAINTENANCE: MaintenancePlan[] = [
  { id: "m_basic", label: "Básico", tokens: 4, price: 49.90, highlight: false },
  { id: "m_pro", label: "Pro", tokens: 8, price: 89.90, highlight: true },
  { id: "m_none", label: "Sem plano", tokens: 0, price: 0, highlight: false },
];

function formatPrice(val: number): string {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Props {
  onSubmit?: (summary: PlanSummary) => void;
}

export default function PlanConfigurator({ onSubmit }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [maintenance, setMaintenance] = useState("m_none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedAddons = ADDONS.filter((a) => selected.has(a.id));
  const onceTotal = BASE_PRICE + selectedAddons.filter(a => a.type === "once").reduce((s, a) => s + a.price, 0);
  const monthExtra = selectedAddons.filter(a => a.type === "month").reduce((s, a) => s + a.price, 0);
  const mPlan = MAINTENANCE.find(m => m.id === maintenance);
  const monthTotal = (mPlan?.price || 0) + monthExtra;

  const handleSubmit = () => {
    if (!name || !email) return;
    const summary: PlanSummary = {
      name,
      email,
      base: BASE_PRICE,
      addons: selectedAddons.map(a => ({ label: a.label, price: a.price, type: a.type })),
      maintenance: mPlan,
      onceTotal,
      monthTotal,
    };
    if (onSubmit) onSubmit(summary);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ padding: "64px 16px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ marginBottom: 16 }}>
          <i className="ti ti-circle-check" style={{ fontSize: "48px", color: "#16a34a" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Orçamento enviado!</h2>
        <p style={{ fontSize: 15, color: "#64748b", maxWidth: 400, margin: "0 auto" }}>
          Recebemos seu pedido, <strong>{name}</strong>. Entraremos em contato em breve no e-mail <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>

          {/* base */}
          <div style={{ background: "#fff", borderRadius: 16, border: "2px solid #185FA5", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-rocket" style={{ fontSize: "18px", color: "#185FA5" }} />
                  App completo
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>Login, banco de dados, deploy, 1 rodada de ajustes. Tudo funcionando.</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#185FA5", whiteSpace: "nowrap", marginLeft: 16 }}>{formatPrice(BASE_PRICE)}</div>
            </div>
          </div>

          {/* addons */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-plus" style={{ fontSize: "16px", color: "#185FA5" }} />
              Adicione recursos ao seu app
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 10 }}>
              {ADDONS.map((addon) => {
                const active = selected.has(addon.id);
                return (
                  <div key={addon.id} onClick={() => toggle(addon.id)} style={{
                    background: active ? "#EBF4FF" : "#fff",
                    border: `1.5px solid ${active ? "#185FA5" : "#e2e8f0"}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: active ? "#185FA5" : "#f1f5f9",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}>
                      <i className={`ti ti-${addon.icon}`} style={{ fontSize: "18px", color: active ? "#fff" : "#185FA5" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{addon.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#185FA5" : "#64748b", marginLeft: 8, whiteSpace: "nowrap" }}>
                          + {formatPrice(addon.price)}{addon.type === "month" ? "/mês" : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.5 }}>{addon.desc}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 3 }}>{addon.tech}</div>
                      {addon.disclaimer && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4, lineHeight: 1.4 }}>{addon.disclaimer}</div>}
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      background: active ? "#185FA5" : "#e2e8f0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {active && <i className="ti ti-check" style={{ color: "#fff", fontSize: "10px" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* maintenance */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-tool" style={{ fontSize: "16px", color: "#185FA5" }} />
              Plano de manutenção mensal
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {MAINTENANCE.map((m) => {
                const active = maintenance === m.id;
                return (
                  <div key={m.id} onClick={() => setMaintenance(m.id)} style={{
                    background: active ? (m.highlight ? "#185FA5" : "#EBF4FF") : "#fff",
                    border: `1.5px solid ${active ? "#185FA5" : "#e2e8f0"}`,
                    borderRadius: 12, padding: "14px 16px",
                    cursor: "pointer", textAlign: "center",
                    transition: "all 0.18s", position: "relative",
                  }}>
                    {m.highlight && (
                      <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#EF9F27", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>Mais popular</div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: active ? (m.highlight ? "#fff" : "#185FA5") : "#0f172a" }}>{m.label}</div>
                    {m.tokens > 0 && (
                      <div style={{ fontSize: 11, color: active ? (m.highlight ? "#bfdbfe" : "#185FA5") : "#64748b", marginTop: 2 }}>{m.tokens} tokens/mês</div>
                    )}
                    {m.price > 0 && (
                      <div style={{ fontSize: 18, fontWeight: 800, color: active ? (m.highlight ? "#fff" : "#185FA5") : "#0f172a", marginTop: 6 }}>
                        {formatPrice(m.price)}
                        <span style={{ fontSize: 11, fontWeight: 400, color: active ? (m.highlight ? "#bfdbfe" : "#64748b") : "#94a3b8" }}>/mês</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8, fontStyle: "italic" }}>
              Tokens são usados para suporte, ajustes visuais, correções ou edições de conteúdo. Não acumulam entre os meses.
            </div>
          </div>

          {/* summary */}
          <div style={{ background: "#0f172a", borderRadius: 16, padding: "22px 24px", color: "#fff" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 14 }}>Resumo do seu plano</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#cbd5e1" }}>App base</span>
                <span>{formatPrice(BASE_PRICE)}</span>
              </div>
              {selectedAddons.filter(a => a.type === "once").map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 4 }}>
                    <i className={`ti ti-${a.icon}`} style={{ fontSize: "12px" }} />
                    {a.label}
                  </span>
                  <span>+ {formatPrice(a.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>Total do app</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "#EF9F27" }}>{formatPrice(onceTotal)}</span>
              </div>
              {monthTotal > 0 && (
                <div style={{ borderTop: "1px solid #334155", marginTop: 4, paddingTop: 10 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Recorrente mensal</div>
                  {mPlan && mPlan.price > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#cbd5e1" }}>Manutenção {mPlan.label}</span>
                      <span>+ {formatPrice(mPlan.price)}</span>
                    </div>
                  )}
                  {selectedAddons.filter(a => a.type === "month").map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 4 }}>
                        <i className={`ti ti-${a.icon}`} style={{ fontSize: "12px" }} />
                        {a.label}
                      </span>
                      <span>+ {formatPrice(a.price)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontWeight: 700 }}>Total mensal</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#60a5fa" }}>{formatPrice(monthTotal)}/mês</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid #334155", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Pronto? Me conta quem você é:</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "system-ui", outline: "none" }}
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                type="email"
                style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "system-ui", outline: "none" }}
              />
              <button
                onClick={handleSubmit}
                disabled={!name || !email}
                style={{
                  background: name && email ? "#185FA5" : "#334155",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px", fontSize: 14, fontWeight: 700,
                  cursor: name && email ? "pointer" : "not-allowed",
                  transition: "background 0.2s",
                  marginTop: 4,
                }}
              >
                Solicitar orçamento com esse plano →
              </button>
              <div style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>
                Sem compromisso. Entraremos em contato em até 48h.
              </div>
            </div>
          </div>

        </div>
    </div>
  );
}
