"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2, type LucideIcon } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  Icon?: LucideIcon;
  IconRight?: LucideIcon;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--cta-bg)",
    color: "var(--cta-text)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid transparent",
  },
  danger: {
    background: "transparent",
    color: "#ef4444",
    border: "1px solid #ef444433",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 14px", fontSize: "13px", borderRadius: "8px" },
  md: { padding: "10px 20px", fontSize: "14px", borderRadius: "10px" },
  lg: { padding: "14px 28px", fontSize: "15px", borderRadius: "12px" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      Icon,
      IconRight,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: isDisabled ? "not-allowed" : "pointer",
          opacity: isDisabled ? 0.55 : 1,
          transition: "opacity 0.15s, filter 0.15s",
          whiteSpace: "nowrap",
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "";
        }}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          Icon && <Icon size={16} />
        )}
        {children}
        {!loading && IconRight && <IconRight size={16} />}
      </button>
    );
  }
);

Button.displayName = "Button";
