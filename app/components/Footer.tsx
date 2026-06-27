import Link from "next/link";
import Image from "next/image";
import { WHATSAPP_URL, CONTACT_EMAIL } from "../lib/config";
import { Instagram, Facebook, MessageCircle, Mail } from "lucide-react";

function TikTokIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

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

            {/* Redes sociais */}
            <div className="mt-5 flex gap-2">
              {[
                { href: "https://instagram.com/froptyapps", Icon: Instagram,     label: "Instagram" },
                { href: "https://facebook.com/froptyapps",  Icon: Facebook,      label: "Facebook"  },
                { href: "https://tiktok.com/@froptyapps",   Icon: TikTokIcon,    label: "TikTok"    },
                { href: "https://wa.me/5519983317645",      Icon: MessageCircle, label: "WhatsApp"  },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="social-icon-btn"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
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
                  <MessageCircle size={16} style={{ color: "#22c55e" }} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="nav-link flex items-center gap-2">
                  <Mail size={16} style={{ color: "var(--primary)" }} />
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
