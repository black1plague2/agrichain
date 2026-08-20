"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatAgri } from "@/components/ui/Numeral";

export function WithdrawButton({ pendingAmount }: { pendingAmount: bigint }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (pendingAmount === 0n) return null;

  async function withdraw() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/farmer/withdraw", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "withdraw failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="mustard" onClick={withdraw} disabled={busy}>
        {busy ? "Bhugtan aa raha hai…" : `${formatAgri(pendingAmount)} AGRI Nikaalein`}
      </Button>
      {error && <p className="max-w-[220px] text-right text-xs text-terracotta-deep">{error}</p>}
    </div>
  );
}
