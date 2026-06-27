"use client";

import { useState, useTransition } from "react";
import { submitQuote } from "@/app/actions/submitQuote";
import { SERVICE_TYPES, ADDONS, MAINTENANCE, type MaintenancePlan } from "@/app/lib/data/configurador";
import { CheckCircle, Layers, Info, Plus, Check, Wrench, AlertCircle, Receipt, Loader2, ArrowRight } from "lucide-react";

export interface PlanSummary {
  name: string;
  email: string;
  base: number;
  addons: { label: string; price: number; type: string }[];
  maintenance: MaintenancePlan | undefined;
  onceTotal: number;
  monthTotal: number;
}

function formatPrice(val: number): string {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FONT = "var(--font-dm-sans), sans-serif";

export default function PlanConfigurator() {
  const [serviceId, setServiceId] = useState<string>("app_mobile");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [maintenance, setMaintenance] = useState("m_none");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const service = SERVICE_TYPES.find(s => s.id === serviceId) ?? SERVICE_TYPES[0];
  const BASE_PRICE = service.price;

  const allAddonIds = ADDONS.map(a => a.id);
  const allSelected = allAddonIds.every(id => selected.has(id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
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
    const ideia = `Pedido via configurador de planos.\nTipo: ${service.label}.\nExtras: ${addonNames}.\nManutenção: ${maintenanceName}.\nTotal único: ${formatPrice(onceTotal)}${monthTotal > 0 ? ` + ${formatPrice(monthTotal)}/mês` : ""}.`;

    startTransition(async () => {
      const result = await submitQuote({
        nome: name.trim(),
        telefone: phone.trim() || undefined,
        email: email.trim(),
        ideia,
        servicoTipo: service.label,
      });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error);
      }
    });
  };

  if (submitted) {
    return (
      <div style={{ padding: "72px 16px", textAlign: "center", fontFamily: FONT }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
            background: "rgba(91,87,232,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <CheckCircle size={36} style={{ color: "var(--primary)" }} />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>
          Orçamento enviado!
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
          Recebemos seu pedido, <strong style={{ color: "var(--text)" }}>{name}</strong>. Entraremos em contato em breve no e-mail{" "}
          <strong style={{ color: "var(--primary)" }}>{email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: FONT }}>
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Coluna esquerda ─────────────────────────────────────── */}
        <div className="flex-[2] min-w-0 space-y-6">

          {/* Tipo de projeto */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={16} style={{ color: "var(--primary)" }} />
              Que tipo de projeto você precisa?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))", gap: 10 }}>
              {SERVICE_TYPES.map((svc) => {
                const active = serviceId === svc.id;
                return (
                  <div
                    key={svc.id}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => setServiceId(svc.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setServiceId(svc.id); } }}
                    className="clickable-card"
                    style={{
                      background: active ? "rgba(91,87,232,0.1)" : "var(--card-bg)",
                      border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      borderRadius: 14, padding: "14px 16px",
                      transition: "all 0.18s", display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: active ? "var(--primary)" : "rgba(91,87,232,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}>
                      <svc.Icon size={17} color={active ? "#fff" : "var(--primary)"} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{svc.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{svc.desc}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? "var(--primary)" : "var(--text-faint)", marginTop: 6 }}>
                        a partir de {formatPrice(svc.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projeto selecionado — base */}
          <div
            style={{
              background: "rgba(91,87,232,0.06)",
              borderRadius: 16,
              border: "2px solid var(--primary)",
              padding: "20px 22px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                  <service.Icon size={16} color="var(--primary)" />
                  {service.label} completo
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                  {service.desc}. Inclui deploy, 1 rodada de ajustes e tudo funcionando.
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)", whiteSpace: "nowrap" }}>
                {formatPrice(BASE_PRICE)}
              </div>
            </div>
            <div
              style={{
                fontSize: 12, color: "var(--text-faint)",
                marginTop: 10, paddingTop: 10,
                borderTop: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Info size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
              O plano base não inclui backup automático. Recomendamos o add-on de backup.
            </div>
          </div>

          {/* Addons */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={16} style={{ color: "var(--primary)" }} />
                Adicione recursos ao seu projeto
              </div>
              <button
                onClick={toggleAll}
                style={{
                  fontSize: 11, fontWeight: 600,
                  color: allSelected ? "var(--text-muted)" : "var(--primary)",
                  background: "transparent",
                  border: `1px solid ${allSelected ? "var(--border)" : "rgba(91,87,232,0.4)"}`,
                  borderRadius: 20, padding: "3px 12px", cursor: "pointer",
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
                    role="checkbox"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => toggle(addon.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(addon.id); } }}
                    className="clickable-card"
                    style={{
                      background: active ? "rgba(91,87,232,0.1)" : "var(--card-bg)",
                      border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      borderRadius: 14, padding: "14px 16px",
                      transition: "all 0.18s", display: "flex", gap: 12, alignItems: "flex-start",
                    }}
                  >
                    <div style={{
                      width: 38, height: 38, borderRadius: 11,
                      background: active ? "var(--primary)" : "rgba(91,87,232,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.18s",
                    }}>
                      <addon.Icon size={18} color={active ? "#fff" : "var(--primary)"} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{addon.label}</div>
                        <div style={{
                          fontSize: 12, fontWeight: 700,
                          color: active ? "var(--primary)" : "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}>
                          + {formatPrice(addon.price)}{addon.type === "month" ? "/mês" : addon.unit ? `/${addon.unit}` : ""}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.5 }}>{addon.desc}</div>
                      <div style={{ fontSize: 10, color: "var(--text-faint)", fontStyle: "italic", marginTop: 3 }}>{addon.tech}</div>
                      {addon.disclaimer && (
                        <div
                          style={{
                            fontSize: 11, color: "var(--text-faint)",
                            marginTop: 6, lineHeight: 1.4,
                            display: "flex", alignItems: "flex-start", gap: 4,
                          }}
                        >
                          <Info size={12} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
                          {addon.disclaimer}
                        </div>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 2,
                      background: active ? "var(--primary)" : "transparent",
                      border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {active && <Check size={11} style={{ color: "#fff" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manutenção */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Wrench size={16} style={{ color: "var(--primary)" }} />
              Plano de manutenção mensal
              <span
                style={{
                  background: "rgba(91,87,232,0.1)",
                  color: "var(--primary)",
                  fontSize: 10, fontWeight: 700,
                  padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap",
                  border: "1px solid rgba(91,87,232,0.2)",
                }}
              >
                Fidelidade mínima: 3 meses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-stretch" style={{ gap: 10 }}>
              {MAINTENANCE.map((m) => {
                const active = maintenance === m.id;
                const isHighlight = m.highlight && active;
                return (
                  <div
                    key={m.id}
                    role="radio"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => setMaintenance(m.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMaintenance(m.id); } }}
                    className="clickable-card"
                    style={{
                      background: isHighlight ? "var(--primary)" : active ? "rgba(91,87,232,0.08)" : "var(--card-bg)",
                      border: `1.5px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                      borderRadius: 14, padding: "16px",
                      textAlign: "center",
                      transition: "all 0.18s", position: "relative",
                      display: "flex", flexDirection: "column", justifyContent: "center", gap: 4,
                    }}
                  >
                    {m.highlight && (
                      <div style={{
                        position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                        background: "var(--accent)", color: "#fff",
                        fontSize: 9, fontWeight: 700, padding: "2px 10px", borderRadius: 20, whiteSpace: "nowrap",
                      }}>
                        Mais popular
                      </div>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 800, color: isHighlight ? "#fff" : active ? "var(--primary)" : "var(--text)" }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: 11, color: isHighlight ? "rgba(255,255,255,0.8)" : "var(--text-muted)" }}>
                      {m.tokens > 0 ? `${m.tokens} tokens/mês` : "sem tokens"}
                    </div>
                    <div style={{
                      fontSize: m.price > 0 ? 20 : 13,
                      fontWeight: m.price > 0 ? 800 : 400,
                      color: isHighlight ? "#fff" : active ? "var(--primary)" : m.price > 0 ? "var(--text)" : "var(--text-faint)",
                      marginTop: 4,
                    }}>
                      {m.price > 0 ? (
                        <>
                          {formatPrice(m.price)}
                          <span style={{ fontSize: 11, fontWeight: 400, color: isHighlight ? "rgba(255,255,255,0.7)" : "var(--text-faint)" }}>
                            /mês
                          </span>
                        </>
                      ) : "sem mensalidade"}
                    </div>
                    {m.savingsStrike && (
                      <div style={{
                        marginTop: 8, paddingTop: 8,
                        borderTop: `1px solid ${isHighlight ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
                      }}>
                        <div style={{
                          textDecoration: "line-through",
                          color: isHighlight ? "rgba(255,255,255,0.45)" : "var(--text-faint)",
                          fontSize: 11,
                        }}>
                          {m.savingsStrike}
                        </div>
                        <div style={{
                          color: isHighlight ? "rgba(255,255,255,0.9)" : "var(--primary)",
                          fontWeight: 700, fontSize: 12, marginTop: 2,
                        }}>
                          {m.savingsText}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 8, fontStyle: "italic" }}>
              Tokens são usados para suporte, ajustes visuais, correções ou edições de conteúdo. Não acumulam entre os meses.
            </div>

            {/* Aviso de fidelidade */}
            <div
              style={{
                background: "rgba(91,87,232,0.06)",
                border: "1px solid rgba(91,87,232,0.18)",
                borderRadius: 12, padding: "14px 16px", marginTop: 12,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              <Info size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                  <strong style={{ color: "var(--text)" }}>Fidelidade mínima: 3 meses.</strong>{" "}
                  Cancelamento antecipado sujeito ao pagamento da diferença entre os tokens utilizados e o valor avulso (<strong style={{ color: "var(--text)" }}>R$ 300,00/token</strong>).
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, margin: "6px 0 0" }}>
                  <strong style={{ color: "var(--text)" }}>Reativação:</strong> clientes que cancelaram pagam <strong style={{ color: "var(--text)" }}>R$ 79,90</strong> no primeiro mês de retorno.
                </p>
              </div>
            </div>
          </div>

          {/* Aviso: sem manutenção */}
          {maintenance === "m_none" && (
            <div
              style={{
                background: "rgba(91,87,232,0.06)",
                border: "1px solid rgba(91,87,232,0.2)",
                borderRadius: 12, padding: "14px 16px",
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              <AlertCircle size={20} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 700, margin: "0 0 4px" }}>
                  Sem plano, sem suporte após a entrega.
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                  Tokens avulsos custam <strong style={{ color: "var(--text)" }}>R$ 300,00 cada</strong>. Assinantes pagam apenas <strong style={{ color: "var(--primary)" }}>R$ 150,00 por token extra</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Coluna direita: Resumo + Formulário ─────────────────── */}
        <div className="w-full lg:flex-1 lg:sticky" style={{ top: 24 }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 20, padding: "24px",
              border: "1px solid var(--border)",
            }}
          >
            {/* Cabeçalho resumo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <Receipt size={16} style={{ color: "var(--primary)" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>
                Resumo do orçamento
              </span>
            </div>

            {/* Tipo de projeto selecionado */}
            <div
              style={{
                background: "rgba(91,87,232,0.08)",
                border: "1px solid rgba(91,87,232,0.2)",
                borderRadius: 10, padding: "10px 12px", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <service.Icon size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>{service.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{service.desc}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {/* Base */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>{service.label} base</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{formatPrice(BASE_PRICE)}</span>
              </div>

              {/* Addons únicos */}
              {selectedAddons.filter(a => a.type === "once").map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                    <a.Icon size={12} />
                    {a.label}
                  </span>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>+ {formatPrice(a.price)}</span>
                </div>
              ))}

              {/* Total único */}
              <div
                style={{
                  borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 12,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>Total do projeto</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>
                  {formatPrice(onceTotal)}
                </span>
              </div>

              {/* Recorrente */}
              {monthTotal > 0 && (
                <div style={{ borderTop: "1px solid var(--border)", marginTop: 4, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                    Recorrente mensal
                  </div>
                  {mPlan && mPlan.price > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--text-muted)" }}>Manutenção {mPlan.label}</span>
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>+ {formatPrice(mPlan.price)}</span>
                    </div>
                  )}
                  {selectedAddons.filter(a => a.type === "month").map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: "var(--text-muted)" }}>{a.label}</span>
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>+ {formatPrice(a.price)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>Total mensal</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: "var(--primary)" }}>
                      {formatPrice(monthTotal)}/mês
                    </span>
                  </div>
                </div>
              )}

              {/* Total 1º mês */}
              {monthTotal > 0 && (
                <div
                  style={{
                    background: "rgba(91,87,232,0.06)",
                    border: "1px solid rgba(91,87,232,0.15)",
                    borderRadius: 12, padding: "12px 14px", marginTop: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 13 }}>Total (1º mês)</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: "var(--primary)" }}>
                      {formatPrice(firstMonthTotal)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6 }}>
                    A partir do 2º mês: apenas {formatPrice(monthTotal)}/mês
                  </div>
                </div>
              )}
            </div>

            {/* Formulário */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 18,
                display: "flex", flexDirection: "column", gap: 10,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                Seus dados para contato
              </div>

              {[
                { value: name, setter: setName, placeholder: "Seu nome", type: "text" },
                { value: phone, setter: setPhone, placeholder: "Telefone / WhatsApp", type: "tel" },
                { value: email, setter: setEmail, placeholder: "Seu e-mail", type: "email" },
              ].map(({ value, setter, placeholder, type }) => (
                <input
                  key={placeholder}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  type={type}
                  disabled={isPending}
                  className="transition duration-150 focus:border-[#5B57E8] focus:ring-2 focus:ring-[#5B57E8]/25"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "var(--text)",
                    fontSize: 13,
                    outline: "none",
                    opacity: isPending ? 0.6 : 1,
                    fontFamily: FONT,
                  }}
                />
              ))}

              {submitError && (
                <div
                  style={{
                    background: "rgba(91,87,232,0.08)",
                    border: "1px solid rgba(91,87,232,0.25)",
                    borderRadius: 8, padding: "10px 12px",
                    fontSize: 12, color: "var(--text-muted)",
                    display: "flex", gap: 6, alignItems: "flex-start",
                  }}
                >
                  <AlertCircle size={14} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
                  {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !email.trim() || isPending}
                style={{
                  background: name.trim() && email.trim() && !isPending ? "var(--primary)" : "var(--border)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px",
                  fontSize: 14, fontWeight: 700,
                  cursor: name.trim() && email.trim() && !isPending ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  marginTop: 4,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontFamily: FONT,
                  boxShadow: name.trim() && email.trim() && !isPending ? "0 8px 24px rgba(91,87,232,0.3)" : "none",
                }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                    Enviando...
                  </>
                ) : (
                  <>
                    Solicitar orçamento
                    <ArrowRight size={14} />
                  </>
                )}
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
