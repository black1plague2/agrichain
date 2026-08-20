import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = dict(locale).auth;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-layer px-6 py-16">
      <div className="mb-4">
        <LanguageSwitcher locale={locale} />
      </div>
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-semibold text-text-primary">
          {t.brand}
        </Link>
        <p className="mt-2 text-sm text-text-secondary">{t.loginSubtitle}</p>
      </div>
      <LoginForm locale={locale} />
      <p className="mt-8 text-sm text-text-secondary">
        {t.newHere}{" "}
        <Link href="/register" className="font-medium text-accent underline">
          {t.createAccount}
        </Link>
      </p>
    </div>
  );
}
