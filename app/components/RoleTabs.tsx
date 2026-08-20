"use client";

const ROLES = [
  { key: "farmer", label: "Kisan", sub: "Farmer" },
  { key: "buyer", label: "Kharidar", sub: "Buyer" },
  { key: "logistics", label: "Parivahak", sub: "Logistics" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];

export function RoleTabs({ role, onChange }: { role: RoleKey; onChange: (r: RoleKey) => void }) {
  return (
    <div className="flex border-[1.5px] border-ink">
      {ROLES.map((r, i) => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`flex-1 border-ink px-3 py-3 text-center transition-colors ${
            i > 0 ? "border-l-[1.5px]" : ""
          } ${role === r.key ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-paper-deep"}`}
        >
          <div className="font-display text-base italic">{r.label}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">{r.sub}</div>
        </button>
      ))}
    </div>
  );
}
