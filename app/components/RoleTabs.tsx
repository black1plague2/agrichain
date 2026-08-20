"use client";

const ROLES = [
  { key: "farmer", label: "Farmer", sub: "Kisan" },
  { key: "buyer", label: "Buyer", sub: "Kharidar" },
  { key: "logistics", label: "Logistics", sub: "Parivahak" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];

export function RoleTabs({ role, onChange }: { role: RoleKey; onChange: (r: RoleKey) => void }) {
  return (
    <div className="flex border border-border-subtle">
      {ROLES.map((r, i) => (
        <button
          key={r.key}
          type="button"
          onClick={() => onChange(r.key)}
          className={`flex-1 border-border-subtle px-3 py-3 text-center transition-colors ${
            i > 0 ? "border-l" : ""
          } ${role === r.key ? "bg-accent text-text-on-color" : "bg-transparent text-text-primary hover:bg-layer"}`}
        >
          <div className="text-sm font-semibold">{r.label}</div>
          <div className="text-[11px] opacity-80">{r.sub}</div>
        </button>
      ))}
    </div>
  );
}
