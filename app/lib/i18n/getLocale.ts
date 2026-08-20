import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locale";

/** Reads the visitor's chosen language from a cookie set by the language picker/switcher.
 * No cookie yet (first visit, not chosen) → English, per the "default English" requirement. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function hasLocaleCookie(): Promise<boolean> {
  const store = await cookies();
  return isLocale(store.get(LOCALE_COOKIE)?.value);
}
