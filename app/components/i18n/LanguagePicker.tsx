"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Translate } from "@phosphor-icons/react";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/locale";
import { setLocaleCookie } from "@/lib/i18n/clientLocale";

/** First-visit language prompt. Only rendered by the root layout when no locale cookie exists
 * yet, so a returning visitor (or one who already picked a language) never sees it again.
 * Heading is shown in all three languages at once — a Hindi/Tamil reader shouldn't need to
 * already read English to know what this dialog is asking. */
export function LanguagePicker() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState<Locale | null>(null);

  if (!open) return null;

  function choose(locale: Locale) {
    setBusy(locale);
    setLocaleCookie(locale);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6 backdrop-blur-[2px]">
      <div className="animate-rise w-full max-w-sm border border-border-subtle bg-bg p-6 shadow-lg">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-tint text-accent">
          <Translate size={18} weight="bold" />
        </span>
        <h2 className="mt-4 text-lg font-semibold leading-snug text-text-primary">
          Choose your language <span className="text-text-placeholder">·</span> अपनी भाषा चुनें{" "}
          <span className="text-text-placeholder">·</span> மொழியைத் தேர்ந்தெடுக்கவும்
        </h2>
        <p className="mt-2 text-xs text-text-placeholder">
          You can change this anytime from the header. Default: English.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {LOCALES.map((locale, i) => (
            <button
              key={locale}
              type="button"
              onClick={() => choose(locale)}
              disabled={busy !== null}
              style={{ animationDelay: `${i * 0.05}s` }}
              className="animate-rise group flex items-center justify-between border border-border-strong bg-transparent px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-accent-tint disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>{LOCALE_NAMES[locale]}</span>
              {locale === "en" && (
                <span className="text-[10px] uppercase tracking-wide text-text-placeholder group-hover:text-accent">
                  default
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
