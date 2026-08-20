import { encodePacked, keccak256, type Hex } from "viem";
import { deviceAccount, publicClient, contractAddresses } from "./chain";

/**
 * Signs a weight reading with the weighbridge device's own key — matching
 * WeighbridgeRegistry.sol's on-chain verification exactly:
 *   keccak256(address(this), block.chainid, batchId, weightKg, readingNonce)
 * then the standard "\x19Ethereum Signed Message:\n32" prefix.
 *
 * This key is never the app's or relayer's key (see PLAN.md threat model L3) — in production
 * it would live on the physical device; here it lives only in this simulator process's env.
 */
export async function signWeightReading(batchId: bigint, weightKg: bigint, nonce: bigint): Promise<Hex> {
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "uint256", "uint256", "uint256"],
      [contractAddresses.weighbridgeRegistry, BigInt(await publicClient.getChainId()), batchId, weightKg, nonce]
    )
  );

  const account = deviceAccount();
  return account.signMessage({ message: { raw: messageHash } });
}

/** A fresh nonce for each reading — timestamp-based is fine for a simulator (not exposed to farmers). */
export function freshNonce(): bigint {
  return BigInt(Date.now());
}
