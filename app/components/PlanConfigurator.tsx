"use client";

import { useState, useTransition } from "react";
import { submitQuote } from "@/app/actions/submitQuote";

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
  unit?: string;
  disclaimer?: string;
}

interface MaintenancePlan {
  id: string;
  label: string;
  tokens: number;
  price: number;
  highlight: boolean;
  savingsStrike?: string;
  savingsText?: string;
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
  { id: "multiuser", icon: "users", label: "Membro administrativo adicional", desc: "Cada novo membro do seu time que precisar de acesso ao painel administrativo é cobrado à parte.", tech: "Role-based access control", price: 129, type: "once", unit: "membro" },
  { id: "reports", icon: "chart-bar", label: "Relatórios e exportação", desc: "Baixe seus dados em PDF ou Excel quando quiser.", tech: "Exportação estruturada de dados", price: 89, type: "once" },
  { id: "whatsapp", icon: "brand-whatsapp", label: "Integração com WhatsApp", desc: "Notificações e confirmações automáticas via WhatsApp para seus clientes.", tech: "WhatsApp Business API", price: 119, type: "once" },
  { id: "backup", icon: "database", label: "Backup automático diário", desc: "Seus dados salvos todo dia, com restauração em caso de qualquer problema.", tech: "Backup incremental · retenção 30 dias", disclaimer: "* Sem esse recurso, a Fropty Apps não se responsabiliza por perda de dados.", price: 29, type: "month" },
  { id: "domain", icon: "world", label: "Domínio próprio", desc: "Seu app em seudominio.com.br em vez de seuapp.fropty.com. Setup incluso.", tech: "DNS · SSL · configuração completa", disclaimer: "* Sujeito à disponibilidade do domínio. O registro (~R$40/ano) é por conta do cliente.", price: 49, type: "once" },
  { id: "onboarding", icon: "school", label: "Treinamento e onboarding", desc: "Videochamada de até 1h ensinando você e sua equipe a usar o app.", tech: "Sessão gravada + material de apoio", price: 79, type: "once" },
  { id: "sourcecode", icon: "package", label: "Licença do código-fonte", desc: "Receba todos os arquivos do seu app. A partir daí, o código é seu.", tech: "Repositório GitHub transferido · você gerencia hospedagem", disclaimer: "* Inclui o código, mas não a infraestrutura (banco de dados, hospedagem, domínio).", price: 299, type: "once" },
];

const MAINTENANCE: MaintenancePlan[] = [
  { id: "m_basic", label: "Básico", tokens: 4, price: 49.90, highlight: false, savingsStrike: "R$ 1.200,00 avulso", savingsText: "Você economiza R$ 1.150,10" },
  { id: "m_pro", label: "Pro", tokens: 8, price: 89.90, highlight: true, savingsStrike: "R$ 2.400,00 avulso", savingsText: "Você economiza R$ 2.310,10" },
  { id: "m_none", label: "Sem plano", tokens: 0, price: 0, highlight: false },
];

