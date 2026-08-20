import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getFarmerBatches, getAgriBalance, getPendingWithdrawal } from "@/lib/data";
import { Header } from "@/components/Header";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { BatchQR } from "@/components/BatchQR";
import { BatchRegisterForm } from "@/components/BatchRegisterForm";
import { WithdrawButton } from "@/components/WithdrawButton";
import { PipelineDots } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";

export default async function FarmerPage() {
  const session = await getSession();
  if (!session || session.role !== "farmer") redirect("/login");

  const [batches, balance, pending] = await Promise.all([
    getFarmerBatches(session.wallet),
    getAgriBalance(session.wallet as `0x${string}`),
    getPendingWithdrawal(session.wallet as `0x${string}`),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <Header role={`Kisan — ${session.name ?? session.wallet.slice(0, 8)}`} />
      <main className="flex flex-1 flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl italic">Aapke Batches</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="border-[1.5px] border-ink bg-mustard-tint px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">Balance</span>
              <div className="font-mono text-lg font-semibold">
                <Numeral>{formatAgri(balance)}</Numeral> AGRI
              </div>
            </div>
            <WithdrawButton pendingAmount={pending} />
          </div>
        </div>

        <Panel title="Naya Batch Register Karein">
          <BatchRegisterForm farmerWallet={session.wallet} />
        </Panel>

        <Panel title="Batch History" stamp={`${batches.length} total`}>
          {batches.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">Abhi tak koi batch register nahi hua.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="rule-strong font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Fasal</th>
                    <th className="py-2 pr-3">Wazan</th>
                    <th className="py-2 pr-3">Journey</th>
                    <th className="py-2 pr-3">QR</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(({ batch, escrow, reading }) => (
                    <tr key={batch.batchId.toString()} className="rule">
                      <td className="py-3 pr-3">
                        <Numeral>#{batch.batchId.toString()}</Numeral>
                      </td>
                      <td className="py-3 pr-3 capitalize">{batch.crop}</td>
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
                        />
                      </td>
                      <td className="py-3">
                        <BatchQR batchId={batch.batchId.toString()} size={64} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </main>
    </div>
  );
}
