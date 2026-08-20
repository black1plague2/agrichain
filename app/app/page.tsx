import Link from "next/link";
import { Package, Vault, Truck, Scales, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const STEP_ICONS: Icon[] = [Package, Vault, Truck, Scales, CheckCircle];

export default async function Home() {
  const locale = await getLocale();
  const t = dict(locale).home;

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border-subtle bg-text-primary px-6 py-3.5 sm:px-10">
        <span className="text-lg font-semibold tracking-tight text-text-on-color">AgriChain</span>
        <nav className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} variant="inverse" />
          <Link href="/login">
            <Button variant="ghost-inverse" className="px-3 py-2 text-xs">
              {t.navLogIn}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" className="px-3 py-2 text-xs">
              {t.navGetStarted}
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-border-subtle bg-layer px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="animate-rise mb-4 text-xs font-semibold uppercase tracking-wide text-accent">{t.kicker}</p>
          <h1
            className="animate-rise max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-6xl"
            style={{ animationDelay: "0.08s" }}
          >
            {t.heroTitle}
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg text-text-secondary" style={{ animationDelay: "0.16s" }}>
            {t.heroSubtitle}
          </p>

          <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
            <Link href="/register?role=farmer">
              <Button variant="primary">{t.ctaRegister}</Button>
            </Link>
            <Link href="/verify/1">
              <Button variant="ghost">{t.ctaSample}</Button>
            </Link>
          </div>

          <div className="animate-rise mt-14 grid grid-cols-2 gap-6 border-t border-border-subtle pt-8 sm:grid-cols-4" style={{ animationDelay: "0.3s" }}>
            {t.stats.map((s) => (
              <div key={s.label}>
                <p className="tabular text-2xl font-semibold text-text-primary sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three promises */}
      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{t.guaranteesKicker}</h2>
          <h3 className="mb-10 max-w-xl text-2xl font-semibold text-text-primary sm:text-3xl">{t.guaranteesTitle}</h3>
          <div className="grid gap-0 border border-border-subtle sm:grid-cols-3">
            {t.promises.map((p, i) => (
              <div key={p.title} className={`p-6 sm:p-8 ${i > 0 ? "border-t sm:border-l sm:border-t-0" : ""} border-border-subtle`}>
                <span className="tabular text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="mt-3 text-xl font-semibold text-text-primary">{p.title}</h4>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border-subtle bg-layer px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{t.processKicker}</h2>
          <h3 className="mb-10 max-w-xl text-2xl font-semibold text-text-primary sm:text-3xl">{t.processTitle}</h3>
          <ol className="grid gap-6 sm:grid-cols-5">
            {t.steps.map((step, i) => {
              const StepIcon = STEP_ICONS[i];
              return (
                <li key={step.title} className="relative flex flex-col gap-3 border border-border-subtle bg-bg p-5">
                  <span className="tabular absolute right-3 top-3 text-xs text-text-placeholder">0{i + 1}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint text-accent">
                    <StepIcon size={22} weight="bold" />
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{step.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Honest framing — visible, not buried */}
      <section className="border-t border-border-subtle px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">{t.honestKicker}</h2>
          <ul className="mt-4 grid max-w-4xl gap-3 text-sm leading-relaxed text-text-secondary sm:grid-cols-2">
            {t.honestItems.map((item) => (
              <li key={item.strong}>
                <strong className="text-text-primary">{item.strong}</strong>
                {item.rest}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-auto border-t border-border-subtle px-6 py-6 sm:px-10">
        <p className="mx-auto max-w-6xl text-xs text-text-placeholder">{t.footer}</p>
      </footer>
    </div>
  );
}
