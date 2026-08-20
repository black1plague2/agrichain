import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publicClient, relayerWalletClient, contractAddresses } from "@/lib/chain";
import { signWeightReading, freshNonce } from "@/lib/weighbridge";
import { weighbridgeRegistryAbi } from "@/lib/abis";

const bodySchema = z.object({
  batchId: z.coerce.bigint().positive(),
  weightKg: z.coerce.bigint().positive(),
});

/**
 * Demo weighbridge: signs a reading with the device's own key, then submits it on-chain paying
 * gas from the relayer (recordVerifiedWeight is permissionless — anyone can submit a validly
 * signed reading). In a real deployment this endpoint would be a physical device's own firmware,
 * not part of this app.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { batchId, weightKg } = parsed.data;

  try {
    const nonce = freshNonce();
    const signature = await signWeightReading(batchId, weightKg, nonce);

    const relayer = relayerWalletClient();
    const txHash = await relayer.writeContract({
      address: contractAddresses.weighbridgeRegistry,
      abi: weighbridgeRegistryAbi,
      functionName: "recordVerifiedWeight",
      args: [batchId, weightKg, signature, nonce],
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    return NextResponse.json({ txHash, batchId: batchId.toString(), weightKg: weightKg.toString() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
