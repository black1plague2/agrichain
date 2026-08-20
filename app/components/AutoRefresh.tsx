"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the server component's data on an interval so batch status, pipeline stage, and
 * balances stay live without the user hitting reload — mirrors what ActivityFeed already does
 * for the activity list, applied to the rest of the page. */
export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
