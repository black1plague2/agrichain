import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getFarmerBatches, getAgriBalance, getPendingWithdrawal } from "@/lib/data";
import { getPlatformAnalytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { BatchQR } from "@/components/BatchQR";
import { BatchRegisterForm } from "@/components/BatchRegisterForm";
import { WithdrawButton } from "@/components/WithdrawButton";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";

export default async function FarmerPage() {
  const session = await getSession();
  if (!session || session.role !== "farmer") redirect("/login");
  const locale = await getLocale();
  const t = dict(locale);
  const crops = t.common.crops;

  const [batches, balance, pending, analytics] = await Promise.all([
    getFarmerBatches(session.wallet),
    getAgriBalance(session.wallet as `0x${string}`),
    getPendingWithdrawal(session.wallet as `0x${string}`),
    getPlatformAnalytics(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AutoRefresh />
      <Header role={`${t.roleTabs.farmer} — ${session.name ?? session.wallet.slice(0, 8)}`} locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{t.farmerPage.heading}</h1>
            <p className="text-xs text-text-placeholder">{t.farmerPage.subheading}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border border-border-subtle bg-layer px-4 py-2">
              <span className="text-xs text-text-secondary">{t.farmerPage.balanceLabel}</span>
              <div className="tabular text-lg font-semibold text-text-primary">
                <Numeral>{formatAgri(balance)}</Numeral> AGRI
              </div>
            </div>
            <WithdrawButton pendingAmount={pending} locale={locale} />
          </div>
        </div>

        <AnalyticsPanel data={analytics} locale={locale} />

        <Panel title={t.farmerPage.registerPanelTitle}>
          <BatchRegisterForm farmerWallet={session.wallet} locale={locale} />
        </Panel>

        <Panel title={t.farmerPage.historyPanelTitle} stamp={`${batches.length} total`}>
          {batches.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-placeholder">{t.farmerPage.historyEmpty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="rule-strong text-xs font-medium uppercase tracking-wide text-text-placeholder">
                    <th className="py-2 pr-3">{t.farmerPage.colId}</th>
                    <th className="py-2 pr-3">{t.farmerPage.colCrop}</th>
                    <th className="py-2 pr-3">{t.farmerPage.colQuantity}</th>
                    <th className="py-2 pr-3">{t.farmerPage.colJourney}</th>
                    <th className="py-2 pr-3">{t.farmerPage.colQr}</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(({ batch, escrow, reading }) => (
                    <tr key={batch.batchId.toString()} className="rule">
                      <td className="py-3 pr-3">
                        <Numeral>#{batch.batchId.toString()}</Numeral>
                      </td>
                      <td className="py-3 pr-3">{crops[batch.crop as keyof typeof crops] ?? batch.crop}</td>
                      <td className="py-3 pr-3">
                        <Numeral>{formatKg(batch.quantityKg)} kg</Numeral>
                      </td>
                      <td className="py-3 pr-3">
                        <PipelineDots
                          current={derivePipelineStage({
                            batchStatus: batch.status,
                            hasEscrow: !!escrow,
                            hasReading: !!reading,
                            settled: !!escrow?.settled,
                          })}
                          locale={locale}
                        />
                      </td>
                      <td className="py-3">
                        <BatchQR batchId={batch.batchId.toString()} size={64} locale={locale} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <ActivityFeed title={t.activityFeed.defaultTitle} locale={locale} />
      </main>
    </div>
  );
}
