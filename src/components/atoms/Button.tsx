import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

export const button = cva("px-3 py-1 relative rounded-md cursor-pointer text-sm tracking-tight", {
  variants: {
    variant: {
      primary:
        "bg-control-tint text-white-label active:before:absolute active:before:rounded-md active:before:inset-0 active:before:bg-black/15 active:before:pointer-events-none active:before:z-0",
      neutral:
        "bg-black/5 text-primary-vibrant-label active:before:absolute active:before:rounded-md active:before:inset-0 active:before:bg-black/15 active:before:pointer-events-none active:before:z-0",
      destructive:
        "bg-control-destructive-red/25 text-red active:before:absolute active:before:rounded-md active:before:inset-0 active:before:bg-black/15 active:before:pointer-events-none active:before:z-0",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

type ButtonVariants = VariantProps<typeof button>;

interface ButtonProps extends ButtonVariants {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
export default function Button({
  children,
  variant,
  className,
  onClick,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={button({ variant, className })}
      disabled={disabled}
      {...props}
    >
      <span className="z-5 relative">{children}</span>
    </button>
  );
}
