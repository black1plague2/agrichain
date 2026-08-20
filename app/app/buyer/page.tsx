import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAvailableBatches, getBuyerEscrows, getLatestPrice } from "@/lib/data";
import { getPlatformAnalytics } from "@/lib/analytics";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { OpenEscrowButton } from "@/components/OpenEscrowButton";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";

export default async function BuyerPage() {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");
  const locale = await getLocale();
  const t = dict(locale);
  const crops = t.common.crops;

  const [available, myEscrows, analytics] = await Promise.all([
    getAvailableBatches(),
    getBuyerEscrows(session.wallet),
    getPlatformAnalytics(),
  ]);
  const prices = await Promise.all(
    Array.from(new Set(available.map((b) => b.crop))).map(async (crop) => [crop, await getLatestPrice(crop)] as const)
  );
  const priceByCrop = new Map(prices);

  return (
    <div className="flex flex-1 flex-col">
      <AutoRefresh />
      <Header role={`${t.roleTabs.buyer} — ${session.wallet.slice(0, 10)}…`} locale={locale} />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">{t.buyerPage.heading}</h1>
          <p className="text-xs text-text-placeholder">{t.buyerPage.subheading}</p>
        </div>

        <AnalyticsPanel data={analytics} locale={locale} />

        <Panel title={t.buyerPage.availablePanelTitle} stamp={`${available.length} batches`}>
          {available.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-placeholder">{t.buyerPage.availableEmpty}</p>
          ) : (
            <div className="flex flex-col">
              {available.map((b) => {
                const price = priceByCrop.get(b.crop);
                const cropName = crops[b.crop as keyof typeof crops] ?? b.crop;
                return (
                  <div key={b.batchId.toString()} className="rule flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-lg font-semibold text-text-primary">
                        {cropName} <span className="text-text-placeholder">#{b.batchId.toString()}</span>
                      </p>
                      <p className="text-sm text-text-secondary">
                        <Numeral>{formatKg(b.quantityKg)} kg</Numeral>
                        {price && (
                          <>
                            {" · "}
                            <Numeral>₹{formatAgri(price.pricePerKg)}</Numeral>/kg
                          </>
                        )}
                      </p>
                    </div>
                    {price ? (
                      <OpenEscrowButton
                        batchId={b.batchId.toString()}
                        crop={b.crop}
                        quantityKg={b.quantityKg.toString()}
                        locale={locale}
                      />
                    ) : (
                      <span className="text-xs text-text-placeholder">{t.buyerPage.noPriceSet}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title={t.buyerPage.historyPanelTitle} stamp={`${myEscrows.length} total`}>
          {myEscrows.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-placeholder">{t.buyerPage.historyEmpty}</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="rule-strong text-xs font-medium uppercase tracking-wide text-text-placeholder">
                  <th className="py-2 pr-3">{t.buyerPage.colBatch}</th>
                  <th className="py-2 pr-3">{t.buyerPage.colDeposit}</th>
                  <th className="py-2 pr-3">{t.buyerPage.colJourney}</th>
                </tr>
              </thead>
              <tbody>
                {myEscrows.map(({ escrow, batch, reading }) => (
                  <tr key={escrow.batchId.toString()} className="rule">
                    <td className="py-3 pr-3">
                      <Numeral>#{escrow.batchId.toString()}</Numeral>
                    </td>
                    <td className="py-3 pr-3">
                      <Numeral>{formatAgri(escrow.depositAmount)} AGRI</Numeral>
                    </td>
                    <td className="py-3 pr-3">
                      <PipelineDots
                        current={derivePipelineStage({
                          batchStatus: batch.status,
                          hasEscrow: true,
                          hasReading: !!reading,
                          settled: escrow.settled,
                        })}
                        locale={locale}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <ActivityFeed title={t.activityFeed.defaultTitle} locale={locale} />
      </main>
    </div>
  );
}
