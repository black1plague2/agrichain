import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAvailableBatches, getBuyerEscrows, getLatestPrice } from "@/lib/data";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { OpenEscrowButton } from "@/components/OpenEscrowButton";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";

export default async function BuyerPage() {
  const session = await getSession();
  if (!session || session.role !== "buyer") redirect("/login");

  const [available, myEscrows] = await Promise.all([getAvailableBatches(), getBuyerEscrows(session.wallet)]);
  const prices = await Promise.all(
    Array.from(new Set(available.map((b) => b.crop))).map(async (crop) => [crop, await getLatestPrice(crop)] as const)
  );
  const priceByCrop = new Map(prices);

  return (
    <div className="flex flex-1 flex-col">
      <Header role={`Kharidar — ${session.wallet.slice(0, 10)}…`} />
      <main className="flex flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <h1 className="font-display text-3xl italic">Verified Batches</h1>

        <Panel title="Available Now" stamp={`${available.length} batches`}>
          {available.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Abhi koi batch available nahi hai.</p>
          ) : (
            <div className="flex flex-col">
              {available.map((b) => {
                const price = priceByCrop.get(b.crop);
                return (
                  <div key={b.batchId.toString()} className="rule flex flex-wrap items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-display text-lg capitalize">
                        {b.crop} <span className="text-ink-faint">#{b.batchId.toString()}</span>
                      </p>
                      <p className="text-sm text-ink-soft">
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
                      />
                    ) : (
                      <span className="text-xs text-ink-faint">no price set for this crop yet</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Aapka Settlement History" stamp={`${myEscrows.length} total`}>
          {myEscrows.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Abhi tak koi escrow nahi khula.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="rule-strong font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  <th className="py-2 pr-3">Batch</th>
                  <th className="py-2 pr-3">Deposit</th>
                  <th className="py-2 pr-3">Journey</th>
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
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      </main>
    </div>
  );
}
