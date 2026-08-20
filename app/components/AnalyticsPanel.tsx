import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import type { PlatformAnalytics } from "@/lib/analytics";

// Ordinal sequential ramp (dataviz skill, validated for funnel/tier stages — light to dark, one hue).
const FUNNEL_RAMP = ["#86b6ef", "#5598e7", "#2a78d6", "#1c5cab", "#104281"];

export function AnalyticsPanel({ data }: { data: PlatformAnalytics }) {
  const penaltyRate = data.settledCount > 0 ? (data.penaltyCount / data.settledCount) * 100 : 0;
  const maxCropVolume = Math.max(1, ...data.cropBreakdown.map((c) => c.volumeKg));

  const funnelStages = [
    { label: "Registered", value: data.pipelineCounts.registered + data.pipelineCounts.escrowed + data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: "Escrowed", value: data.pipelineCounts.escrowed + data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: "In Transit", value: data.pipelineCounts.inTransit + data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: "Delivered", value: data.pipelineCounts.delivered + data.pipelineCounts.settled },
    { label: "Settled", value: data.pipelineCounts.settled },
  ];
  const maxFunnel = Math.max(1, funnelStages[0].value);

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Platform Analytics">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total Batches" value={data.totalBatches.toLocaleString("en-IN")} />
          <Stat label="Total Volume" value={`${formatKg(data.totalVolumeKg)} kg`} />
          <Stat label="Active Escrows" value={data.activeEscrows.toLocaleString("en-IN")} />
          <Stat label="Settled" value={data.settledCount.toLocaleString("en-IN")} />
          <Stat label="Total Settled Value" value={`${formatAgri(data.totalSettledAgri)} AGRI`} />
          <Stat
            label="Penalty Rate"
            value={`${penaltyRate.toFixed(1)}%`}
            tone={penaltyRate > 0 ? "danger" : "default"}
          />
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Volume by Crop">
          {data.cropBreakdown.length === 0 ? (
            <p className="py-4 text-center text-sm text-text-placeholder">No batches registered yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.cropBreakdown.map((c) => (
                <div key={c.crop} className="flex items-center gap-3">
                  <span className="w-16 flex-shrink-0 text-xs capitalize text-text-secondary">{c.crop}</span>
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

        <Panel title="Pipeline Funnel — All Batches">
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
