import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getLogisticsPickups } from "@/lib/data";
import { getPlatformAnalytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { StatusDot, BatchStatusKey } from "@/components/ui/StatusDot";
import { LogisticsActions } from "@/components/LogisticsActions";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";

export default async function LogisticsPage() {
  const session = await getSession();
  if (!session || session.role !== "logistics") redirect("/login");
  const locale = await getLocale();
  const t = dict(locale);
  const crops = t.common.crops;

  const [pickups, analytics] = await Promise.all([getLogisticsPickups(), getPlatformAnalytics()]);
  const settledCount = pickups.filter((p) => p.escrow.settled).length;
  const penaltyCount = pickups.filter(
    (p) => p.escrow.settled && p.escrow.farmerPayout != null && p.escrow.farmerPayout < p.escrow.depositAmount
  ).length;

  return (
    <div className="flex flex-1 flex-col">
      <AutoRefresh />
      <Header role={`${t.roleTabs.logistics} — ${session.wallet.slice(0, 10)}…`} locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{t.logisticsPage.heading}</h1>
            <p className="text-xs text-text-placeholder">{t.logisticsPage.subheading}</p>
          </div>
          <div className="flex gap-4 text-xs text-text-secondary">
            <span>
              <Numeral className="text-text-primary">{settledCount}</Numeral> {t.logisticsPage.settledLabel}
            </span>
            <span className="text-danger">
              <Numeral className="text-danger">{penaltyCount}</Numeral> {t.logisticsPage.penaltyLabel}
            </span>
          </div>
        </div>

        <AnalyticsPanel data={analytics} locale={locale} />

        <Panel title={t.logisticsPage.activePanelTitle} stamp={`${pickups.length} in flight`}>
          {pickups.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-placeholder">{t.logisticsPage.activeEmpty}</p>
          ) : (
            <div className="flex flex-col">
              {pickups.map(({ batch, escrow, reading }) => {
                const cropName = crops[batch.crop as keyof typeof crops] ?? batch.crop;
                return (
                  <div key={batch.batchId.toString()} className="rule flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-lg font-semibold text-text-primary">
                        {cropName} <span className="text-text-placeholder">#{batch.batchId.toString()}</span>
                      </p>
                      <p className="text-sm text-text-secondary">
                        <Numeral>{formatKg(batch.quantityKg)} {t.logisticsPage.kgRegistered}</Numeral>
                        {reading && (
                          <>
                            {" · "}
                            <Numeral>{formatKg(reading.weightKg)} {t.logisticsPage.kgVerified}</Numeral>
                          </>
                        )}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        <StatusDot status={batch.status as BatchStatusKey} locale={locale} />
                        {escrow.settled && (
                          <span className="text-xs text-text-placeholder">
                            <Numeral>{formatAgri(escrow.farmerPayout ?? 0n)}</Numeral> {t.logisticsPage.farmerPaidSuffix}
                          </span>
                        )}
                      </div>
                      <div className="mt-2">
                        <PipelineDots
                          current={derivePipelineStage({
                            batchStatus: batch.status,
                            hasEscrow: true,
                            hasReading: !!reading,
                            settled: escrow.settled,
                          })}
                          locale={locale}
                        />
                      </div>
                    </div>
                    <LogisticsActions
                      batchId={batch.batchId.toString()}
                      status={batch.status as "REGISTERED" | "IN_TRANSIT" | "DELIVERED" | "RESOLVED"}
                      quantityKg={batch.quantityKg.toString()}
                      hasReading={!!reading}
                      locale={locale}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <ActivityFeed title={t.activityFeed.defaultTitle} locale={locale} />
      </main>
    </div>
  );
}
