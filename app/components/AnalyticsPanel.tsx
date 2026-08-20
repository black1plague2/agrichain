import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import type { PlatformAnalytics } from "@/lib/analytics";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

// Ordinal sequential ramp (dataviz skill, validated for funnel/tier stages — light to dark, one hue).
const FUNNEL_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"];

export function AnalyticsPanel({ data, locale }: { data: PlatformAnalytics; locale: Locale }) {
  const t = dict(locale).analytics;
  const crops = dict(locale).common.crops;
  const pipeline = dict(locale).pipeline;
  const penaltyRate = data.settledCount > 0 ? (data.penaltyCount / data.settledCount) * 100 : 0;
  const maxCropVolume = Math.max(1, ...data.cropBreakdown.map((c) => c.volumeKg));

  const funnelStages = [
    { label: pipeline.registered, value: data.pipelineCounts.registered + data.pipelineCounts.escrowed + data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: pipeline.escrowed, value: data.pipelineCounts.escrowed + data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: pipeline.inTransit, value: data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: pipeline.delivered, value: data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: pipeline.settled, value: data.pipelineCounts.settled },
  ];
  const maxFunnel = Math.max(1, funnelStages[0].value);

  return (
    <div className="flex flex-col gap-4">
      <Panel title={t.panelTitle}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label={t.totalBatches} value={data.totalBatches.toLocaleString("en-IN")} />
          <Stat label={t.totalVolume} value={`${formatKg(data.totalVolumeKg)} kg`} />
          <Stat label={t.activeEscrows} value={data.activeEscrows.toLocaleString("en-IN")} />
          <Stat label={t.settled} value={data.settledCount.toLocaleString("en-IN")} />
          <Stat label={t.totalSettledValue} value={`${formatAgri(data.totalSettledAgri)} AGRI`} />
          <Stat
            label={t.penaltyRate}
            value={`${penaltyRate.toFixed(1)}%`}
            tone={penaltyRate > 0 ? "danger" : "default"}
          />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t.volumeByCrop}>
          {data.cropBreakdown.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-placeholder">{t.noBatches}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.cropBreakdown.map((c) => (
                <div key={c.crop} className="flex items-center gap-3">
                  <span className="w-16 flex-shrink-0 text-xs text-text-secondary">
                    {crops[c.crop as keyof typeof crops] ?? c.crop}
                  </span>
                  <div className="h-2 flex-1 bg-layer">
                    <div
                      className="h-2 rounded-r bg-accent"
                      style={{ width: `${Math.max(4, (c.volumeKg / maxCropVolume) * 100)}%` }}
                    />
                  </div>
                  <span className="tabular w-20 flex-shrink-0 text-right text-xs text-text-primary">
                    {formatKg(c.volumeKg)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t.pipelineFunnel}>
          <div className="flex flex-col gap-3">
            {funnelStages.map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="w-20 flex-shrink-0 text-xs text-text-secondary">{stage.label}</span>
                <div className="h-2 flex-1 bg-layer">
                  <div
                    className="h-2 rounded-r"
                    style={{
                      width: `${Math.max(4, (stage.value / maxFunnel) * 100)}%`,
                      backgroundColor: FUNNEL_RAMP[i],
                    }}
                  />
                </div>
                <Numeral className="w-8 flex-shrink-0 text-right text-xs text-text-primary">{stage.value}</Numeral>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "danger" }) {
  return (
    <div>
      <p className={`tabular text-2xl font-semibold ${tone === "danger" ? "text-danger" : "text-text-primary"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </div>
  );
}
