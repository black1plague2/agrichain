/**
 * Polls Amoy for AgriChain contract events and mirrors chain state into Postgres so pages never
 * touch RPC on read. Idempotent: every log is first inserted into raw_events keyed by
 * (blockNumber, logIndex) with ON CONFLICT DO NOTHING; domain tables are only updated when that
 * insert actually landed a new row, and only overwritten by a strictly newer block. Safe to
 * restart or re-run over an overlapping block range.
 *
 * Run with: npm run indexer
 */
// Env vars come from `node --env-file=.env.local` (see package.json's "indexer" script) — NOT a
// dotenv import here. Import statements are hoisted by esbuild ahead of any top-level statement
// in this file, so a same-file `dotenv.config()` call runs too late to affect other imports
// (like ../lib/chain) that read process.env at their own module-load time. Node's native
// --env-file flag populates the environment before the module graph loads at all, which is the
// only ordering that's actually safe here.
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { rawEvents, batches, escrows, priceHistory, weighbridgeReadings, indexerCursor } from "../db/schema";
import { publicClient, contractAddresses } from "../lib/chain";
import {
  batchRegistryAbi,
  fairPriceOracleAbi,
  weighbridgeRegistryAbi,
  escrowAbi,
} from "../lib/abis";

const POLL_INTERVAL_MS = 4_000;
const CONFIRMATIONS = 2n;
const START_BLOCK = BigInt(process.env.INDEXER_START_BLOCK ?? "0");

const blockTimestampCache = new Map<bigint, Date>();

/** viem decodes event args with native bigint, which JSON.stringify can't serialize — jsonb
 * insert needs bigints turned into strings first, recursively (args can be nested). */
function jsonbSafe(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(jsonbSafe);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, jsonbSafe(v)]));
  }
  return value;
}

async function blockTimestamp(blockNumber: bigint): Promise<Date> {
  const cached = blockTimestampCache.get(blockNumber);
  if (cached) return cached;
  const block = await publicClient.getBlock({ blockNumber });
  const ts = new Date(Number(block.timestamp) * 1000);
  blockTimestampCache.set(blockNumber, ts);
  return ts;
}

/** Returns true if this (blockNumber, logIndex) hasn't been processed before. */
async function recordRawEvent(
  contractName: string,
  eventName: string,
  log: { blockNumber: bigint; logIndex: number; transactionHash: string; args: unknown }
): Promise<boolean> {
  const result = await db
    .insert(rawEvents)
    .values({
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      txHash: log.transactionHash,
      contractName,
      eventName,
      payload: jsonbSafe(log.args) as object,
    })
    .onConflictDoNothing()
    .returning({ blockNumber: rawEvents.blockNumber });

  return result.length > 0;
}

async function getCursor(contractName: string): Promise<bigint> {
  const row = await db.query.indexerCursor.findFirst({
    where: eq(indexerCursor.contractName, contractName),
  });
  return row?.lastIndexedBlock ?? START_BLOCK;
}

async function setCursor(contractName: string, block: bigint) {
  await db
    .insert(indexerCursor)
    .values({ contractName, lastIndexedBlock: block })
    .onConflictDoUpdate({
      target: indexerCursor.contractName,
      set: { lastIndexedBlock: block, updatedAt: new Date() },
    });
}

