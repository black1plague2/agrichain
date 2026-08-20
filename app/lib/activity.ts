import { formatAgri, formatKg } from "@/components/ui/Numeral";
import type { Locale } from "./i18n/locale";
import { dict } from "./i18n/dictionary";

export type ActivityCategory = "registration" | "pricing" | "logistics" | "weighbridge" | "settlement" | "dispute";

/** Validated categorical palette (dataviz skill default, slots 1/2/3/4/6/5 in that fixed
 * order — the order is the CVD-safety guarantee, not a cosmetic choice). Kept out of Tailwind
 * theme tokens since these identify event *categories* in a timeline, not brand/status colors. */
export const CATEGORY_COLOR: Record<ActivityCategory, string> = {
  registration: "#2a78d6",
  weighbridge: "#eb6834",
  logistics: "#1baf7a",
  pricing: "#eda100",
  dispute: "#e87ba4",
  settlement: "#008300",
};

export function categoryLabel(category: ActivityCategory, locale: Locale): string {
  return dict(locale).activityFeed.filters[category];
}

export type ActivityEntry = {
  id: string;
  blockNumber: string;
  txHash: string;
  category: ActivityCategory;
  text: string;
  processedAt: string;
};

/** Turns one raw_events row into a plain-language sentence in the caller's locale. Returns null
 * for events that are setup noise (role grants, etc.) rather than something a normal person
 * needs to see. */
export function humanizeEvent(
  row: {
    blockNumber: bigint;
    logIndex: number;
    txHash: string;
    contractName: string;
    eventName: string;
    payload: unknown;
    processedAt: Date;
  },
  locale: Locale
): ActivityEntry | null {
  const p = row.payload as Record<string, string>;
  const id = `${row.blockNumber}-${row.logIndex}`;
  const base = { id, blockNumber: row.blockNumber.toString(), txHash: row.txHash, processedAt: row.processedAt.toISOString() };
  const t = dict(locale).activityFeed;
  const crops = dict(locale).common.crops;
  const cropName = (crop: string) => crops[crop as keyof typeof crops] ?? crop;
  const statusOrder = [t.statusLabels.registered, t.statusLabels.inTransit, t.statusLabels.delivered, t.statusLabels.settled];

  switch (`${row.contractName}.${row.eventName}`) {
    case "BatchRegistry.BatchRegistered":
      return {
        ...base,
        category: "registration",
        text: t.events.batchRegistered(p.batchId, formatKg(BigInt(p.quantityKg)), cropName(p.crop)),
      };
    case "BatchRegistry.BatchStateChanged": {
      const from = statusOrder[Number(p.from)];
      const to = statusOrder[Number(p.to)];
      if (from === to) return null; // the REGISTERED->REGISTERED no-op emitted at registration
      return { ...base, category: "logistics", text: t.events.batchMoved(p.batchId, from, to) };
    }
    case "FairPriceOracle.PriceUpdated":
      return { ...base, category: "pricing", text: t.events.priceSet(cropName(p.crop), formatAgri(BigInt(p.pricePerKg))) };
    case "FairPriceOracle.PriceJumpFlagged":
      return { ...base, category: "pricing", text: t.events.priceJumpFlagged(cropName(p.crop)) };
    case "WeighbridgeRegistry.DeviceAssigned":
      return { ...base, category: "weighbridge", text: t.events.deviceAssigned(p.batchId) };
    case "WeighbridgeRegistry.WeightVerified":
      return {
        ...base,
        category: "weighbridge",
        text: t.events.weightVerified(p.batchId, formatKg(BigInt(p.weightKg))),
      };
    case "Escrow.EscrowOpened":
      return {
        ...base,
        category: "settlement",
        text: t.events.escrowOpened(p.batchId, formatAgri(BigInt(p.depositAmount))),
      };
    case "Escrow.EscrowSettled":
      return {
        ...base,
        category: "settlement",
        text: t.events.escrowSettled(p.batchId, formatAgri(BigInt(p.farmerPayout))),
      };
    case "Escrow.PenaltyApplied":
      return {
        ...base,
        category: "dispute",
        text: t.events.penaltyApplied(p.batchId, (Number(p.deviationBps) / 100).toFixed(1)),
      };
    case "Escrow.EscrowRefundedOnTimeout":
      return {
        ...base,
        category: "dispute",
        text: t.events.escrowRefunded(p.batchId, formatAgri(BigInt(p.amount))),
      };
    case "Escrow.DisputeFlagged":
      return { ...base, category: "dispute", text: t.events.disputeFlagged(p.batchId) };
    case "Escrow.DisputeResolved":
      return { ...base, category: "dispute", text: t.events.disputeResolved(p.batchId) };
    case "Escrow.Withdrawn":
      return {
        ...base,
        category: "settlement",
        text: t.events.withdrawn(formatAgri(BigInt(p.amount)), p.account.slice(0, 8)),
      };
    default:
      return null; // RoleGranted and other setup/admin events — not shown, they're noise here
  }
}
