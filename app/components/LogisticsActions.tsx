"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function markInTransit() {
    setError(null);
    setBusy("Pickup ho raha hai…");
    try {
      const account = await getConnectedAddress();
      const wallet = getBrowserWalletClient();
      const hash = await wallet.writeContract({
        account,
        address: contractAddresses.batchRegistry,
        abi: batchRegistryAbi,
        functionName: "markInTransit",
        args: [BigInt(batchId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function markDelivered() {
    setError(null);
    setBusy("Delivered mark ho raha hai…");
    try {
      const account = await getConnectedAddress();
      const wallet = getBrowserWalletClient();
      const hash = await wallet.writeContract({
        account,
        address: contractAddresses.batchRegistry,
        abi: batchRegistryAbi,
        functionName: "markDelivered",
        args: [BigInt(batchId), 90],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function simulateWeighIn() {
    setError(null);
    const input = window.prompt(
      `Actual weight in kg (registered: ${quantityKg} kg — enter a different number to demo the deviation penalty):`,
      quantityKg
    );
    if (!input) return;
    const weightKg = input.trim();
    if (!/^\d+$/.test(weightKg)) {
      setError("weight must be a whole number of kg");
      return;
    }

    setBusy("Device assign ho raha hai…");
    try {
      const account = await getConnectedAddress();
      const wallet = getBrowserWalletClient();

      const [, assigned] = await publicClient.readContract({
        address: contractAddresses.weighbridgeRegistry,
        abi: weighbridgeRegistryAbi,
        functionName: "getAssignedDevice",
        args: [BigInt(batchId)],
      });

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
      }

      setBusy("Weigh-in ho raha hai…");
      const simRes = await fetch("/api/weighbridge/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, weightKg }),
      });
      const simData = await simRes.json();
      if (!simRes.ok) throw new Error(simData.error ?? "weigh-in failed");

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function settle() {
    setError(null);
    setBusy("Settle ho raha hai…");
    try {
      const account = await getConnectedAddress();
      const wallet = getBrowserWalletClient();
      const hash = await wallet.writeContract({
        account,
        address: contractAddresses.escrow,
        abi: escrowAbi,
        functionName: "settle",
        args: [BigInt(batchId)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {status === "REGISTERED" && (
        <Button variant="mustard" onClick={markInTransit} disabled={!!busy}>
          {busy ?? "Pickup Karein"}
        </Button>
      )}
      {status === "IN_TRANSIT" && (
        <Button variant="mustard" onClick={markDelivered} disabled={!!busy}>
          {busy ?? "Delivered Mark Karein"}
        </Button>
      )}
      {status === "DELIVERED" && !hasReading && (
        <Button variant="terracotta" onClick={simulateWeighIn} disabled={!!busy}>
          {busy ?? "Weight Verify Karein"}
        </Button>
      )}
      {status === "DELIVERED" && hasReading && (
        <Button variant="ink" onClick={settle} disabled={!!busy}>
          {busy ?? "Bhugtan Jari Karein"}
        </Button>
      )}
      {error && <p className="max-w-[220px] text-right text-xs text-terracotta-deep">{error}</p>}
    </div>
  );
}
