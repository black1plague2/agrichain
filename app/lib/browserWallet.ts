"use client";

import { createWalletClient, custom } from "viem";
import { amoy } from "./chain";

/** Client-side wallet for buyer/logistics writes — plain window.ethereum, same reasoning as
 * lib/wallet.ts: no RainbowKit/WalletConnect Cloud project ID to provision. */
export function getBrowserWalletClient() {
  if (!window.ethereum) throw new Error("No wallet extension found — install MetaMask to continue.");
  return createWalletClient({ chain: amoy, transport: custom(window.ethereum) });
}

export async function getConnectedAddress(): Promise<`0x${string}`> {
  if (!window.ethereum) throw new Error("No wallet extension found — install MetaMask to continue.");
  const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const address = accounts[0];
  if (!address) throw new Error("no account returned by wallet");
  return address as `0x${string}`;
}
