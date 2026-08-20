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
      <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border-[1.5px] border-ink bg-paper px-3 py-2.5 font-body text-sm text-ink outline-none placeholder:text-ink-faint focus:bg-paper-raised ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`border-[1.5px] border-ink bg-paper px-3 py-2.5 font-body text-sm text-ink outline-none focus:bg-paper-raised ${props.className ?? ""}`}
    />
  );
}
