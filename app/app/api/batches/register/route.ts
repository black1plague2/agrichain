import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import type { Hex } from "viem";
import { db } from "@/db/client";
import { farmers } from "@/db/schema";
import { contractAddresses } from "@/lib/chain";
import { relayFarmerCall, encodeRegisterBatch } from "@/lib/relayer";
import { batchRegistryAbi } from "@/lib/abis";
import { decryptFarmerKey } from "@/lib/custody";

const bodySchema = z.object({
  farmerWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  crop: z.string().min(1),
  quantityKg: z.coerce.bigint().positive(),
  geohash: z.string().min(1),
  ipfsPhotoHash: z.string().min(1),
});

/**
 * Registers a batch on the farmer's behalf, gasless: the farmer's custodial key signs the
 * meta-transaction, the relayer pays gas through Forwarder.sol. The farmer never sees a wallet
 * UI or a gas prompt.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { farmerWallet, crop, quantityKg, geohash, ipfsPhotoHash } = parsed.data;

  const farmer = await db.query.farmers.findFirst({ where: eq(farmers.walletAddress, farmerWallet) });
  if (!farmer?.custodialKeyEncrypted) {
    return NextResponse.json({ error: "Unknown farmer wallet" }, { status: 404 });
  }

  try {
    const farmerPrivateKey = decryptFarmerKey(farmer.custodialKeyEncrypted) as Hex;
    const data = encodeRegisterBatch(batchRegistryAbi, crop, quantityKg, geohash, ipfsPhotoHash);

    const txHash = await relayFarmerCall({
      farmerPrivateKey,
      to: contractAddresses.batchRegistry,
      data,
    });

    return NextResponse.json({ txHash });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
