import { formatAgri, formatKg } from "@/components/ui/Numeral";

export type ActivityCategory = "registration" | "pricing" | "logistics" | "weighbridge" | "settlement" | "dispute";

/** Validated categorical palette (dataviz skill default, slots 1/2/3/4/6/5 in that fixed
 * order — the order is the CVD-safety guarantee, not a cosmetic choice). Kept out of Tailwind
 * theme tokens since these identify event *categories* in a timeline, not brand/status colors. */
export const CATEGORY_CONFIG: Record<ActivityCategory, { label: string; color: string }> = {
  registration: { label: "Registration", color: "#2a78d6" },
  weighbridge: { label: "Weighbridge", color: "#eb6834" },
  logistics: { label: "Logistics", color: "#1baf7a" },
  pricing: { label: "Pricing", color: "#eda100" },
  dispute: { label: "Dispute", color: "#e87ba4" },
  settlement: { label: "Settlement", color: "#008300" },
};

export type ActivityEntry = {
  id: string;
  blockNumber: string;
  txHash: string;
  category: ActivityCategory;
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
      return {
        ...base,
        category: "registration",
        text: `Batch #${p.batchId} registered — ${formatKg(BigInt(p.quantityKg))} kg of ${p.crop}`,
      };
    case "BatchRegistry.BatchStateChanged": {
      const from = STATUS_LABELS[Number(p.from)];
      const to = STATUS_LABELS[Number(p.to)];
      if (from === to) return null; // the REGISTERED->REGISTERED no-op emitted at registration
      return { ...base, category: "logistics", text: `Batch #${p.batchId} moved from ${from} to ${to}` };
    }
    case "FairPriceOracle.PriceUpdated":
      return { ...base, category: "pricing", text: `Price set for ${p.crop}: ₹${formatAgri(BigInt(p.pricePerKg))}/kg` };
    case "FairPriceOracle.PriceJumpFlagged":
      return { ...base, category: "pricing", text: `Price jump flagged for ${p.crop} — moved more than 20% in one update` };
    case "WeighbridgeRegistry.DeviceAssigned":
      return { ...base, category: "weighbridge", text: `Weighbridge device assigned to batch #${p.batchId}` };
    case "WeighbridgeRegistry.WeightVerified":
      return {
        ...base,
        category: "weighbridge",
        text: `Weight verified for batch #${p.batchId}: ${formatKg(BigInt(p.weightKg))} kg, device-signed`,
      };
    case "Escrow.EscrowOpened":
      return {
        ...base,
        category: "settlement",
        text: `Escrow opened on batch #${p.batchId} — ${formatAgri(BigInt(p.depositAmount))} AGRI locked`,
      };
    case "Escrow.EscrowSettled":
      return {
        ...base,
        category: "settlement",
        text: `Batch #${p.batchId} settled — farmer paid ${formatAgri(BigInt(p.farmerPayout))} AGRI`,
      };
    case "Escrow.PenaltyApplied":
      return {
        ...base,
        category: "dispute",
        text: `Weight deviation penalty on batch #${p.batchId} — ${(Number(p.deviationBps) / 100).toFixed(1)}%`,
      };
    case "Escrow.EscrowRefundedOnTimeout":
      return {
        ...base,
        category: "dispute",
        text: `Batch #${p.batchId} escrow timed out — buyer refunded ${formatAgri(BigInt(p.amount))} AGRI`,
      };
    case "Escrow.DisputeFlagged":
      return { ...base, category: "dispute", text: `Batch #${p.batchId} escrow disputed — release paused` };
    case "Escrow.DisputeResolved":
      return { ...base, category: "dispute", text: `Batch #${p.batchId} dispute resolved` };
    case "Escrow.Withdrawn":
      return {
        ...base,
        category: "settlement",
        text: `${formatAgri(BigInt(p.amount))} AGRI withdrawn to ${p.account.slice(0, 8)}…`,
      };
    default:
      return null; // RoleGranted and other setup/admin events — not shown, they're noise here
  }
}
