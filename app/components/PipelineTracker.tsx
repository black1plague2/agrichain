import { PIPELINE_STAGES, PipelineStageKey, stageIndex } from "@/lib/pipeline";

/** Full stepper — batch's whole journey, one row, used on /verify where the batch's full story
 * is the point of the page. */
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
              {i > 0 && (
                <div
                  className={`h-[2px] flex-1 ${i <= currentIdx ? "bg-mustard-deep" : "bg-line"}`}
                  aria-hidden
                />
              )}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center border-[1.5px] font-mono text-xs ${
                  done
                    ? "border-mustard-deep bg-mustard-deep text-paper"
                    : active
                      ? "animate-stamp border-terracotta bg-paper text-terracotta"
                      : "border-line bg-paper text-ink-faint"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              {!isLast && (
                <div
                  className={`h-[2px] flex-1 ${i < currentIdx ? "bg-mustard-deep" : "bg-line"}`}
                  aria-hidden
                />
              )}
            </div>
            <div className={`mt-2 text-center ${i === 0 ? "text-left" : isLast ? "text-right" : ""}`}>
              <p className={`font-mono text-[10px] uppercase tracking-wider ${active ? "text-terracotta" : done ? "text-ink" : "text-ink-faint"}`}>
                {stage.label}
              </p>
              <p className="text-[10px] text-ink-faint">{stage.sub}</p>
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
            i < currentIdx ? "bg-mustard-deep" : i === currentIdx ? "bg-terracotta" : "bg-line"
          }`}
        />
      ))}
      <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-soft">{currentStage.label}</span>
    </div>
  );
}
