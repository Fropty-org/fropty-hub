import { HTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Pass a Lucide component: Icon={CheckCircle} */
  Icon?: LucideIcon;
  /** @deprecated Use Icon prop instead */
  icon?: string;
}

const colors: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: "var(--surface)", color: "var(--text-muted)", border: "var(--border)" },
  brand:   { bg: "rgba(91,87,232,0.15)", color: "var(--primary)", border: "rgba(91,87,232,0.3)" },
  success: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", border: "rgba(34,197,94,0.3)" },
  warning: { bg: "rgba(239,159,39,0.12)", color: "#EF9F27", border: "rgba(239,159,39,0.3)" },
  danger:  { bg: "rgba(239,68,68,0.12)", color: "#ef4444", border: "rgba(239,68,68,0.3)" },
  info:    { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
};

export function Badge({ variant = "default", Icon, icon, children, style, ...props }: BadgeProps) {
  const { bg, color, border } = colors[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: bg,
        color,
        border: `1px solid ${border}`,
        ...style,
      }}
      {...props}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
