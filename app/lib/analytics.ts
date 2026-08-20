import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { batches, escrows, weighbridgeReadings } from "@/db/schema";

export type PlatformAnalytics = {
  totalBatches: number;
  totalVolumeKg: number;
  activeEscrows: number;
  settledCount: number;
  /** Wei-scale (18 decimals) — stays bigint, a plain JS number would silently lose precision
   * on any realistic settled total (easily exceeds Number.MAX_SAFE_INTEGER). */
  totalSettledAgri: bigint;
  penaltyCount: number;
  avgDeviationBps: number;
  cropBreakdown: { crop: string; volumeKg: number; count: number }[];
  pipelineCounts: { registered: number; escrowed: number; inTransit: number; delivered: number; settled: number };
};

/**
 * One aggregate read for every dashboard's analytics panel. All real Postgres aggregates over
 * the indexer's mirrored tables — no client-side summing of per-row data.
 */
export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
  const [batchTotals] = await db
    .select({
      totalBatches: sql<number>`count(*)`,
      totalVolumeKg: sql<number>`coalesce(sum(${batches.quantityKg}), 0)`,
    })
    .from(batches);

  const [escrowTotals] = await db
    .select({
      activeEscrows: sql<number>`count(*) filter (where ${escrows.settled} = false and ${escrows.refunded} = false)`,
      settledCount: sql<number>`count(*) filter (where ${escrows.settled} = true)`,
      totalSettledAgri: sql<number>`coalesce(sum(${escrows.farmerPayout}) filter (where ${escrows.settled} = true), 0)`,
      penaltyCount: sql<number>`count(*) filter (where ${escrows.settled} = true and ${escrows.farmerPayout} < ${escrows.depositAmount})`,
    })
    .from(escrows);

  // Average deviation across settled batches with a recorded weight — deviation = |registered - verified| / registered.
  const [deviation] = await db
    .select({
      avgDeviationBps: sql<number>`coalesce(avg(abs(${batches.quantityKg} - ${weighbridgeReadings.weightKg}) * 10000.0 / nullif(${batches.quantityKg}, 0)), 0)`,
    })
    .from(escrows)
    .innerJoin(batches, sql`${batches.batchId} = ${escrows.batchId}`)
    .innerJoin(weighbridgeReadings, sql`${weighbridgeReadings.batchId} = ${escrows.batchId}`)
    .where(sql`${escrows.settled} = true`);

  const cropBreakdown = await db
    .select({
      crop: batches.crop,
      volumeKg: sql<number>`coalesce(sum(${batches.quantityKg}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(batches)
    .groupBy(batches.crop)
    .orderBy(sql`sum(${batches.quantityKg}) desc`);

  const [pipeline] = await db
    .select({
      registered: sql<number>`count(*) filter (where ${batches.status} = 'REGISTERED')`,
      inTransit: sql<number>`count(*) filter (where ${batches.status} = 'IN_TRANSIT')`,
      delivered: sql<number>`count(*) filter (where ${batches.status} = 'DELIVERED')`,
      settled: sql<number>`count(*) filter (where ${batches.status} = 'RESOLVED')`,
    })
    .from(batches);

  const [escrowedCount] = await db
    .select({ escrowed: sql<number>`count(*)` })
    .from(escrows);

  return {
    totalBatches: Number(batchTotals?.totalBatches ?? 0),
    totalVolumeKg: Number(batchTotals?.totalVolumeKg ?? 0),
    activeEscrows: Number(escrowTotals?.activeEscrows ?? 0),
    settledCount: Number(escrowTotals?.settledCount ?? 0),
    totalSettledAgri: BigInt(escrowTotals?.totalSettledAgri ?? 0),
    penaltyCount: Number(escrowTotals?.penaltyCount ?? 0),
    avgDeviationBps: Number(deviation?.avgDeviationBps ?? 0),
    cropBreakdown: cropBreakdown.map((c) => ({ crop: c.crop, volumeKg: Number(c.volumeKg), count: Number(c.count) })),
    pipelineCounts: {
      registered: Number(pipeline?.registered ?? 0),
      escrowed: Number(escrowedCount?.escrowed ?? 0),
      inTransit: Number(pipeline?.inTransit ?? 0),
      delivered: Number(pipeline?.delivered ?? 0),
      settled: Number(pipeline?.settled ?? 0),
    },
  };
}
