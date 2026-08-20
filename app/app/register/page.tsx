import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { RoleKey } from "@/components/RoleTabs";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialRole: RoleKey = role === "buyer" || role === "logistics" ? role : "farmer";
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
        <p className="mt-2 text-sm text-text-secondary">{t.registerSubtitle}</p>
      </div>
      <RegisterForm initialRole={initialRole} locale={locale} />
      <p className="mt-8 text-sm text-text-secondary">
        {t.alreadyHaveAccount}{" "}
        <Link href="/login" className="font-medium text-accent underline">
          {t.signIn}
        </Link>
      </p>
    </div>
  );
}
