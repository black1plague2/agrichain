import type { Locale } from "./i18n/locale";
import { dict } from "./i18n/dictionary";

export type PipelineStageKey = "REGISTERED" | "ESCROWED" | "IN_TRANSIT" | "DELIVERED" | "WEIGHED" | "SETTLED";

const ORDER: PipelineStageKey[] = ["REGISTERED", "ESCROWED", "IN_TRANSIT", "DELIVERED", "WEIGHED", "SETTLED"];

export function getPipelineStages(locale: Locale): { key: PipelineStageKey; label: string }[] {
  const t = dict(locale).pipeline;
  return [
    { key: "REGISTERED", label: t.registered },
    { key: "ESCROWED", label: t.escrowed },
    { key: "IN_TRANSIT", label: t.inTransit },
    { key: "DELIVERED", label: t.delivered },
    { key: "WEIGHED", label: t.weighed },
    { key: "SETTLED", label: t.settled },
  ];
}

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
