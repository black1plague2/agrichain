export const LOCALES = ["en", "hi", "ta"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Short so it doesn't bloat every request header; "al" = "app locale". */
export const LOCALE_COOKIE = "al";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  ta: "தமிழ்",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
