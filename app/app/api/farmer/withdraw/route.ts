import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { encodeFunctionData, type Hex } from "viem";
import { db } from "@/db/client";
import { farmers } from "@/db/schema";
import { contractAddresses } from "@/lib/chain";
import { relayFarmerCall } from "@/lib/relayer";
import { escrowAbi } from "@/lib/abis";
import { decryptFarmerKey } from "@/lib/custody";
import { getSession } from "@/lib/session";

/** Claims a farmer's pending settlement — Escrow.withdraw() is a pull payment, so this has to be
 * a real transaction, not just a read. Relayed the same gasless way as batch registration. */
export async function POST(_request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "farmer") {
    return NextResponse.json({ error: "Not signed in as a farmer" }, { status: 401 });
  }

  const farmer = await db.query.farmers.findFirst({ where: eq(farmers.walletAddress, session.wallet) });
  if (!farmer?.custodialKeyEncrypted) {
    return NextResponse.json({ error: "Unknown farmer wallet" }, { status: 404 });
  }

  try {
    const farmerPrivateKey = decryptFarmerKey(farmer.custodialKeyEncrypted) as Hex;
    const data = encodeFunctionData({ abi: escrowAbi, functionName: "withdraw", args: [] });

    const txHash = await relayFarmerCall({
      farmerPrivateKey,
      to: contractAddresses.escrow,
      data,
    });

    return NextResponse.json({ txHash });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
