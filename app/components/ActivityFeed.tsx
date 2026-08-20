"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Scales,
  Truck,
  ChartLineUp,
  WarningCircle,
  CheckCircle,
  type Icon,
} from "@phosphor-icons/react";
import { Panel } from "@/components/ui/Panel";
import { CATEGORY_COLOR, categoryLabel, type ActivityCategory, type ActivityEntry } from "@/lib/activity";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";
import { explorerTxUrl } from "@/lib/chain";

const POLL_MS = 4000;

const CATEGORY_ICON: Record<ActivityCategory, Icon> = {
  registration: Package,
  weighbridge: Scales,
  logistics: Truck,
  pricing: ChartLineUp,
  dispute: WarningCircle,
  settlement: CheckCircle,
};

const FILTER_KEYS: (ActivityCategory | "all")[] = [
  "all",
  "registration",
  "pricing",
  "logistics",
  "weighbridge",
  "settlement",
  "dispute",
];

function relativeTime(iso: string, locale: Locale): string {
  const t = dict(locale).activityFeed;
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 5) return t.justNow;
  if (seconds < 60) return t.secondsAgo(seconds);
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t.minutesAgo(minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.hoursAgo(hours);
  return new Date(iso).toLocaleDateString();
}

/**
 * A live, plain-English timeline of what's actually happening on-chain — reads from the same
 * raw_events log the indexer writes, translated by lib/activity.ts. Polls instead of a
 * websocket: simple, and the 4s interval is already faster than a human reads a page.
 */
export function ActivityFeed({ batchId, title, locale }: { batchId?: string; title?: string; locale: Locale }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [filter, setFilter] = useState<ActivityCategory | "all">("all");
  const [, forceTick] = useState(0);
  const t = dict(locale).activityFeed;

  useEffect(() => {
    const base = batchId ? `/api/activity/${batchId}` : "/api/activity";
    const url = `${base}?locale=${locale}`;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.activity)) setEntries(data.activity);
      } catch {
        // transient network hiccup — next poll will retry, no need to surface an error for this
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    // re-render every second so "just now" ages into "12s ago" etc. without waiting on the poll
    const clock = setInterval(() => forceTick((tick) => tick + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearInterval(clock);
    };
  }, [batchId, locale]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.category === filter)),
    [entries, filter]
  );

  return (
    <Panel title={title ?? t.defaultTitle} stamp={`${t.live} · ${t.updatesEvery}`}>
      <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border-subtle pb-4">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-2.5 py-1 text-xs font-medium transition-colors ${
              filter === key ? "bg-text-primary text-text-on-color" : "bg-layer text-text-secondary hover:bg-layer-hover"
            }`}
          >
            {t.filters[key]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-placeholder">{t.noActivity}</p>
      ) : (
        <ol className="relative flex flex-col gap-5 pl-1">
          <div className="absolute bottom-2 left-[13px] top-2 w-px bg-border-subtle" aria-hidden />
          {filtered.map((e) => {
            const color = CATEGORY_COLOR[e.category];
            const IconComponent = CATEGORY_ICON[e.category];
            return (
              <li key={e.id} className="relative flex gap-3 pl-0">
                <span
                  className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-bg"
                  style={{ backgroundColor: color }}
                >
                  <IconComponent size={13} weight="bold" color="white" />
                </span>
                <div className="flex flex-1 flex-col gap-0.5 pb-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="text-sm text-text-primary">{e.text}</span>
                    <span className="flex flex-shrink-0 items-center gap-2 text-xs text-text-placeholder">
                      {relativeTime(e.processedAt, locale)}
                      {explorerTxUrl(e.txHash) ? (
                        <a
                          href={explorerTxUrl(e.txHash)!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline"
                          title="View on block explorer"
                        >
                          {t.proof}
                        </a>
                      ) : (
                        <span
                          className="font-mono"
                          title="Local demo chain — no public block explorer. This is still the real transaction hash."
                        >
                          {e.txHash.slice(0, 10)}…
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color }}>
                    {categoryLabel(e.category, locale)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
