import { createPublicClient, createWalletClient, http, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const REAL_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL ?? process.env.AMOY_RPC_URL ?? "";

// Server-side code (API routes, the indexer, worker scripts) talks to the real RPC URL directly
// — no CORS involved server-to-server. Browser code goes through our own same-origin
// /api/rpc proxy instead: hitting the tunnel URL directly from a real browser breaks, because
// skipping localtunnel's browser interstitial needs a custom header, and that custom header
// forces a CORS preflight that Anvil's own CORS policy (content-type only) rejects — so the
// browser silently refuses to ever send the real request. Routing through our own domain avoids
// the preflight entirely (same-origin), and the proxy route adds the bypass header server-side,
// where CORS doesn't apply. See app/api/rpc/route.ts.
const resolvedRpcUrl = typeof window === "undefined" ? REAL_RPC_URL : "/api/rpc";

// Named "amoy" for the production target, but the id is read from NEXT_PUBLIC_CHAIN_ID so this
// same client code works against a local Anvil chain (31337) during development — a hardcoded
// 80002 here caused MetaMask to reject every write with a chain-mismatch error when testing
// locally, since the wallet was genuinely on 31337.
export const amoy = {
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? "80002"),
  name: "Polygon Amoy",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: {
    default: { http: [resolvedRpcUrl] },
  },
} as const;

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — copy app/.env.example to app/.env.local`);
  return value;
}

// Adds the tunnel bypass header unconditionally — harmless server-to-server against real Amoy
// (an unrecognized header is just ignored), and harmless against our own /api/rpc proxy too.
const rpcTransport = http(undefined, { fetchOptions: { headers: { "bypass-tunnel-reminder": "1" } } });

export const publicClient = createPublicClient({
  chain: amoy,
  transport: rpcTransport,
});

/** Wallet client for the relayer's sponsor key — pays gas for farmer meta-transactions. */
export function relayerWalletClient() {
  const account = privateKeyToAccount(requireEnv("RELAYER_PRIVATE_KEY") as `0x${string}`);
  return createWalletClient({ account, chain: amoy, transport: rpcTransport });
}

/** Wallet client for the weighbridge device's own key — never shared with the app/relayer key. */
export function deviceAccount() {
  return privateKeyToAccount(requireEnv("WEIGHBRIDGE_DEVICE_PRIVATE_KEY") as `0x${string}`);
}

/** Wallet client for the oracle feed job's key. */
export function oracleFeedWalletClient() {
  const account = privateKeyToAccount(requireEnv("ORACLE_FEED_PRIVATE_KEY") as `0x${string}`);
  return createWalletClient({ account, chain: amoy, transport: rpcTransport });
}

/** True only when this deployment is actually pointed at public Polygon Amoy — a local Anvil
 * chain (id 31337, tunneled or not) has no public block explorer, so a hardcoded polygonscan.com
 * link there is just dead. Every "view on explorer" / "proof" link should check this first rather
 * than claim proof it can't actually show. */
export const hasPublicExplorer = amoy.id === 80002;
const AMOY_EXPLORER = "https://amoy.polygonscan.com";

export function explorerTxUrl(hash: string): string | null {
  return hasPublicExplorer ? `${AMOY_EXPLORER}/tx/${hash}` : null;
}

export function explorerAddressUrl(address: string): string | null {
  return hasPublicExplorer ? `${AMOY_EXPLORER}/address/${address}` : null;
}

export const contractAddresses = {
  agriToken: process.env.NEXT_PUBLIC_AGRI_TOKEN_ADDRESS as Address,
  batchRegistry: process.env.NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS as Address,
  fairPriceOracle: process.env.NEXT_PUBLIC_FAIR_PRICE_ORACLE_ADDRESS as Address,
  weighbridgeRegistry: process.env.NEXT_PUBLIC_WEIGHBRIDGE_REGISTRY_ADDRESS as Address,
  escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS as Address,
  forwarder: process.env.NEXT_PUBLIC_FORWARDER_ADDRESS as Address,
};
