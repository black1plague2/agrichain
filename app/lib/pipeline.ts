export type PipelineStageKey = "REGISTERED" | "ESCROWED" | "IN_TRANSIT" | "DELIVERED" | "WEIGHED" | "SETTLED";

export const PIPELINE_STAGES: { key: PipelineStageKey; label: string; sub: string }[] = [
  { key: "REGISTERED", label: "Registered", sub: "Batch darj" },
  { key: "ESCROWED", label: "Escrowed", sub: "Daam lock" },
  { key: "IN_TRANSIT", label: "In Transit", sub: "Pickup ho gaya" },
  { key: "DELIVERED", label: "Delivered", sub: "Pahunch gaya" },
  { key: "WEIGHED", label: "Weighed", sub: "Wazan verify" },
  { key: "SETTLED", label: "Settled", sub: "Bhugtan ho gaya" },
];

const ORDER: PipelineStageKey[] = ["REGISTERED", "ESCROWED", "IN_TRANSIT", "DELIVERED", "WEIGHED", "SETTLED"];

/** Derives how far along the pipeline a batch is from the same data every page already loads —
 * no new state, just a single place that turns (batch, escrow, reading) into "where are we." */
export function derivePipelineStage(params: {
  batchStatus: "REGISTERED" | "IN_TRANSIT" | "DELIVERED" | "RESOLVED";
  hasEscrow: boolean;
  hasReading: boolean;
  settled: boolean;
}): PipelineStageKey {
  if (params.settled) return "SETTLED";
  if (params.hasReading) return "WEIGHED";
  if (params.batchStatus === "DELIVERED") return "DELIVERED";
  if (params.batchStatus === "IN_TRANSIT") return "IN_TRANSIT";
  if (params.hasEscrow) return "ESCROWED";
  return "REGISTERED";
}

export function stageIndex(stage: PipelineStageKey): number {
  return ORDER.indexOf(stage);
}
