import "server-only";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { batches, escrows, priceHistory, weighbridgeReadings, rawEvents } from "@/db/schema";
import { publicClient, contractAddresses } from "./chain";
import { agriTokenAbi, escrowAbi } from "./abis";
import { humanizeEvent, type ActivityEntry } from "./activity";

/** Most recent human-readable activity across the whole platform — powers the live feed on
 * every dashboard. Reads the same raw_events log the indexer already writes, nothing new stored. */
export async function getRecentActivity(limit = 20): Promise<ActivityEntry[]> {
  const rows = await db
    .select()
    .from(rawEvents)
    .orderBy(desc(rawEvents.blockNumber), desc(rawEvents.logIndex))
    .limit(limit * 2); // over-fetch since some rows humanize to null (filtered out)

  const entries: ActivityEntry[] = [];
  for (const row of rows) {
    const entry = humanizeEvent(row);
    if (entry) entries.push(entry);
    if (entries.length >= limit) break;
  }
  return entries;
}

/** Same feed, scoped to one batch — powers /verify/:batchId's story. */
export async function getBatchActivity(batchId: bigint, limit = 20): Promise<ActivityEntry[]> {
  const rows = await db
    .select()
    .from(rawEvents)
    .where(sql`${rawEvents.payload}->>'batchId' = ${batchId.toString()}`)
    .orderBy(desc(rawEvents.blockNumber), desc(rawEvents.logIndex))
    .limit(limit * 2);

  const entries: ActivityEntry[] = [];
  for (const row of rows) {
    const entry = humanizeEvent(row);
    if (entry) entries.push(entry);
    if (entries.length >= limit) break;
  }
  return entries;
}

export async function getFarmerBatches(wallet: string) {
  const rows = await db
    .select({ batch: batches, escrow: escrows, reading: weighbridgeReadings })
    .from(batches)
    .leftJoin(escrows, eq(escrows.batchId, batches.batchId))
    .leftJoin(weighbridgeReadings, eq(weighbridgeReadings.batchId, batches.batchId))
    .where(eq(batches.farmerWallet, wallet))
    .orderBy(desc(batches.registeredAt));
  return rows;
}

/** Batches registered but not yet escrowed — what a buyer can actually open escrow against. */
export async function getAvailableBatches() {
  const rows = await db
    .select({ batch: batches })
    .from(batches)
    .leftJoin(escrows, eq(escrows.batchId, batches.batchId))
    .where(and(eq(batches.status, "REGISTERED"), isNull(escrows.batchId)))
    .orderBy(desc(batches.registeredAt));
  return rows.map((r) => r.batch);
}

export async function getBuyerEscrows(wallet: string) {
  const rows = await db
    .select({ escrow: escrows, batch: batches, reading: weighbridgeReadings })
    .from(escrows)
    .innerJoin(batches, eq(batches.batchId, escrows.batchId))
    .leftJoin(weighbridgeReadings, eq(weighbridgeReadings.batchId, escrows.batchId))
    .where(eq(escrows.buyerWallet, wallet))
    .orderBy(desc(escrows.openedAt));
  return rows;
}

/** Batches with an open (not settled/refunded) escrow — logistics' pickup queue. */
export async function getLogisticsPickups() {
  const rows = await db
    .select({ batch: batches, escrow: escrows, reading: weighbridgeReadings })
    .from(escrows)
    .innerJoin(batches, eq(batches.batchId, escrows.batchId))
    .leftJoin(weighbridgeReadings, eq(weighbridgeReadings.batchId, escrows.batchId))
    .where(and(eq(escrows.settled, false), eq(escrows.refunded, false)))
    .orderBy(desc(escrows.openedAt));
  return rows;
}

export async function getBatchStory(batchId: bigint) {
  const batch = await db.query.batches.findFirst({ where: eq(batches.batchId, batchId) });
  if (!batch) return null;

  const [escrow, reading, prices] = await Promise.all([
    db.query.escrows.findFirst({ where: eq(escrows.batchId, batchId) }),
    db.query.weighbridgeReadings.findFirst({ where: eq(weighbridgeReadings.batchId, batchId) }),
    db.query.priceHistory.findMany({
      where: eq(priceHistory.crop, batch.crop),
      orderBy: desc(priceHistory.recordedAt),
      limit: 1,
    }),
  ]);

  return { batch, escrow: escrow ?? null, reading: reading ?? null, latestPrice: prices[0] ?? null };
}

export async function getLatestPrice(crop: string) {
  const rows = await db.query.priceHistory.findMany({
    where: eq(priceHistory.crop, crop),
    orderBy: desc(priceHistory.recordedAt),
    limit: 1,
  });
  return rows[0] ?? null;
}

/** Live on-chain read — small enough volume (one wallet balance) that it doesn't need caching. */
export async function getAgriBalance(wallet: `0x${string}`): Promise<bigint> {
  return publicClient.readContract({
    address: contractAddresses.agriToken,
    abi: agriTokenAbi,
    functionName: "balanceOf",
    args: [wallet],
  });
}

/** Live on-chain read — settlement is a pull payment, so a farmer's balance doesn't move until
 * they withdraw. The /farmer page needs this to know whether to show a claim button. */
export async function getPendingWithdrawal(wallet: `0x${string}`): Promise<bigint> {
  return publicClient.readContract({
    address: contractAddresses.escrow,
    abi: escrowAbi,
    functionName: "pendingWithdrawal",
    args: [wallet],
  });
}

export async function countDeviationPenalties() {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(escrows)
    .where(sql`${escrows.settled} = true AND ${escrows.farmerPayout} < ${escrows.depositAmount}`);
  return Number(rows[0]?.count ?? 0);
}