function formatPrice(val: number): string {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PlanConfigurator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [maintenance, setMaintenance] = useState("m_none");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allAddonIds = ADDONS.map(a => a.id);
  const allSelected = allAddonIds.every(id => selected.has(id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allAddonIds));
  };

  const selectedAddons = ADDONS.filter((a) => selected.has(a.id));
  const onceTotal = BASE_PRICE + selectedAddons.filter(a => a.type === "once").reduce((s, a) => s + a.price, 0);
  const monthExtra = selectedAddons.filter(a => a.type === "month").reduce((s, a) => s + a.price, 0);
  const mPlan = MAINTENANCE.find(m => m.id === maintenance);
  const monthTotal = (mPlan?.price || 0) + monthExtra;
  const firstMonthTotal = onceTotal + monthTotal;

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || isPending) return;
    setSubmitError(null);

    const addonNames = selectedAddons.map(a => a.label).join(", ") || "nenhum";
    const maintenanceName = mPlan?.price ? mPlan.label : "sem plano";
    const ideia = `Pedido via configurador de planos.\nExtras: ${addonNames}.\nManutenção: ${maintenanceName}.\nTotal único: ${formatPrice(onceTotal)}${monthTotal > 0 ? ` + ${formatPrice(monthTotal)}/mês` : ""}.`;

    startTransition(async () => {
      const result = await submitQuote({ nome: name.trim(), email: email.trim(), ideia });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  if (submitted) {
    return (
      <div style={{ padding: "64px 16px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ marginBottom: 16 }}>
          <i className="ti ti-circle-check" style={{ fontSize: "48px", color: "#16a34a" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Orçamento enviado!</h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 400, margin: "0 auto" }}>
          Recebemos seu pedido, <strong>{name}</strong>. Entraremos em contato em breve no e-mail <strong>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* LEFT COLUMN */}
        <div className="flex-[2] min-w-0 space-y-6">

          {/* App base */}
          <div style={{ background: "var(--surface)", borderRadius: 16, border: "2px solid var(--primary)", padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="ti ti-rocket" style={{ fontSize: "18px", color: "var(--primary)" }} />
                  App completo
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
                  Login, banco de dados, deploy, 1 rodada de ajustes. Tudo funcionando.
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", whiteSpace: "nowrap", marginLeft: 16 }}>{formatPrice(BASE_PRICE)}</div>
            </div>
            <div style={{ fontSize: 11, color: "#b45309", fontWeight: 700, marginTop: 8 }}>
              O plano base não inclui backup automático. Recomendamos fortemente a contratação do add-on de backup.
            </div>
          </div>

          {/* Addons */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="ti ti-plus" style={{ fontSize: "16px", color: "var(--primary)" }} />
                Adicione recursos ao seu app
              </div>
              <button
                onClick={toggleAll}
                style={{
                  fontSize: 11, fontWeight: 600,
                  color: allSelected ? "#ef4444" : "var(--primary)",
                  background: "transparent",
                  border: `1px solid ${allSelected ? "#ef4444" : "var(--primary)"}`,
                  borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                  transition: "all 0.18s", whiteSpace: "nowrap",
                }}
              >
                {allSelected ? "Limpar seleção" : "Selecionar todos"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 10 }}>
              {ADDONS.map((addon) => {
                const active = selected.has(addon.id);
                return (
                  <div
                    key={addon.id}
                    onClick={() => toggle(addon.id)}
                    className="hover:scale-[1.02] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                    style={{
                      background: active ? "rgba(91,87,232,0.12)" : "var(--card-bg)",
                      border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      borderRadius: 12, padding: "14px 16px", cursor: "pointer",
                      transition: "all 0.18s", display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: active ? "var(--primary)" : "var(--bg-alt)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}>
                      <i className={`ti ti-${addon.icon}`} style={{ fontSize: "18px", color: active ? "#fff" : "var(--primary)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{addon.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: active ? "var(--primary)" : "var(--text-muted)", marginLeft: 8, whiteSpace: "nowrap" }}>
                          + {formatPrice(addon.price)}{addon.type === "month" ? "/mês" : addon.unit ? `/${addon.unit}` : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{addon.desc}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", fontStyle: "italic", marginTop: 3 }}>{addon.tech}</div>
                      {addon.disclaimer && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4, lineHeight: 1.4 }}>{addon.disclaimer}</div>}
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      background: active ? "var(--primary)" : "var(--border)",
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

          {/* Maintenance */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-tool" style={{ fontSize: "16px", color: "var(--primary)" }} />
              Plano de manutenção mensal
              <span style={{ background: "rgba(239,159,39,0.15)", color: "var(--accent)", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                Fidelidade mínima: 3 meses
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 items-stretch" style={{ gap: 10 }}>
              {MAINTENANCE.map((m) => {
                const active = maintenance === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMaintenance(m.id)}
                    className="hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
                    style={{
                      background: active ? (m.highlight ? "var(--primary)" : "rgba(91,87,232,0.12)") : "var(--card-bg)",
                      border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      borderRadius: 12, padding: "14px 16px",
                      cursor: "pointer", textAlign: "center",
                      transition: "all 0.18s", position: "relative",
                      display: "flex", flexDirection: "column", justifyContent: "center",
                    }}
                  >
                    {m.highlight && (
                      <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "var(--accent)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>Mais popular</div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: active ? (m.highlight ? "#fff" : "var(--primary)") : "var(--text)" }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: active ? (m.highlight ? "rgba(255,255,255,0.8)" : "var(--primary)") : "var(--text-muted)", marginTop: 2 }}>
                      {m.tokens > 0 ? `${m.tokens} tokens/mês` : "sem tokens"}
                    </div>
                    <div style={{ fontSize: m.price > 0 ? 18 : 13, fontWeight: m.price > 0 ? 800 : 400, color: active ? (m.highlight ? "#fff" : "var(--primary)") : (m.price > 0 ? "var(--text)" : "var(--text-faint)"), marginTop: 6 }}>
                      {m.price > 0 ? (
                        <>{formatPrice(m.price)}<span style={{ fontSize: 11, fontWeight: 400, color: active ? (m.highlight ? "rgba(255,255,255,0.7)" : "var(--text-muted)") : "var(--text-faint)" }}>/mês</span></>
                      ) : "sem mensalidade"}
                    </div>
                    {m.savingsStrike && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${active ? (m.highlight ? "rgba(255,255,255,0.2)" : "var(--border)") : "var(--border)"}` }}>
                        <div style={{ textDecoration: "line-through", color: "rgba(239,68,68,0.65)", fontSize: 11 }}>{m.savingsStrike}</div>
                        <div style={{ color: "#16a34a", fontWeight: 700, fontSize: 12, marginTop: 2 }}>{m.savingsText}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, fontStyle: "italic" }}>
              Tokens são usados para suporte, ajustes visuais, correções ou edições de conteúdo. Não acumulam entre os meses.
            </div>
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1.5px solid #f59e0b", borderRadius: 12, padding: "12px 14px", marginTop: 10 }}>
              <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6, margin: 0 }}>
                <strong>Fidelidade mínima: 3 meses.</strong> Cancelamento antecipado sujeito ao pagamento da diferença entre os tokens utilizados e o valor avulso (<strong>R$ 300,00/token</strong>).
              </p>
              <p style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6, margin: "8px 0 0" }}>
                <strong>Reativação:</strong> clientes que cancelaram pagam <strong>R$ 79,90</strong> no primeiro mês de retorno.
              </p>
            </div>
          </div>

          {maintenance === "m_none" && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1.5px solid #ef4444", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <i className="ti ti-alert-circle" style={{ color: "#ef4444", fontSize: 20, flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, color: "#991b1b", fontWeight: 700, margin: "0 0 4px" }}>Sem plano, sem suporte após a entrega.</p>
                <p style={{ fontSize: 12, color: "#b91c1c", lineHeight: 1.5, margin: 0 }}>
                  Tokens avulsos custam <strong>R$ 300,00 cada</strong>. Assinantes pagam apenas <strong>R$ 150,00 por token extra</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Summary + Form */}
        <div className="w-full lg:flex-1 lg:sticky" style={{ top: 24 }}>
          <div style={{ background: "var(--surface)", borderRadius: 16, padding: "22px 24px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 14 }}>Resumo do seu plano</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>App base</span>
                <span style={{ color: "var(--text)" }}>{formatPrice(BASE_PRICE)}</span>
              </div>
              {selectedAddons.filter(a => a.type === "once").map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <i className={`ti ti-${a.icon}`} style={{ fontSize: "12px" }} />
                    {a.label}
                  </span>
                  <span style={{ color: "var(--text)" }}>+ {formatPrice(a.price)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>Total do app</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: "var(--accent)" }}>{formatPrice(onceTotal)}</span>
              </div>
              {monthTotal > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10 }}>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 6 }}>Recorrente mensal</div>
                  {mPlan && mPlan.price > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-muted)" }}>Manutenção {mPlan.label}</span>
                      <span style={{ color: "var(--text)" }}>+ {formatPrice(mPlan.price)}</span>
                    </div>
                  )}
                  {selectedAddons.filter(a => a.type === "month").map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "var(--text-muted)" }}>{a.label}</span>
                      <span style={{ color: "var(--text)" }}>+ {formatPrice(a.price)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)" }}>Total mensal</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: "#60a5fa" }}>{formatPrice(monthTotal)}/mês</span>
                  </div>
                </div>
              )}
              {monthTotal > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>Total geral (1º mês)</span>
                    <span style={{ fontWeight: 800, fontSize: 20, color: "var(--accent)" }}>{formatPrice(firstMonthTotal)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6, textAlign: "right" }}>
                    A partir do 2º mês: apenas {formatPrice(monthTotal)}/mês
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Seus dados:</div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                disabled={isPending}
                className="transition duration-150 focus:border-[#5B57E8] focus:ring-2 focus:ring-[#5B57E8]/25"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", opacity: isPending ? 0.6 : 1 }}
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                type="email"
                disabled={isPending}
                className="transition duration-150 focus:border-[#5B57E8] focus:ring-2 focus:ring-[#5B57E8]/25"
                style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", opacity: isPending ? 0.6 : 1 }}
              />

              {submitError && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#ef4444" }}>
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !email.trim() || isPending}
                style={{
                  background: name.trim() && email.trim() && !isPending ? "var(--primary)" : "var(--border)",
                  color: "#fff", border: "none", borderRadius: 10,
                  padding: "12px", fontSize: 14, fontWeight: 700,
                  cursor: name.trim() && email.trim() && !isPending ? "pointer" : "not-allowed",
                  transition: "all 0.2s", marginTop: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {isPending ? (
                  <>
                    <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }} />
                    Enviando...
                  </>
                ) : "Solicitar orçamento com esse plano →"}
              </button>
              <div style={{ fontSize: 11, color: "var(--text-faint)", textAlign: "center" }}>
                Sem compromisso. Entraremos em contato em até 48h.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
