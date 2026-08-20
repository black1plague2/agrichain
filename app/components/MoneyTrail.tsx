import { Vault, HandCoins, ArrowUUpLeft, Clock } from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { Panel } from "@/components/ui/Panel";
import { formatAgri } from "@/components/ui/Numeral";
import { explorerTxUrl } from "@/lib/chain";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import type { MoneyTrailEntry } from "@/lib/data";

const ICON: Record<MoneyTrailEntry["type"], Icon> = {
  deposit: Vault,
  farmerPayout: HandCoins,
  buyerRefund: ArrowUUpLeft,
  timeoutRefund: Clock,
};

const COLOR: Record<MoneyTrailEntry["type"], string> = {
  deposit: "#2a78d6",
  farmerPayout: "#008300",
  buyerRefund: "#eda100",
  timeoutRefund: "#e87ba4",
};

/** Answers "where did the money actually go" in one glance — every real leg of the transfer
 * (buyer's deposit, farmer's payout, any refund), each carrying the on-chain tx that moved it.
 * Built from the same raw_events log as ActivityFeed, so amounts here can never disagree with
 * what actually settled on-chain. */
export function MoneyTrail({ entries, locale }: { entries: MoneyTrailEntry[]; locale: Locale }) {
  const t = dict(locale).moneyTrail;

  return (
    <Panel title={t.title}>
      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-placeholder">{t.empty}</p>
      ) : (
        <ol className="relative flex flex-col gap-4 pl-1">
          {entries.length > 1 && (
            <div className="absolute bottom-3 left-[13px] top-3 w-px bg-border-subtle" aria-hidden />
          )}
          {entries.map((entry, i) => {
            const IconComponent = ICON[entry.type];
            const color = COLOR[entry.type];
            const amount = formatAgri(entry.amountWei);
            const text =
              entry.type === "deposit"
                ? t.deposit(amount, entry.buyerWallet.slice(0, 8))
                : entry.type === "farmerPayout"
                  ? t.farmerPayout(amount)
                  : entry.type === "buyerRefund"
                    ? t.buyerRefund(amount)
                    : t.timeoutRefund(amount);
            const url = explorerTxUrl(entry.txHash);

            return (
              <li key={`${entry.type}-${i}`} className="relative flex items-start gap-3">
                <span
                  className="relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-bg"
                  style={{ backgroundColor: color }}
                >
                  <IconComponent size={15} weight="bold" color="white" />
                </span>
                <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-sm text-text-primary">{text}</span>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent underline"
                    >
                      view tx ↗
                    </a>
                  ) : (
                    <span
                      className="font-mono text-[11px] text-text-placeholder"
                      title="Local demo chain — no public block explorer. This is still the real transaction hash."
                    >
                      {entry.txHash.slice(0, 10)}…
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
