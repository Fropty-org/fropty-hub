import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
    }}>
      <div style={{
        fontSize: "7rem",
        fontWeight: 900,
        lineHeight: 1,
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 16,
        fontFamily: "var(--font-plus-jakarta), sans-serif",
      }}>404</div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)", margin: "0 0 8px" }}>
        Página não encontrada
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 360, margin: "0 0 32px" }}>
        O endereço que você digitou não existe ou foi removido.
      </p>
      <Link
        href="/"
        style={{
          padding: "11px 24px",
          borderRadius: 12,
          background: "var(--primary)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
