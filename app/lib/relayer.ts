import { type Address, type Hex, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient, relayerWalletClient, contractAddresses } from "./chain";
import { forwarderAbi } from "./abis";

/**
 * Relays a farmer's meta-transaction through Forwarder.sol (EIP-2771 / OZ ERC2771Forwarder).
 * The farmer's custodial key signs the EIP-712 request off-chain; the relayer's key submits it
 * and pays gas. The target contract sees the farmer as _msgSender(), never the relayer.
 *
 * Retries with exponential backoff since testnet RPCs occasionally drop or delay submissions.
 */
export async function relayFarmerCall({
  farmerPrivateKey,
  to,
  data,
  maxRetries = 3,
}: {
  farmerPrivateKey: Hex;
  to: Address;
  data: Hex;
  maxRetries?: number;
}): Promise<Hex> {
  const farmerAccount = privateKeyToAccount(farmerPrivateKey);
  const forwarder = contractAddresses.forwarder;

  const nonce = await publicClient.readContract({
    address: forwarder,
    abi: forwarderAbi,
    functionName: "nonces",
    args: [farmerAccount.address],
  });

  const deadline = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minute validity window
  const gasEstimate = await publicClient.estimateGas({
    account: forwarder,
    to,
    data,
  });

  const domain = {
    name: "AgriChainForwarder",
    version: "1",
    chainId: await publicClient.getChainId(),
    verifyingContract: forwarder,
  } as const;

  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint48" },
      { name: "data", type: "bytes" },
    ],
  } as const;

  const message = {
    from: farmerAccount.address,
    to,
    value: 0n,
    gas: gasEstimate,
    nonce,
    deadline,
    data,
  };

  const signature = await farmerAccount.signTypedData({
    domain,
    types,
    primaryType: "ForwardRequest",
    message,
  });

  const relayer = relayerWalletClient();

  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const txHash = await relayer.writeContract({
        address: forwarder,
        abi: forwarderAbi,
        functionName: "execute",
        args: [
          {
            from: message.from,
            to: message.to,
            value: message.value,
            gas: message.gas,
            deadline: message.deadline,
            data: message.data,
            signature,
          },
        ],
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    } catch (err) {
      lastError = err;
      const backoffMs = 500 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  throw new Error(`relayFarmerCall failed after ${maxRetries} attempts: ${String(lastError)}`);
}

/** Convenience: builds calldata for a BatchRegistry.registerBatch call, ready to relay. */
export function encodeRegisterBatch(
  abi: readonly unknown[],
  crop: string,
  quantityKg: bigint,
  geohash: string,
  ipfsPhotoHash: string
): Hex {
  return encodeFunctionData({
    abi,
    functionName: "registerBatch",
    args: [crop, quantityKg, geohash, ipfsPhotoHash],
  });
}
