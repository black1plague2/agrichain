import { ButtonHTMLAttributes } from "react";

type Variant = "mustard" | "terracotta" | "ink" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  mustard: "bg-mustard text-ink border-ink hover:bg-mustard-deep active:translate-y-px",
  terracotta: "bg-terracotta text-paper border-ink hover:bg-terracotta-deep active:translate-y-px",
  ink: "bg-ink text-paper border-ink hover:bg-ink/90 active:translate-y-px",
  ghost: "bg-transparent text-ink border-ink hover:bg-paper-deep active:translate-y-px",
};

export function Button({
  variant = "ink",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`border-[1.5px] px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.1em] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
