"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { TransactionSteps, type Step } from "@/components/ui/TransactionSteps";
import { publicClient, contractAddresses } from "@/lib/chain";
import { getBrowserWalletClient, getConnectedAddress } from "@/lib/browserWallet";
import { batchRegistryAbi, weighbridgeRegistryAbi, escrowAbi } from "@/lib/abis";

type Status = "REGISTERED" | "IN_TRANSIT" | "DELIVERED" | "RESOLVED";

export function LogisticsActions({
  batchId,
  status,
  quantityKg,
  hasReading,
}: {
  batchId: string;
  status: Status;
  quantityKg: string;
  hasReading: boolean;
}) {
  const router = useRouter();
  const [steps, setSteps] = useState<Step[]>([]);
  const [busy, setBusy] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightKg, setWeightKg] = useState(quantityKg);

  function setStep(i: number, patch: Partial<Step>) {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function failActiveStep(err: unknown) {
    setSteps((prev) => {
      const activeIdx = prev.findIndex((s) => s.state === "active");
      const i = activeIdx === -1 ? prev.length - 1 : activeIdx;
      return prev.map((s, idx) =>
        idx === i ? { ...s, state: "error", error: err instanceof Error ? err.message : String(err) } : s
      );
    });
  }

  async function runSingleTx(label: string, run: (buyer: `0x${string}`) => Promise<`0x${string}`>) {
    setBusy(true);
    setSteps([{ label, state: "active" }]);
    try {
      const account = await getConnectedAddress();
      const hash = await run(account);
      await publicClient.waitForTransactionReceipt({ hash });
      setStep(0, { state: "done", txHash: hash });
      router.refresh();
    } catch (err) {
      failActiveStep(err);
    } finally {
      setBusy(false);
    }
  }

  const markInTransit = () =>
    runSingleTx("Confirming pickup", (account) =>
      getBrowserWalletClient().writeContract({
        account,
        address: contractAddresses.batchRegistry,
        abi: batchRegistryAbi,
        functionName: "markInTransit",
        args: [BigInt(batchId)],
      })
    );

  const markDelivered = () =>
    runSingleTx("Confirming delivery", (account) =>
      getBrowserWalletClient().writeContract({
        account,
        address: contractAddresses.batchRegistry,
        abi: batchRegistryAbi,
        functionName: "markDelivered",
        args: [BigInt(batchId), 90],
      })
    );

  const settle = () =>
    runSingleTx("Releasing payment", (account) =>
      getBrowserWalletClient().writeContract({
        account,
        address: contractAddresses.escrow,
        abi: escrowAbi,
        functionName: "settle",
        args: [BigInt(batchId)],
      })
    );

  async function submitWeight() {
    if (!/^\d+$/.test(weightKg.trim())) return;
    setShowWeightInput(false);
    setBusy(true);
    setSteps([
      { label: "Check assigned device", state: "active" },
      { label: "Assign weighbridge device", state: "pending" },
      { label: "Submit signed reading", state: "pending" },
    ]);

    try {
      const account = await getConnectedAddress();
      const wallet = getBrowserWalletClient();

      const [, assigned] = await publicClient.readContract({
        address: contractAddresses.weighbridgeRegistry,
        abi: weighbridgeRegistryAbi,
        functionName: "getAssignedDevice",
        args: [BigInt(batchId)],
      });
      setStep(0, { state: "done" });

      setStep(1, { state: "active" });
      if (!assigned) {
        const deviceRes = await fetch("/api/weighbridge/device-address");
        const { address: deviceAddress } = await deviceRes.json();
        const assignHash = await wallet.writeContract({
          account,
          address: contractAddresses.weighbridgeRegistry,
          abi: weighbridgeRegistryAbi,
          functionName: "assignDevice",
          args: [BigInt(batchId), deviceAddress, "Simulator-V1", `SN-${batchId}`],
        });
        await publicClient.waitForTransactionReceipt({ hash: assignHash });
        setStep(1, { state: "done", txHash: assignHash });
      } else {
        setStep(1, { state: "done", label: "Device already assigned" });
      }

      setStep(2, { state: "active" });
      const simRes = await fetch("/api/weighbridge/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, weightKg: weightKg.trim() }),
      });
      const simData = await simRes.json();
      if (!simRes.ok) throw new Error(simData.error ?? "weigh-in failed");
      setStep(2, { state: "done", txHash: simData.txHash });

      router.refresh();
    } catch (err) {
      failActiveStep(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {status === "REGISTERED" && (
        <Button variant="primary" onClick={markInTransit} disabled={busy}>
          {busy ? "Processing…" : "Confirm Pickup"}
        </Button>
      )}
      {status === "IN_TRANSIT" && (
        <Button variant="primary" onClick={markDelivered} disabled={busy}>
          {busy ? "Processing…" : "Confirm Delivery"}
        </Button>
      )}
      {status === "DELIVERED" && !hasReading && !showWeightInput && (
        <Button variant="primary" onClick={() => setShowWeightInput(true)} disabled={busy}>
          Verify Weight
        </Button>
      )}
      {status === "DELIVERED" && !hasReading && showWeightInput && (
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-text-secondary">Actual weight (kg)</span>
            <Input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-28"
              autoFocus
            />
          </div>
          <Button variant="primary" onClick={submitWeight} disabled={busy}>
            {busy ? "Processing…" : "Submit"}
          </Button>
        </div>
      )}
      {status === "DELIVERED" && hasReading && (
        <Button variant="secondary" onClick={settle} disabled={busy}>
          {busy ? "Processing…" : "Release Payment"}
        </Button>
      )}
      <TransactionSteps steps={steps} />
    </div>
  );
}
