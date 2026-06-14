import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <Image src="/logo-icon.png" alt="Fropty Apps" width={56} height={56} className="rounded-2xl mb-8 opacity-80" />

      <div className="section-chip mb-6">Erro 404</div>

      <h1 className="text-4xl font-bold sm:text-6xl" style={{ color: "var(--text)", fontFamily: "var(--font-plus-jakarta), sans-serif", lineHeight: 1.1 }}>
        Página não encontrada
      </h1>

      <p className="mt-6 max-w-md text-lg" style={{ color: "var(--text-muted)" }}>
        Essa página não existe ou foi movida. Mas a sua ideia de app ainda pode virar realidade 👇
      </p>

      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="rounded-full px-8 py-4 text-base font-semibold text-white transition hover:brightness-110"
          style={{ background: "var(--primary)" }}
        >
          Voltar ao início
        </Link>
        <Link
          href="/configurador"
          className="rounded-full px-8 py-4 text-base font-semibold transition"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Montar meu app →
        </Link>
      </div>
    </main>
  );
}
