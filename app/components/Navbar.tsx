import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/#planos",   label: "Planos" },
  { href: "/#exemplos", label: "Exemplos" },
  { href: "/sobre",     label: "Sobre" },
  { href: "/#faq",      label: "FAQ" },
];

export function Navbar() {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-icon.png" alt="Fropty Apps" width={28} height={28} className="rounded-md" />
          <span className="text-base font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Fropty<span style={{ color: "var(--primary)" }}>Apps</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="nav-link transition">{label}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/configurador"
            style={{
              background: "var(--cta-bg)",
              color: "var(--cta-text)",
              padding: "8px 18px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Configurar plano
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
