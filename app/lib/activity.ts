import { formatAgri, formatKg } from "@/components/ui/Numeral";

export type ActivityEntry = {
  id: string;
  blockNumber: string;
  txHash: string;
  icon: string;
  text: string;
  processedAt: string;
};

const STATUS_LABELS: Record<number, string> = { 0: "Registered", 1: "In Transit", 2: "Delivered", 3: "Settled" };

/** Turns one raw_events row into a plain-English sentence. Returns null for events that are
 * setup noise (role grants, etc.) rather than something a normal person needs to see. */
export function humanizeEvent(row: {
  blockNumber: bigint;
  logIndex: number;
  txHash: string;
  contractName: string;
  eventName: string;
  payload: unknown;
  processedAt: Date;
}): ActivityEntry | null {
  const p = row.payload as Record<string, string>;
  const id = `${row.blockNumber}-${row.logIndex}`;
  const base = { id, blockNumber: row.blockNumber.toString(), txHash: row.txHash, processedAt: row.processedAt.toISOString() };

  switch (`${row.contractName}.${row.eventName}`) {
    case "BatchRegistry.BatchRegistered":
      return { ...base, icon: "🌾", text: `New batch #${p.batchId} registered — ${formatKg(BigInt(p.quantityKg))} kg of ${p.crop}` };
    case "BatchRegistry.BatchStateChanged": {
      const from = STATUS_LABELS[Number(p.from)];
      const to = STATUS_LABELS[Number(p.to)];
      if (from === to) return null; // the REGISTERED->REGISTERED no-op emitted at registration
      return { ...base, icon: "📦", text: `Batch #${p.batchId}: ${from} → ${to}` };
    }
    case "FairPriceOracle.PriceUpdated":
      return { ...base, icon: "📈", text: `Price set: ${p.crop} @ ₹${formatAgri(BigInt(p.pricePerKg))}/kg` };
    case "FairPriceOracle.PriceJumpFlagged":
      return { ...base, icon: "🚩", text: `Price jump flagged for ${p.crop} — moved more than 20% in one update` };
    case "WeighbridgeRegistry.DeviceAssigned":
      return { ...base, icon: "🔧", text: `Weighbridge device assigned to batch #${p.batchId}` };
    case "WeighbridgeRegistry.WeightVerified":
      return { ...base, icon: "⚖️", text: `Weight verified for batch #${p.batchId}: ${formatKg(BigInt(p.weightKg))} kg (device-signed)` };
    case "Escrow.EscrowOpened":
      return { ...base, icon: "💰", text: `Buyer opened escrow on batch #${p.batchId} — ${formatAgri(BigInt(p.depositAmount))} AGRI locked` };
    case "Escrow.EscrowSettled":
      return { ...base, icon: "✅", text: `Batch #${p.batchId} settled — farmer paid ${formatAgri(BigInt(p.farmerPayout))} AGRI` };
    case "Escrow.PenaltyApplied":
      return { ...base, icon: "⚠️", text: `Weight deviation penalty on batch #${p.batchId} (${(Number(p.deviationBps) / 100).toFixed(1)}%)` };
    case "Escrow.EscrowRefundedOnTimeout":
      return { ...base, icon: "↩️", text: `Batch #${p.batchId} escrow timed out — buyer refunded ${formatAgri(BigInt(p.amount))} AGRI` };
    case "Escrow.DisputeFlagged":
      return { ...base, icon: "🛑", text: `Batch #${p.batchId} escrow disputed — release paused` };
    case "Escrow.DisputeResolved":
      return { ...base, icon: "🔓", text: `Batch #${p.batchId} dispute resolved` };
    case "Escrow.Withdrawn":
      return { ...base, icon: "🏦", text: `${formatAgri(BigInt(p.amount))} AGRI withdrawn to ${p.account.slice(0, 8)}…` };
    default:
      return null; // RoleGranted and other setup/admin events — not shown, they're noise here
  }
}
