import Link from "next/link";
import Image from "next/image";
import { WHATSAPP_URL, CONTACT_EMAIL } from "../lib/config";

export function Footer() {
  return (
    <footer style={{ background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-icon.png" alt="Fropty Apps" width={28} height={28} className="rounded-md" />
              <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
                Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Seu app sob medida, do jeito que você imaginou. Prévia gratuita, sem compromisso.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Produto</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/#planos",      label: "Planos" },
                { href: "/portfolio",    label: "Portfólio" },
                { href: "/#tokens",      label: "Tokens" },
                { href: "/configurador", label: "Configurador" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="nav-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Suporte */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Suporte</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/#faq",        label: "FAQ" },
                { href: "/sobre",       label: "Sobre" },
                { href: "/contato",     label: "Contato" },
                { href: "/termos",      label: "Termos de Uso" },
                { href: "/privacidade", label: "Privacidade" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="nav-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Contato</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="nav-link flex items-center gap-2">
                  <i className="ti ti-brand-whatsapp text-base" style={{ color: "#22c55e" }} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="nav-link flex items-center gap-2">
                  <i className="ti ti-mail text-base" style={{ color: "var(--primary)" }} />
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-8 text-xs sm:flex-row"
          style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}>
          <p>© {new Date().getFullYear()} Fropty Apps. Todos os direitos reservados.</p>
          <p>Feito com 💜 para empreendedores brasileiros</p>
        </div>
      </div>
    </footer>
  );
}
