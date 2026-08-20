// Wipes the demo tables so a freshly-restarted local chain (block numbers back to 0) doesn't
// leave the indexer's cursor stuck in the future, silently skipping every new event. Run this
// every time the local Anvil chain is restarted — see scripts/start-demo-chain.sh.
import { db } from "../db/client";
import { batches, escrows, priceHistory, weighbridgeReadings, rawEvents, indexerCursor, farmers } from "../db/schema";

async function main() {
  await db.delete(escrows);
  await db.delete(weighbridgeReadings);
  await db.delete(priceHistory);
  await db.delete(batches);
  await db.delete(rawEvents);
  await db.delete(indexerCursor);
  await db.delete(farmers);
  console.log("[reset-demo] wiped all demo tables — ready for a fresh chain");
}

main().then(() => process.exit(0));
