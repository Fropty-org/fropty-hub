"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/lib/utils";

const rainbowButtonVariants = cva(
  cn(
    "relative cursor-pointer transition-all animate-rainbow",
    "inline-flex items-center justify-center gap-2 shrink-0",
    "rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]",
    "text-sm font-semibold whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default: cn(
          "rb-fill",
          "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0",
          "before:h-1/5 before:w-3/5 before:-translate-x-1/2",
          "before:animate-rainbow",
          "before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
          "before:bg-[length:200%]",
          "before:[filter:blur(0.75rem)]"
        ),
        outline: cn(
          "border border-b-transparent text-[#111]",
          "bg-[linear-gradient(#ffffff,#ffffff),linear-gradient(#ffffff_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
          "bg-[length:200%]",
          "[background-clip:padding-box,border-box,border-box]",
          "[background-origin:border-box]",
          "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0",
          "before:h-1/5 before:w-3/5 before:-translate-x-1/2",
          "before:animate-rainbow",
          "before:bg-[linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
          "before:bg-[length:200%]",
          "before:[filter:blur(0.75rem)]",
          "dark:bg-[linear-gradient(#0f0f0f,#0f0f0f),linear-gradient(#0f0f0f_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,var(--color-1),var(--color-5),var(--color-3),var(--color-4),var(--color-2))]",
          "dark:text-white"
        ),
      },
      size: {
        default: "h-10 px-6 py-2",
        sm:      "h-8 px-4 text-xs rounded-lg",
        lg:      "h-12 px-8 text-base",
        icon:    "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rainbowButtonVariants> {
  asChild?: boolean;
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(rainbowButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

RainbowButton.displayName = "RainbowButton";

export { RainbowButton, rainbowButtonVariants, type RainbowButtonProps };
