import {
  pgTable,
  bigint,
  integer,
  numeric,
  text,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * Every processed chain log lands here first, keyed by (blockNumber, logIndex) — the natural
 * idempotency key for a blockchain event. The indexer inserts with ON CONFLICT DO NOTHING; if
 * a row didn't already exist, it then applies the domain-specific projection below. Re-running
 * the indexer over an overlapping block range is always safe.
 */
export const rawEvents = pgTable(
  "raw_events",
  {
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    logIndex: integer("log_index").notNull(),
    txHash: text("tx_hash").notNull(),
    contractName: text("contract_name").notNull(),
    eventName: text("event_name").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.blockNumber, table.logIndex] })]
);

export const farmers = pgTable("farmers", {
  walletAddress: text("wallet_address").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  custodialKeyEncrypted: text("custodial_key_encrypted"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Batch lifecycle projection — mirrors BatchRegistry.sol's on-chain state, not a source of truth. */
export const batches = pgTable("batches", {
  batchId: bigint("batch_id", { mode: "bigint" }).primaryKey(),
  farmerWallet: text("farmer_wallet").notNull(),
  crop: text("crop").notNull(),
  quantityKg: numeric("quantity_kg", { precision: 18, scale: 0, mode: "bigint" }).notNull(),
  geohash: text("geohash").notNull(),
  ipfsPhotoHash: text("ipfs_photo_hash").notNull(),
  status: text("status", { enum: ["REGISTERED", "IN_TRANSIT", "DELIVERED", "RESOLVED"] })
    .notNull()
    .default("REGISTERED"),
  qualityGrade: integer("quality_grade"),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull(),
  lastBlockNumber: bigint("last_block_number", { mode: "bigint" }).notNull(),
});

export const escrows = pgTable("escrows", {
  batchId: bigint("batch_id", { mode: "bigint" }).primaryKey(),
  buyerWallet: text("buyer_wallet").notNull(),
  snapshotPrice: numeric("snapshot_price", { precision: 30, scale: 0, mode: "bigint" }).notNull(),
  depositAmount: numeric("deposit_amount", { precision: 30, scale: 0, mode: "bigint" }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  timeoutSeconds: bigint("timeout_seconds", { mode: "bigint" }).notNull(),
  settled: boolean("settled").notNull().default(false),
  refunded: boolean("refunded").notNull().default(false),
  disputed: boolean("disputed").notNull().default(false),
  farmerPayout: numeric("farmer_payout", { precision: 30, scale: 0, mode: "bigint" }),
  buyerRefund: numeric("buyer_refund", { precision: 30, scale: 0, mode: "bigint" }),
  lastBlockNumber: bigint("last_block_number", { mode: "bigint" }).notNull(),
});

export const priceHistory = pgTable(
  "price_history",
  {
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    logIndex: integer("log_index").notNull(),
    crop: text("crop").notNull(),
    pricePerKg: numeric("price_per_kg", { precision: 30, scale: 0, mode: "bigint" }).notNull(),
    sourceUri: text("source_uri").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.blockNumber, table.logIndex] })]
);

export const weighbridgeReadings = pgTable("weighbridge_readings", {
  batchId: bigint("batch_id", { mode: "bigint" }).primaryKey(),
  weightKg: numeric("weight_kg", { precision: 18, scale: 0, mode: "bigint" }).notNull(),
  deviceAddress: text("device_address").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  lastBlockNumber: bigint("last_block_number", { mode: "bigint" }).notNull(),
});

/** Singleton-per-contract cursor so the indexer resumes exactly where it left off. */
export const indexerCursor = pgTable("indexer_cursor", {
  contractName: text("contract_name").primaryKey(),
  lastIndexedBlock: bigint("last_indexed_block", { mode: "bigint" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
