"use client";

import { useState } from "react";
import { ChevronRight, HelpCircle, Globe, Target, Smartphone, BarChart2, UserCheck, LucideIcon } from "lucide-react";

const WA_MAIN = "5519983317645";
const WA_ALT  = "5511986911295";

function waUrl(number: string, msg: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}

const MENU_ITEMS: { label: string; sub: string; Icon: LucideIcon; msg: string; num: string }[] = [
  {
    label: "Dúvidas e Suporte",
    sub:   "Atendimento geral",
    Icon:  HelpCircle,
    msg:   "Olá! Tenho uma dúvida sobre os serviços da Fropty Apps.",
    num:   WA_MAIN,
  },
  {
    label: "Site Institucional",
    sub:   "Site profissional completo para sua empresa",
    Icon:  Globe,
    msg:   "Olá! Tenho interesse em um Site Institucional pela Fropty Apps.",
    num:   WA_MAIN,
  },
  {
    label: "Landing Page",
    sub:   "Página focada em vendas e captura de leads",
    Icon:  Target,
    msg:   "Olá! Tenho interesse em uma Landing Page pela Fropty Apps.",
    num:   WA_MAIN,
  },
  {
    label: "App Mobile / SaaS",
    sub:   "Desenvolvimento de apps e sistemas sob medida",
    Icon:  Smartphone,
    msg:   "Olá! Tenho interesse em desenvolver um App ou Sistema pela Fropty Apps.",
    num:   WA_MAIN,
  },
  {
    label: "Gestão de Tráfego",
    sub:   "Anúncios no Google, Meta e TikTok Ads",
    Icon:  BarChart2,
    msg:   "Olá! Tenho interesse em Gestão de Tráfego Pago pela Fropty Apps.",
    num:   WA_ALT,
  },
  {
    label: "Já sou cliente",
    sub:   "Suporte e atendimento especializado",
    Icon:  UserCheck,
    msg:   "Olá! Preciso de suporte — já sou cliente Fropty Apps.",
    num:   WA_ALT,
  },
];

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Popup */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: 72,
            right: 0,
            width: 310,
            borderRadius: 18,
            overflow: "hidden",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.32)",
          }}
        >
          {/* Header verde */}
          <div style={{ background: "#128C7E", padding: "18px 20px 14px" }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1 }}>
              Fale com a gente
            </p>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, margin: "6px 0 0", lineHeight: 1.3 }}>
              Como podemos te ajudar hoje?
            </p>
          </div>

          {/* Itens */}
          <div style={{ maxHeight: 340, overflowY: "auto" }}>
            {MENU_ITEMS.map((item) => (
              <a
                key={item.label}
                href={waUrl(item.num, item.msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="wa-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "13px 20px",
                  textDecoration: "none",
                  borderBottom: "1px solid var(--border)",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(91,87,232,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <item.Icon size={17} style={{ color: "var(--primary)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 13, margin: 0, lineHeight: 1.2 }}>
                    {item.label}
                  </p>
                  <p style={{ color: "var(--text-muted)", fontSize: 11, margin: "3px 0 0", lineHeight: 1.3 }}>
                    {item.sub}
                  </p>
                </div>
                <ChevronRight size={15} style={{ color: "var(--text-faint)", flexShrink: 0 }} />
              </a>
            ))}
          </div>

          {/* Rodapé */}
          <div style={{ padding: "10px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--text-faint)", fontSize: 11, margin: 0 }}>
              Resposta em minutos • WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* Botão */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Fechar chat" : "Abrir chat WhatsApp"}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "var(--surface-2, #333)" : "#25D366",
          border: open ? "1px solid var(--border)" : "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: open
            ? "0 4px 16px rgba(0,0,0,0.2)"
            : "0 8px 28px rgba(37,211,102,0.45)",
          transition: "background 0.2s, box-shadow 0.2s",
          color: open ? "var(--text-muted)" : "#fff",
        }}
      >
        <i
          className={`ti ${open ? "ti-x" : "ti-brand-whatsapp"}`}
          style={{ fontSize: 26 }}
        />
      </button>

      <style>{`
        .wa-item:hover { background: var(--bg-alt) !important; }
      `}</style>
    </div>
  );
}
