"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { publicClient, contractAddresses } from "@/lib/chain";
import { getBrowserWalletClient, getConnectedAddress } from "@/lib/browserWallet";
import { fairPriceOracleAbi, agriTokenAbi, escrowAbi } from "@/lib/abis";

export function OpenEscrowButton({ batchId, crop, quantityKg }: { batchId: string; crop: string; quantityKg: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openEscrow() {
    setError(null);
    try {
      setBusy("Connecting wallet…");
      const buyer = await getConnectedAddress();
      const wallet = getBrowserWalletClient();

      setBusy("Reading live price…");
      const [price] = await publicClient.readContract({
        address: contractAddresses.fairPriceOracle,
        abi: fairPriceOracleAbi,
        functionName: "getPrice",
        args: [crop],
      });
      const depositAmount = BigInt(quantityKg) * price;

      setBusy("Approving AGRI spend…");
      const approveHash = await wallet.writeContract({
        account: buyer,
        address: contractAddresses.agriToken,
        abi: agriTokenAbi,
        functionName: "approve",
        args: [contractAddresses.escrow, depositAmount],
      });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      setBusy("Opening escrow…");
      const openHash = await wallet.writeContract({
        account: buyer,
        address: contractAddresses.escrow,
        abi: escrowAbi,
        functionName: "openEscrow",
        args: [BigInt(batchId), price],
      });
      await publicClient.waitForTransactionReceipt({ hash: openHash });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="mustard" onClick={openEscrow} disabled={!!busy} className="whitespace-nowrap">
        {busy ?? "Escrow Kholein"}
      </Button>
      {error && <p className="max-w-[220px] text-right text-xs text-terracotta-deep">{error}</p>}
    </div>
  );
}
