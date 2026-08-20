import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export function Header({ role, locale }: { role?: string; locale: Locale }) {
  const t = dict(locale);
  return (
    <header className="flex items-center justify-between border-b border-border-subtle bg-text-primary px-6 py-3.5">
      <Link href="/" className="flex items-baseline gap-3">
        <span className="text-lg font-semibold tracking-tight text-text-on-color">AgriChain</span>
        <span className="hidden text-xs text-text-placeholder sm:inline">{t.header.platformTag}</span>
      </Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher locale={locale} variant="inverse" />
        {role && <span className="text-xs text-text-placeholder">{role}</span>}
        {role && <LogoutButton locale={locale} />}
      </div>
    </header>
  );
}
