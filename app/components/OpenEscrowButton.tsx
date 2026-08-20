"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TransactionSteps, type Step } from "@/components/ui/TransactionSteps";
import { publicClient, contractAddresses } from "@/lib/chain";
import { getBrowserWalletClient, getConnectedAddress } from "@/lib/browserWallet";
import { fairPriceOracleAbi, agriTokenAbi, escrowAbi } from "@/lib/abis";

const STEP_LABELS = ["Connect wallet", "Read live price", "Approve payment", "Open escrow"];

export function OpenEscrowButton({ batchId, crop, quantityKg }: { batchId: string; crop: string; quantityKg: string }) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [busy, setBusy] = useState(false);

  function setStep(i: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  async function openEscrow() {
    setBusy(true);
    setSteps(STEP_LABELS.map((label, i) => ({ label, state: i === 0 ? "active" : "pending" })));

    try {
      const buyer = await getConnectedAddress();
      const wallet = getBrowserWalletClient();
      setStep(0, { state: "done" });

      setStep(1, { state: "active" });
      const [price] = await publicClient.readContract({
        address: contractAddresses.fairPriceOracle,
        abi: fairPriceOracleAbi,
        functionName: "getPrice",
        args: [crop],
      });
      const depositAmount = BigInt(quantityKg) * price;
      setStep(1, { state: "done" });

      setStep(2, { state: "active" });
      const approveHash = await wallet.writeContract({
        account: buyer,
        address: contractAddresses.agriToken,
        abi: agriTokenAbi,
        functionName: "approve",
        args: [contractAddresses.escrow, depositAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      setStep(2, { state: "done", txHash: approveHash });

      setStep(3, { state: "active" });
      const openHash = await wallet.writeContract({
        account: buyer,
        address: contractAddresses.escrow,
        abi: escrowAbi,
        functionName: "openEscrow",
        args: [BigInt(batchId), price],
      });
      await publicClient.waitForTransactionReceipt({ hash: openHash });
      setStep(3, { state: "done", txHash: openHash });

      router.refresh();
    } catch (err) {
      setSteps((prev) => {
        const activeIdx = prev.findIndex((s) => s.state === "active");
        const i = activeIdx === -1 ? prev.length - 1 : activeIdx;
        return prev.map((s, idx) =>
          idx === i ? { ...s, state: "error", error: err instanceof Error ? err.message : String(err) } : s
        );
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant="primary" onClick={openEscrow} disabled={busy} className="whitespace-nowrap">
        {busy ? "Processing…" : "Open Escrow"}
      </Button>
      <TransactionSteps steps={steps} />
    </div>
  );
}
