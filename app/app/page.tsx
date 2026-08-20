import Link from "next/link";
import { Button } from "@/components/ui/Button";

const PROMISES = [
  {
    n: "01",
    hi: "Wazan jhootha nahi ho sakta",
    en: "Weight can't be faked",
    body: "A weighbridge device signs its own reading with its own key. The app that runs this website never holds that key — so a hacked server still can't forge a number.",
  },
  {
    n: "02",
    hi: "Daam par bahas nahi",
    en: "Price can't be argued",
    body: "The price is locked to the batch the moment a buyer commits — frozen, on-chain, before pickup. Nobody moves it after the fact.",
  },
  {
    n: "03",
    hi: "Bhugtan mein deri nahi",
    en: "Payment can't be delayed",
    body: "A verified weight reading releases the farmer's payment automatically. No phone calls, no \"agle hafte.\"",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="rule-strong flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="font-display text-xl italic">AgriChain</span>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="px-3 py-2 text-[11px]">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="mustard" className="px-3 py-2 text-[11px]">
              Register
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-16 pt-14 sm:px-10 sm:pb-24 sm:pt-20">
        <div
          aria-hidden
          className="animate-stamp pointer-events-none absolute right-6 top-6 hidden -rotate-[6deg] border-[3px] border-terracotta px-4 py-2 text-terracotta sm:block"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.25em]">
            Batch se&nbsp;→&nbsp;Bhugtan tak
          </span>
        </div>

        <p className="animate-rise mb-4 font-mono text-xs uppercase tracking-[0.2em] text-terracotta">
          Mandi ledger — Polygon Amoy testnet
        </p>
        <h1
          className="animate-rise max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl"
          style={{ animationDelay: "0.08s" }}
        >
          Farmer se buyer tak, <em className="italic text-terracotta">bina bichauliye</em>.
        </h1>
        <p
          className="animate-rise mt-6 max-w-xl text-lg text-ink-soft"
          style={{ animationDelay: "0.16s" }}
        >
          Every batch, every weight, every rupee — one ledger, written once, readable by anyone.
          A mandi transaction platform where the record can&apos;t be quietly edited afterward.
        </p>

        <div
          className="animate-rise mt-9 flex flex-wrap gap-3"
          style={{ animationDelay: "0.24s" }}
        >
          <Link href="/register?role=farmer">
            <Button variant="mustard">Batch Register Karein</Button>
          </Link>
          <Link href="/verify/1">
            <Button variant="ghost">Ek Batch Verify Karein →</Button>
          </Link>
        </div>
      </section>

      {/* Three promises, as ledger line items */}
      <section className="border-t-[1.5px] border-ink px-6 py-14 sm:px-10 sm:py-20">
        <h2 className="mb-10 font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          Teen vaade — on-chain, verifiable
        </h2>
        <div className="grid gap-0 sm:grid-cols-3">
          {PROMISES.map((p, i) => (
            <div
              key={p.n}
              className={`animate-rise border-ink px-0 py-6 sm:px-8 sm:py-2 ${
                i > 0 ? "border-t-[1.5px] sm:border-l-[1.5px] sm:border-t-0" : ""
              }`}
              style={{ animationDelay: `${0.3 + i * 0.1}s` }}
            >
              <span className="font-mono text-sm text-mustard-deep">{p.n}</span>
              <h3 className="mt-3 font-display text-2xl leading-snug">{p.en}</h3>
              <p className="mt-1 font-body text-sm italic text-ink-soft">{p.hi}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest framing — fine print, deliberately visible not buried */}
      <section className="border-t-[1.5px] border-ink bg-paper-deep px-6 py-10 sm:px-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          Ledger ki seema — jo hum khud bata rahe hain
        </h2>
        <ul className="mt-4 grid max-w-4xl gap-3 text-sm leading-relaxed text-ink-soft sm:grid-cols-2">
          <li>
            <strong className="text-ink">Un-forgeable-without-the-key, not fraud-proof.</strong> A
            physically tampered device can still misreport — that&apos;s a hardware problem, not a
            contract one.
          </li>
          <li>
            <strong className="text-ink">One trusted price feed for this demo.</strong> A
            decentralized oracle network is the production path, not what&apos;s running today.
          </li>
          <li>
            <strong className="text-ink">Farmer wallets are custodial.</strong> A deliberate
            UX-over-decentralization tradeoff for a feature-phone audience.
          </li>
          <li>
            <strong className="text-ink">AGRI is a demo token.</strong> Real INR settlement is a
            post-hackathon UPI integration, not live today.
          </li>
        </ul>
      </section>

      <footer className="mt-auto border-t-[1.5px] border-ink px-6 py-6 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-faint">
          AgriChain · Polygon Amoy testnet · $0 running cost
        </p>
      </footer>
    </div>
  );
}
