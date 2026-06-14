"use client";

import { useState } from "react";
import Link from "next/link";
import { QuoteButton } from "./QuoteModal";

const links = [
  { href: "#planos",   label: "Planos" },
  { href: "#exemplos", label: "Exemplos" },
  { href: "#tokens",   label: "Tokens" },
  { href: "#faq",      label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        style={{ color: "var(--text)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
      >
        <i className={`ti ${open ? "ti-x" : "ti-menu-2"} text-xl`} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--bg)", top: 0 }}
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-base font-bold" style={{ color: "var(--text)" }}>
              Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              style={{ color: "var(--text)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
            >
              <i className="ti ti-x text-xl" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-6 pt-8">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-4 text-lg font-medium transition"
                style={{ color: "var(--text)", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/configurador"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-4 text-center text-base font-semibold transition"
                style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
              >
                Configurador de planos
              </Link>
              <QuoteButton
                className="rounded-xl px-4 py-4 text-center text-base font-semibold text-white transition"
                style={{ background: "var(--primary)" }}
              >
                Pedir orçamento grátis →
              </QuoteButton>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
