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

const variantClass: Record<Variant, string> = {
  primary:   "hub-btn-primary",
  secondary: "hub-btn-secondary",
  ghost:     "hub-btn-ghost",
  danger:    "hub-btn-danger",
};

const sizeClass: Record<Size, string> = {
  sm: "hub-btn-sm",
  md: "",
  lg: "hub-btn-lg",
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
      className,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const classes = ["hub-btn", variantClass[variant], sizeClass[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} disabled={isDisabled} className={classes} style={style} {...props}>
        {loading ? (
          <Loader2 size={16} className="hub-spin" />
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
