/**
 * Seeds demo data for the P4 walkthrough: today's prices for three crops, one demo farmer with
 * a custodial wallet, and one pre-registered batch ready to escrow live during the pitch.
 *
 * Requires: contracts deployed (script/Deploy.s.sol), app/.env.local filled in with the deployed
 * addresses, DATABASE_URL migrated, and ORACLE_FEED_PRIVATE_KEY / RELAYER_PRIVATE_KEY funded
 * with testnet MATIC for gas (get free funds at https://faucet.polygon.technology).
 *
 * Idempotent: safe to re-run — skips price-setting only never (prices always refresh), and skips
 * farmer creation if the demo phone number already exists.
 *
 * Run with: npm run seed
 */
// Env vars come from `node --env-file=.env.local` (see package.json's "seed" script) — see the
// comment in workers/indexer.ts for why a dotenv import here would run too late.
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { farmers } from "../db/schema";
import { encryptFarmerKey } from "../lib/custody";
import { publicClient, oracleFeedWalletClient, contractAddresses } from "../lib/chain";
import { fairPriceOracleAbi, batchRegistryAbi } from "../lib/abis";
import { relayFarmerCall, encodeRegisterBatch } from "../lib/relayer";

const DEMO_FARMER_PHONE = "9999900001";

const DEMO_PRICES: Record<string, bigint> = {
  wheat: 30n * 10n ** 18n, // 30 AGRI/kg
  rice: 42n * 10n ** 18n,
  cotton: 65n * 10n ** 18n,
};

async function setPrices() {
  const feed = oracleFeedWalletClient();
  for (const [crop, price] of Object.entries(DEMO_PRICES)) {
    const hash = await feed.writeContract({
      address: contractAddresses.fairPriceOracle,
      abi: fairPriceOracleAbi,
      functionName: "setDailyPrice",
      args: [crop, price, "agmarknet://seed-script"],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[seed] price set: ${crop} = ${price / 10n ** 18n} AGRI/kg (tx ${hash})`);
  }
}

/** Returns the farmer's raw private key only when freshly created — needed once, right here,
 * to register the seed batch through the relay. Never returned or logged after this call. */
async function getOrCreateDemoFarmer(): Promise<{ wallet: string; freshPrivateKey: `0x${string}` | null }> {
  const existing = await db.query.farmers.findFirst({ where: eq(farmers.phone, DEMO_FARMER_PHONE) });
  if (existing) {
    console.log(`[seed] demo farmer already exists: phone ${DEMO_FARMER_PHONE}, wallet ${existing.walletAddress}`);
    return { wallet: existing.walletAddress, freshPrivateKey: null };
  }

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  await db.insert(farmers).values({
    walletAddress: account.address,
    name: "Ramesh Kumar",
    phone: DEMO_FARMER_PHONE,
    custodialKeyEncrypted: encryptFarmerKey(privateKey),
  });
  console.log(`[seed] demo farmer created: phone ${DEMO_FARMER_PHONE}, wallet ${account.address}`);
  return { wallet: account.address, freshPrivateKey: privateKey };
}

async function seedBatch(privateKeyForRelay: `0x${string}`) {
  const data = encodeRegisterBatch(batchRegistryAbi, "wheat", 1000n, "tdr1y-demo-collection-center", "no-photo");
  const txHash = await relayFarmerCall({
    farmerPrivateKey: privateKeyForRelay,
    to: contractAddresses.batchRegistry,
    data,
  });
  console.log(`[seed] demo batch registered — tx ${txHash}. Run the indexer (npm run indexer) to see it in Postgres.`);
}

async function main() {
  console.log("[seed] setting daily prices...");
  await setPrices();

  console.log("[seed] creating demo farmer...");
  const { wallet, freshPrivateKey } = await getOrCreateDemoFarmer();

  if (freshPrivateKey) {
    console.log("[seed] registering one demo batch via gasless relay...");
    await seedBatch(freshPrivateKey);
  } else {
    console.log("[seed] farmer already existed — skipping batch registration (run it manually from /farmer if you need another one).");
  }

  console.log(`[seed] done. Log in during the demo with phone ${DEMO_FARMER_PHONE} (wallet ${wallet}).`);
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