async function indexBatchRegistry(fromBlock: bigint, toBlock: bigint) {
  const logs = await publicClient.getContractEvents({
    address: contractAddresses.batchRegistry,
    abi: batchRegistryAbi,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    const isNew = await recordRawEvent("BatchRegistry", log.eventName, log as never);
    if (!isNew) continue;
    if (log.eventName !== "BatchRegistered" && log.eventName !== "BatchStateChanged") continue;

    const batchId = (log.args as { batchId: bigint }).batchId;
    const onChainBatch = await publicClient.readContract({
      address: contractAddresses.batchRegistry,
      abi: batchRegistryAbi,
      functionName: "getBatch",
      args: [batchId],
    });

    // registeredAt is already a unix timestamp (seconds) stored on-chain at registration time —
    // no block lookup needed, and this stays correct even when re-processing a later state change.
    const registeredAt = new Date(Number(onChainBatch.registeredAt) * 1000);
    const statusNames = ["REGISTERED", "IN_TRANSIT", "DELIVERED", "RESOLVED"] as const;

    await db
      .insert(batches)
      .values({
        batchId,
        farmerWallet: onChainBatch.farmer,
        crop: onChainBatch.crop,
        quantityKg: onChainBatch.quantityKg,
        geohash: onChainBatch.geohash,
        ipfsPhotoHash: onChainBatch.ipfsPhotoHash,
        status: statusNames[onChainBatch.status],
        qualityGrade: onChainBatch.qualityGrade || null,
        registeredAt,
        lastBlockNumber: log.blockNumber,
      })
      .onConflictDoUpdate({
        target: batches.batchId,
        set: {
          status: statusNames[onChainBatch.status],
          qualityGrade: onChainBatch.qualityGrade || null,
          lastBlockNumber: log.blockNumber,
        },
        where: sql`${batches.lastBlockNumber} <= ${log.blockNumber}`,
      });
  }
}

async function indexFairPriceOracle(fromBlock: bigint, toBlock: bigint) {
  const logs = await publicClient.getContractEvents({
    address: contractAddresses.fairPriceOracle,
    abi: fairPriceOracleAbi,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    const isNew = await recordRawEvent("FairPriceOracle", log.eventName, log as never);
    if (!isNew || log.eventName !== "PriceUpdated") continue;

    const args = log.args as { crop: string; pricePerKg: bigint; sourceUri: string; timestamp: bigint };
    await db
      .insert(priceHistory)
      .values({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        crop: args.crop,
        pricePerKg: args.pricePerKg,
        sourceUri: args.sourceUri,
        recordedAt: new Date(Number(args.timestamp) * 1000),
      })
      .onConflictDoNothing();
  }
}

async function indexWeighbridgeRegistry(fromBlock: bigint, toBlock: bigint) {
  const logs = await publicClient.getContractEvents({
    address: contractAddresses.weighbridgeRegistry,
    abi: weighbridgeRegistryAbi,
    fromBlock,
    toBlock,
  });

  for (const log of logs) {
    const isNew = await recordRawEvent("WeighbridgeRegistry", log.eventName, log as never);
    if (!isNew || log.eventName !== "WeightVerified") continue;

    const args = log.args as { batchId: bigint; weightKg: bigint; deviceAddress: string };
    const recordedAt = await blockTimestamp(log.blockNumber);

    await db
      .insert(weighbridgeReadings)
      .values({
        batchId: args.batchId,
        weightKg: args.weightKg,
        deviceAddress: args.deviceAddress,
        recordedAt,
        lastBlockNumber: log.blockNumber,
      })
      .onConflictDoUpdate({
        target: weighbridgeReadings.batchId,
        set: {
          weightKg: args.weightKg,
          deviceAddress: args.deviceAddress,
          recordedAt,
          lastBlockNumber: log.blockNumber,
        },
        where: sql`${weighbridgeReadings.lastBlockNumber} <= ${log.blockNumber}`,
      });
  }
}

async function indexEscrow(fromBlock: bigint, toBlock: bigint) {
  const logs = await publicClient.getContractEvents({
    address: contractAddresses.escrow,
    abi: escrowAbi,
    fromBlock,
    toBlock,
  });

  const settlementByBatch = new Map<bigint, { farmerPayout: bigint; buyerRefund: bigint }>();
  for (const log of logs) {
    if (log.eventName === "EscrowSettled") {
      const args = log.args as { batchId: bigint; farmerPayout: bigint; buyerRefund: bigint };
      settlementByBatch.set(args.batchId, { farmerPayout: args.farmerPayout, buyerRefund: args.buyerRefund });
    }
  }

  for (const log of logs) {
    const isNew = await recordRawEvent("Escrow", log.eventName, log as never);
    if (!isNew) continue;

    const relevantEvents = ["EscrowOpened", "EscrowSettled", "EscrowRefundedOnTimeout", "DisputeFlagged", "DisputeResolved"];
    if (!relevantEvents.includes(log.eventName)) continue;

    const batchId = (log.args as { batchId: bigint }).batchId;
    const onChainEscrow = await publicClient.readContract({
      address: contractAddresses.escrow,
      abi: escrowAbi,
      functionName: "getEscrow",
      args: [batchId],
    });

    const openedAt = await blockTimestamp(log.blockNumber);
    const settlement = settlementByBatch.get(batchId);

    await db
      .insert(escrows)
      .values({
        batchId,
        buyerWallet: onChainEscrow.buyer,
        snapshotPrice: onChainEscrow.snapshotPrice,
        depositAmount: onChainEscrow.depositAmount,
        openedAt,
        timeoutSeconds: onChainEscrow.timeoutSeconds,
        settled: onChainEscrow.settled,
        refunded: onChainEscrow.refunded,
        disputed: onChainEscrow.disputed,
        farmerPayout: settlement?.farmerPayout,
        buyerRefund: settlement?.buyerRefund,
        lastBlockNumber: log.blockNumber,
      })
      .onConflictDoUpdate({
        target: escrows.batchId,
        set: {
          settled: onChainEscrow.settled,
          refunded: onChainEscrow.refunded,
          disputed: onChainEscrow.disputed,
          farmerPayout: settlement?.farmerPayout,
          buyerRefund: settlement?.buyerRefund,
          lastBlockNumber: log.blockNumber,
        },
        where: sql`${escrows.lastBlockNumber} <= ${log.blockNumber}`,
      });
  }
}

const INDEXERS: Record<string, (from: bigint, to: bigint) => Promise<void>> = {
  BatchRegistry: indexBatchRegistry,
  FairPriceOracle: indexFairPriceOracle,
  WeighbridgeRegistry: indexWeighbridgeRegistry,
  Escrow: indexEscrow,
};

/** Every DB/RPC call in here is wrapped per-contract so a transient network blip to Neon or the
 * RPC (which does happen — caught this exact case running against a real Neon instance) never
 * takes down the whole tick, let alone the whole long-running process. */
async function tick() {
  let latest: bigint;
  try {
    latest = await publicClient.getBlockNumber();
  } catch (err) {
    console.error("[indexer] failed to fetch latest block, will retry next tick:", err);
    return;
  }
  const safeLatest = latest > CONFIRMATIONS ? latest - CONFIRMATIONS : 0n;

  for (const [contractName, indexFn] of Object.entries(INDEXERS)) {
    try {
      const cursor = await getCursor(contractName);
      if (cursor >= safeLatest) continue;

      const fromBlock = cursor + 1n;
      // Cap the range per tick so a long backfill doesn't time out a single RPC call.
      const toBlock = fromBlock + 2000n < safeLatest ? fromBlock + 2000n : safeLatest;

      await indexFn(fromBlock, toBlock);
      await setCursor(contractName, toBlock);
      if (toBlock < safeLatest) {
        console.log(`[indexer] ${contractName} backfilling: ${toBlock}/${safeLatest}`);
      }
    } catch (err) {
      console.error(`[indexer] ${contractName} failed this tick, will retry next tick:`, err);
    }
  }
}

async function main() {
  console.log("[indexer] starting, poll interval", POLL_INTERVAL_MS, "ms");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await tick();
    } catch (err) {
      console.error("[indexer] unexpected error in tick, continuing:", err);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("[indexer] fatal error:", err);
  process.exit(1);
});
