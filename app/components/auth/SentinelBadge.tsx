import Image from "next/image";

/**
 * Selo "Protegido pelo FroptySentinel" — mesma identidade da checagem de senha
 * comprometida (logo do Sentinel + acento vermelho). Usado nas telas de 2FA.
 */
export function SentinelBadge({ subtitle }: { subtitle?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <span
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 12px", borderRadius: 999,
          background: "color-mix(in srgb, #ef4444 8%, transparent)",
          border: "1px solid color-mix(in srgb, #ef4444 22%, transparent)",
        }}
      >
        <Image src="/sentinel-logo.png" alt="FroptySentinel" width={15} height={15} style={{ objectFit: "contain" }} />
        <span style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)" }}>
          Protegido pelo <span style={{ color: "#ef4444" }}>FroptySentinel</span>
        </span>
      </span>
      {subtitle && (
        <span style={{ fontSize: "10.5px", color: "var(--text-faint)" }}>{subtitle}</span>
      )}
    </div>
  );
}
