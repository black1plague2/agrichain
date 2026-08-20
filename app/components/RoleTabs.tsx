"use client";

import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const ROLE_KEYS = ["farmer", "buyer", "logistics"] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

export function RoleTabs({
  role,
  onChange,
  locale,
}: {
  role: RoleKey;
  onChange: (r: RoleKey) => void;
  locale: Locale;
}) {
  const t = dict(locale).roleTabs;
  return (
    <div className="flex border border-border-subtle">
      {ROLE_KEYS.map((key, i) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`flex-1 border-border-subtle px-3 py-3 text-center transition-colors ${
            i > 0 ? "border-l" : ""
          } ${role === key ? "bg-accent text-text-on-color" : "bg-transparent text-text-primary hover:bg-layer"}`}
        >
          <div className="text-sm font-semibold">{t[key]}</div>
        </button>
      ))}
    </div>
  );
}
