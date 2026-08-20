"use client";

import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locale";
import { setLocaleCookie } from "@/lib/i18n/clientLocale";

const VARIANT_CLASSES = {
  // For dark headers (homepage, dashboard Header component).
  inverse: "border-text-secondary bg-transparent text-text-on-color",
  // For light backgrounds (login/register/verify pages).
  default: "border-border-strong bg-transparent text-text-primary",
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
    <select
      aria-label="Language"
      value={locale}
      onChange={(e) => onChange(e.target.value as Locale)}
      className={`border px-2 py-1.5 text-xs font-medium outline-none ${VARIANT_CLASSES[variant]}`}
    >
      {LOCALES.map((l) => (
        <option key={l} value={l} className="text-text-primary">
          {LOCALE_NAMES[l]}
        </option>
      ))}
    </select>
  );
}
