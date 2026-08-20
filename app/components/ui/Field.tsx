import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      {children}
      {hint && <span className="text-xs text-text-placeholder">{hint}</span>}
    </label>
  );
}

const fieldClasses =
  "border-0 border-b-2 border-border-strong bg-layer px-3 py-2.5 font-body text-sm text-text-primary outline-none placeholder:text-text-placeholder focus:border-accent";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClasses} ${props.className ?? ""}`} />;
}
