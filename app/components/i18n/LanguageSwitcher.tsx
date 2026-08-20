"use client";

import { useRouter } from "next/navigation";
import { Translate, CaretDown } from "@phosphor-icons/react";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locale";
import { setLocaleCookie } from "@/lib/i18n/clientLocale";

// Matches ui/Field.tsx's Carbon-style bottom-border input, so the switcher reads as part of the
// same form-control family rather than a generic browser <select>.
const VARIANT_CLASSES = {
  // For dark headers (homepage, dashboard Header component).
  inverse: "border-text-secondary text-text-on-color",
  // For light backgrounds (login/register/verify pages).
  default: "border-border-strong text-text-primary",
};

export function LanguageSwitcher({
  locale,
  variant = "default",
}: {
  locale: Locale;
  variant?: "default" | "inverse";
}) {
  const router = useRouter();

  function onChange(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className={`group relative flex items-center gap-1.5 border-0 border-b-2 py-1 pl-0.5 pr-4 transition-colors focus-within:border-accent ${VARIANT_CLASSES[variant]}`}>
      <Translate size={13} weight="bold" className="flex-shrink-0 opacity-70" />
      <select
        aria-label="Language"
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs font-medium outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="text-text-primary">
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
      <CaretDown size={10} weight="bold" className="pointer-events-none absolute right-0.5 opacity-70" />
    </div>
  );
}
