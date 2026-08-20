import { PIPELINE_STAGES, PipelineStageKey, stageIndex } from "@/lib/pipeline";

/** Full stepper — batch's whole journey, one row, used on /verify where the batch's full story
 * is the point of the page. Carbon-style progress indicator: filled = complete, ringed = current. */
export function PipelineTracker({ current }: { current: PipelineStageKey }) {
  const currentIdx = stageIndex(current);

  return (
    <div className="flex w-full items-start">
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const isLast = i === PIPELINE_STAGES.length - 1;

        return (
          <div key={stage.key} className={`flex flex-1 flex-col items-center ${i === 0 ? "items-start" : isLast ? "items-end" : ""}`}>
            <div className="flex w-full items-center">
              {i > 0 && <div className={`h-0.5 flex-1 ${i <= currentIdx ? "bg-accent" : "bg-border-subtle"}`} aria-hidden />}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                  done
                    ? "border-accent bg-accent text-text-on-color"
                    : active
                      ? "animate-pulse-ring border-2 border-accent bg-bg text-accent"
                      : "border-border-subtle bg-bg text-text-placeholder"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {!isLast && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-accent" : "bg-border-subtle"}`} aria-hidden />}
            </div>
            <div className={`mt-2 text-center ${i === 0 ? "text-left" : isLast ? "text-right" : ""}`}>
              <p className={`text-xs font-medium ${active ? "text-accent" : done ? "text-text-primary" : "text-text-placeholder"}`}>
                {stage.label}
              </p>
              <p className="text-[11px] text-text-placeholder">{stage.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Compact inline version — a single line of small dots, for list rows on /farmer, /buyer,
 * /logistics where full labels would be too much per-row. */
export function PipelineDots({ current }: { current: PipelineStageKey }) {
  const currentIdx = stageIndex(current);
  const currentStage = PIPELINE_STAGES[currentIdx];

  return (
    <div className="flex items-center gap-1.5" title={currentStage.label}>
      {PIPELINE_STAGES.map((stage, i) => (
        <span
          key={stage.key}
          className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
            i < currentIdx ? "bg-accent" : i === currentIdx ? "bg-accent" : "bg-border-subtle"
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-text-secondary">{currentStage.label}</span>
    </div>
  );
}
