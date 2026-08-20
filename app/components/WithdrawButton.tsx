"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatAgri } from "@/components/ui/Numeral";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export function WithdrawButton({ pendingAmount, locale }: { pendingAmount: bigint; locale: Locale }) {
  const router = useRouter();
  const t = dict(locale);
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
      <Button variant="primary" onClick={withdraw} disabled={busy}>
        {busy ? t.common.processing : `${t.withdraw.action} ${formatAgri(pendingAmount)} AGRI`}
      </Button>
      {error && <p className="max-w-[220px] text-right text-xs text-danger-hover">{error}</p>}
    </div>
  );
}
