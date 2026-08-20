import Link from "next/link";
import { Package, Vault, Truck, Scales, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

const PROMISES = [
  {
    n: "01",
    en: "Weight can't be faked",
    hi: "Wazan jhootha nahi ho sakta",
    body: "The weighbridge signs its own reading. The server never holds that key.",
  },
  {
    n: "02",
    en: "Price can't be argued",
    hi: "Daam par bahas nahi",
    body: "Price locks on-chain the moment a buyer commits. Nobody can move it after.",
  },
  {
    n: "03",
    en: "Payment can't be delayed",
    hi: "Bhugtan mein deri nahi",
    body: "A verified weight reading releases payment automatically. No manual step.",
  },
];

const STATS = [
  { value: "34/34", label: "Contract tests passing" },
  { value: "6", label: "Smart contracts, fully audited logic" },
  { value: "<200ms", label: "Page reads, cached off-chain" },
  { value: "$0", label: "Infrastructure cost to run" },
];

const STEPS: { icon: Icon; title: string; body: string }[] = [
  { icon: Package, title: "Register", body: "Producer logs crop, quantity, and location on-chain." },
  { icon: Vault, title: "Escrow", body: "Buyer locks payment at a price frozen for this batch only." },
  { icon: Truck, title: "Transit", body: "Logistics confirms pickup, then delivery to the buyer." },
  { icon: Scales, title: "Weigh-In", body: "The weighbridge signs the actual delivered weight." },
  { icon: CheckCircle, title: "Settle", body: "Contract releases payment automatically — no manual step." },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border-subtle bg-text-primary px-6 py-3.5 sm:px-10">
        <span className="text-lg font-semibold tracking-tight text-text-on-color">AgriChain</span>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="border-border-strong px-3 py-2 text-xs text-text-on-color hover:bg-white/10">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" className="px-3 py-2 text-xs">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-border-subtle bg-layer px-6 py-16 sm:px-10 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="animate-rise mb-4 text-xs font-semibold uppercase tracking-wide text-accent">
            Blockchain-Backed Supply Chain Traceability
          </p>
          <h1
            className="animate-rise max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-6xl"
            style={{ animationDelay: "0.08s" }}
          >
            End-to-end verified custody, from farm to settlement.
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg text-text-secondary" style={{ animationDelay: "0.16s" }}>
            Replace the chain of middlemen with a chain of blocks. Every batch, weight, and
            payment — written once, readable by anyone.
          </p>

          <div className="animate-rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "0.24s" }}>
            <Link href="/register?role=farmer">
              <Button variant="primary">Register a batch</Button>
            </Link>
            <Link href="/verify/1">
              <Button variant="ghost">View a sample record →</Button>
            </Link>
          </div>

          <div className="animate-rise mt-14 grid grid-cols-2 gap-6 border-t border-border-subtle pt-8 sm:grid-cols-4" style={{ animationDelay: "0.3s" }}>
            {STATS.map((s) => (
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
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">Platform Guarantees</h2>
          <h3 className="mb-10 max-w-xl text-2xl font-semibold text-text-primary sm:text-3xl">
            Enforced by contract, not policy.
          </h3>
          <div className="grid gap-0 border border-border-subtle sm:grid-cols-3">
            {PROMISES.map((p, i) => (
              <div key={p.n} className={`p-6 sm:p-8 ${i > 0 ? "border-t sm:border-l sm:border-t-0" : ""} border-border-subtle`}>
                <span className="tabular text-sm text-accent">{p.n}</span>
                <h4 className="mt-3 text-xl font-semibold text-text-primary">{p.en}</h4>
                <p className="mt-1 text-sm text-text-secondary">{p.hi}</p>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border-subtle bg-layer px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">The Process</h2>
          <h3 className="mb-10 max-w-xl text-2xl font-semibold text-text-primary sm:text-3xl">
            Five steps, every one of them on-chain.
          </h3>
          <ol className="grid gap-6 sm:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative flex flex-col gap-3 border border-border-subtle bg-bg p-5">
                <span className="tabular absolute right-3 top-3 text-xs text-text-placeholder">0{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-tint text-accent">
                  <step.icon size={22} weight="bold" />
                </span>
                <div>
                  <p className="font-semibold text-text-primary">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Honest framing — visible, not buried */}
      <section className="border-t border-border-subtle px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-placeholder">
            What This Doesn&apos;t Claim
          </h2>
          <ul className="mt-4 grid max-w-4xl gap-3 text-sm leading-relaxed text-text-secondary sm:grid-cols-2">
            <li>
              <strong className="text-text-primary">Un-forgeable, not fraud-proof.</strong> A tampered
              device can still misreport — a hardware problem, not a contract one.
            </li>
            <li>
              <strong className="text-text-primary">One trusted price feed.</strong> A decentralized
              oracle is the production path, not what&apos;s running today.
            </li>
            <li>
              <strong className="text-text-primary">Producer wallets are custodial.</strong> A tradeoff
              for a low-connectivity audience, not free.
            </li>
            <li>
              <strong className="text-text-primary">AGRI is a settlement token.</strong> Real currency
              settlement is planned, not live today.
            </li>
          </ul>
        </div>
      </section>

      <footer className="mt-auto border-t border-border-subtle px-6 py-6 sm:px-10">
        <p className="mx-auto max-w-6xl text-xs text-text-placeholder">
          AgriChain · Polygon network · Built for verifiable agricultural trade
        </p>
      </footer>
    </div>
  );
}
