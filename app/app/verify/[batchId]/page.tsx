import Link from "next/link";
import { notFound } from "next/navigation";
import { getBatchStory } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { StatusDot, BatchStatusKey } from "@/components/ui/StatusDot";
import { PipelineTracker } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";

const AMOY_EXPLORER = "https://amoy.polygonscan.com";
const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export default async function VerifyPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  let story;
  try {
    story = await getBatchStory(BigInt(batchId));
  } catch {
    notFound();
  }
  if (!story) notFound();

  const { batch, escrow, reading, latestPrice } = story;
  const deviationBps =
    escrow?.settled && reading
      ? (Math.abs(Number(reading.weightKg) - Number(batch.quantityKg)) * 10_000) / Number(batch.quantityKg)
      : null;

  const pipelineStage = derivePipelineStage({
    batchStatus: batch.status,
    hasEscrow: !!escrow,
    hasReading: !!reading,
    settled: !!escrow?.settled,
  });

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12 sm:px-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display text-2xl italic">
            AgriChain
          </Link>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
            Consumer Verification Ticket
          </p>
        </div>

        <Panel title="Where This Batch Is Right Now" className="animate-rise mb-4">
          <PipelineTracker current={pipelineStage} />
        </Panel>

        <Panel title={`Batch #${batchId}`} stamp={batch.status} className="animate-rise">
          <div className="flex flex-col gap-4">
            {batch.ipfsPhotoHash && batch.ipfsPhotoHash !== "no-photo" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${IPFS_GATEWAY}/${batch.ipfsPhotoHash}`}
                alt={`${batch.crop} batch photo`}
                className="border-[1.5px] border-ink object-cover"
              />
            )}

            <div className="grid grid-cols-2 gap-4 rule pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Fasal / Crop</p>
                <p className="font-display text-xl capitalize">{batch.crop}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Registered</p>
                <p className="font-display text-xl">
                  <Numeral>{formatKg(batch.quantityKg)} kg</Numeral>
                </p>
              </div>
            </div>

            <div className="rule flex items-center justify-between pb-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Status</span>
              <StatusDot status={batch.status as BatchStatusKey} />
            </div>

            {reading && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Weighbridge Verified
                </span>
                <Numeral>{formatKg(reading.weightKg)} kg</Numeral>
              </div>
            )}

            {escrow && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Locked Price
                </span>
                <Numeral>₹{formatAgri(escrow.snapshotPrice)}/kg</Numeral>
              </div>
            )}

            {escrow?.settled && (
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                  Farmer Paid
                </span>
                <Numeral className="text-lg font-semibold text-mustard-deep">
                  {formatAgri(escrow.farmerPayout ?? 0n)} AGRI
                </Numeral>
              </div>
            )}

            {deviationBps !== null && deviationBps > 500 && (
              <p className="border-[1.5px] border-terracotta bg-terracotta-tint px-3 py-2 text-xs text-terracotta-deep">
                Delivered weight deviated {(deviationBps / 100).toFixed(1)}% from registered quantity — logistics
                penalty applied, farmer paid for verified weight only.
              </p>
            )}

            {latestPrice && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">
                Mandi price source: {latestPrice.sourceUri}
              </p>
            )}
          </div>
        </Panel>

        <div className="mt-4">
          <ActivityFeed batchId={batchId} title="This Batch's Full Story, In Order" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={`${AMOY_EXPLORER}/address/${batch.farmerWallet}`}
            target="_blank"
            rel="noreferrer"
            className="border-[1.5px] border-ink px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink-soft hover:bg-paper-deep"
          >
            Farmer wallet ↗
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Reads shown here are cached for speed. This build doesn&apos;t yet run a live on-chain
          cross-check — that&apos;s TamperWatch, a stretch item, not built in this MVP.
        </p>
      </div>
    </div>
  );
}
