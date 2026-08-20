import Link from "next/link";

export function Header({ role }: { role?: string }) {
  return (
    <header className="rule-strong flex items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="font-display text-xl italic text-ink">AgriChain</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">Amoy Testnet</span>
      </Link>
      {role && (
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-soft">
          Signed in — {role}
        </span>
      )}
    </header>
  );
}
