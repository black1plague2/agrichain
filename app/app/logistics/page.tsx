import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getLogisticsPickups } from "@/lib/data";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { StatusDot, BatchStatusKey } from "@/components/ui/StatusDot";
import { LogisticsActions } from "@/components/LogisticsActions";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function LogisticsPage() {
  const session = await getSession();
  if (!session || session.role !== "logistics") redirect("/login");

  const pickups = await getLogisticsPickups();
  const settledCount = pickups.filter((p) => p.escrow.settled).length;
  const penaltyCount = pickups.filter(
    (p) => p.escrow.settled && p.escrow.farmerPayout != null && p.escrow.farmerPayout < p.escrow.depositAmount
  ).length;

  return (
    <div className="flex flex-1 flex-col">
      <AutoRefresh />
      <Header role={`Logistics — ${session.wallet.slice(0, 10)}…`} />
      <main className="flex flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Pickup Queue</h1>
            <p className="text-xs text-text-placeholder">Active shipments requiring action</p>
          </div>
          <div className="flex gap-4 text-xs text-text-secondary">
            <span>
              <Numeral className="text-text-primary">{settledCount}</Numeral> settled
            </span>
            <span className="text-danger">
              <Numeral className="text-danger">{penaltyCount}</Numeral> penalty
            </span>
          </div>
        </div>

        <Panel title="Active Batches" stamp={`${pickups.length} in flight`}>
          {pickups.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-placeholder">No pickups pending.</p>
          ) : (
            <div className="flex flex-col">
              {pickups.map(({ batch, escrow, reading }) => (
                <div key={batch.batchId.toString()} className="rule flex flex-wrap items-center justify-between gap-4 py-4">
                  <div>
                    <p className="text-lg font-semibold capitalize text-text-primary">
                      {batch.crop} <span className="text-text-placeholder">#{batch.batchId.toString()}</span>
                    </p>
                    <p className="text-sm text-text-secondary">
                      <Numeral>{formatKg(batch.quantityKg)} kg registered</Numeral>
                      {reading && (
                        <>
                          {" · "}
                          <Numeral>{formatKg(reading.weightKg)} kg verified</Numeral>
                        </>
                      )}
                    </p>
                    <div className="mt-1 flex items-center gap-3">
                      <StatusDot status={batch.status as BatchStatusKey} />
                      {escrow.settled && (
                        <span className="text-xs text-text-placeholder">
                          farmer paid <Numeral>{formatAgri(escrow.farmerPayout ?? 0n)}</Numeral> AGRI
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
                      />
                    </div>
                  </div>
                  <LogisticsActions
                    batchId={batch.batchId.toString()}
                    status={batch.status as "REGISTERED" | "IN_TRANSIT" | "DELIVERED" | "RESOLVED"}
                    quantityKg={batch.quantityKg.toString()}
                    hasReading={!!reading}
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <ActivityFeed title="Platform Activity" />
      </main>
    </div>
  );
}
