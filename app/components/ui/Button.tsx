import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "secondary" | "ghost" | "ghost-inverse";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-text-on-color border-accent hover:bg-accent-hover active:bg-accent-active",
  danger: "bg-danger text-text-on-color border-danger hover:bg-danger-hover active:bg-danger-hover",
  secondary: "bg-text-primary text-text-on-color border-text-primary hover:bg-text-secondary",
  ghost: "bg-transparent text-text-primary border-border-strong hover:bg-layer",
  // For use on dark surfaces (the homepage's dark header). Passing `text-text-on-color` via
  // className on top of `ghost` doesn't reliably win — Tailwind's generated stylesheet order
  // decides the cascade, not the order classes appear in the class string — so this needs to be
  // its own variant rather than a className override.
  "ghost-inverse": "bg-transparent text-text-on-color border-text-secondary hover:bg-white/10",
};

export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`border px-4 py-2.5 font-body text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
