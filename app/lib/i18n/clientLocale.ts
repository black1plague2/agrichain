"use client";

import { LOCALE_COOKIE, type Locale } from "./locale";

/** Client-side counterpart to getLocale.ts's cookie read — writes the same cookie so the next
 * server render picks it up. One year expiry: this is a preference, not a session. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
