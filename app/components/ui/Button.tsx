import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-text-on-color border-accent hover:bg-accent-hover active:bg-accent-active",
  danger: "bg-danger text-text-on-color border-danger hover:bg-danger-hover active:bg-danger-hover",
  secondary: "bg-text-primary text-text-on-color border-text-primary hover:bg-text-secondary",
  ghost: "bg-transparent text-text-primary border-border-strong hover:bg-layer",
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
