"use client";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export class NoWalletError extends Error {
  constructor() {
    super("No wallet extension found — install MetaMask to continue.");
  }
}

/** Connects to window.ethereum directly (no RainbowKit / WalletConnect Cloud project ID needed). */
export async function connectAndSignLogin(role: "buyer" | "logistics") {
  if (!window.ethereum) throw new NoWalletError();

  const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  const wallet = accounts[0];
  if (!wallet) throw new Error("no account returned by wallet");

  const nonce = Date.now();
  const message = `AgriChain login\nrole: ${role}\nwallet: ${wallet}\nnonce: ${nonce}`;

  const signature = (await window.ethereum.request({
    method: "personal_sign",
    params: [message, wallet],
  })) as string;

  return { wallet, message, signature, nonce };
}
