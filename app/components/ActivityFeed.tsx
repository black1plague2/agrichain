"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/ui/Panel";
import type { ActivityEntry } from "@/lib/activity";

const AMOY_EXPLORER = "https://amoy.polygonscan.com";
const POLL_MS = 4000;

function relativeTime(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

/**
 * A live, plain-English feed of what's actually happening on-chain — reads from the same
 * raw_events log the indexer writes, translated by lib/activity.ts. Polls instead of a
 * websocket: simple, and the 4s interval is already faster than a human reads a page.
 */
export function ActivityFeed({ batchId, title = "Live Activity" }: { batchId?: string; title?: string }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [, forceTick] = useState(0);

  useEffect(() => {
    const url = batchId ? `/api/activity/${batchId}` : "/api/activity";
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
    const clock = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearInterval(clock);
    };
  }, [batchId]);

  return (
    <Panel title={title} stamp="live · updates every 4s">
      {entries.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-faint">Abhi tak koi activity nahi hai.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {entries.map((e) => (
            <li key={e.id} className="rule flex items-start justify-between gap-3 pb-2.5 text-sm last:border-0 last:pb-0">
              <span className="flex items-start gap-2">
                <span aria-hidden>{e.icon}</span>
                <span className="text-ink-soft">{e.text}</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-2 font-mono text-[10px] text-ink-faint">
                {relativeTime(e.processedAt)}
                <a
                  href={`${AMOY_EXPLORER}/tx/${e.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-terracotta"
                  title="View on block explorer"
                >
                  proof ↗
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
