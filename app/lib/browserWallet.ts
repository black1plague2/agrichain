"use client";

import { createWalletClient, custom } from "viem";
import { amoy } from "./chain";

/** Client-side wallet for buyer/logistics writes — plain window.ethereum, same reasoning as
 * lib/wallet.ts: no RainbowKit/WalletConnect Cloud project ID to provision. */
export function getBrowserWalletClient() {
  if (!window.ethereum) throw new Error("No wallet extension found — install MetaMask to continue.");
  return createWalletClient({ chain: amoy, transport: custom(window.ethereum) });
}

/**
 * Browser-side network switch. The app targets the chain from NEXT_PUBLIC_CHAIN_ID (31337 for
 * the local demo chain), but the visitor's MetaMask can be sitting on any other network — viem's
 * writeContract then fails with a chain-mismatch error before the user even gets a prompt. Ask
 * MetaMask to add (and switch to) our chain instead, mirroring wallet_addEthereumChain.
 */
export async function ensureWalletChain(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet extension found — install MetaMask to continue.");
  const target = `0x${amoy.id.toString(16)}`;
  const current = (await window.ethereum.request({ method: "eth_chainId" })) as string;
  if (current.toLowerCase() === target.toLowerCase()) return;

  const isLocal = amoy.id === 31337;
  const rpcUrl = isLocal ? "http://127.0.0.1:8545" : (process.env.NEXT_PUBLIC_AMOY_RPC_URL ?? "http://127.0.0.1:8545");
  const chainName = isLocal ? "AgriChain Local" : amoy.name;
  const nativeCurrency = isLocal ? { name: "ETH", symbol: "ETH", decimals: 18 } : amoy.nativeCurrency;

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{ chainId: target, chainName, nativeCurrency, rpcUrls: [rpcUrl] }],
    });
  } catch (err) {
    throw new Error(`Please switch your wallet to ${chainName} (chain ${amoy.id}) and retry.`);
  }
}

export async function getConnectedAddress(): Promise<`0x${string}`> {
  if (!window.ethereum) throw new Error("No wallet extension found — install MetaMask to continue.");
  const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("no account returned by wallet");
  return address as `0x${string}`;
}
