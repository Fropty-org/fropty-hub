"use client";

import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddings = {
  none: "0",
  sm: "16px",
  md: "24px",
  lg: "32px",
};

export function Card({ hover = false, padding = "md", className, style, children, ...props }: CardProps) {
  const classes = ["hub-card", hover ? "hub-card-hover" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ padding: paddings[padding], ...style }} {...props}>
      {children}
    </div>
  );
}
