import Link from "next/link";
import { notFound } from "next/navigation";
import { getBatchStory } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { StatusDot, BatchStatusKey } from "@/components/ui/StatusDot";
import { PipelineTracker } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AutoRefresh } from "@/components/AutoRefresh";

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
    <div className="flex flex-1 flex-col items-center bg-layer px-6 py-12 sm:px-10">
      <AutoRefresh />
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-semibold text-text-primary">
            AgriChain
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-text-placeholder">Public Batch Record</p>
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
                className="border border-border-subtle object-cover"
              />
            )}

            <div className="grid grid-cols-2 gap-4 rule pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-placeholder">Crop</p>
                <p className="text-xl font-semibold capitalize text-text-primary">{batch.crop}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-placeholder">Registered Quantity</p>
                <p className="text-xl font-semibold text-text-primary">
                  <Numeral>{formatKg(batch.quantityKg)} kg</Numeral>
                </p>
              </div>
            </div>

            <div className="rule flex items-center justify-between pb-4">
              <span className="text-xs uppercase tracking-wide text-text-placeholder">Status</span>
              <StatusDot status={batch.status as BatchStatusKey} />
            </div>

            {reading && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">Weighbridge Verified</span>
                <Numeral className="font-semibold text-text-primary">{formatKg(reading.weightKg)} kg</Numeral>
              </div>
            )}

            {escrow && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">Locked Price</span>
                <Numeral className="font-semibold text-text-primary">₹{formatAgri(escrow.snapshotPrice)}/kg</Numeral>
              </div>
            )}

            {escrow?.settled && (
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">Farmer Paid</span>
                <Numeral className="text-lg font-semibold text-success">
                  {formatAgri(escrow.farmerPayout ?? 0n)} AGRI
                </Numeral>
              </div>
            )}

            {deviationBps !== null && deviationBps > 500 && (
              <p className="border border-danger bg-danger-tint px-3 py-2 text-xs text-danger">
                Delivered weight deviated {(deviationBps / 100).toFixed(1)}% from registered quantity — logistics
                penalty applied, farmer paid for verified weight only.
              </p>
            )}

            {latestPrice && (
              <p className="text-xs text-text-placeholder">Price source: {latestPrice.sourceUri}</p>
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
            className="border border-border-subtle bg-bg px-3 py-2 text-xs text-text-secondary hover:bg-layer"
          >
            View farmer wallet on explorer ↗
          </a>
        </div>

        <p className="mt-6 text-center text-xs text-text-placeholder">
          Reads shown here are cached for speed. This deployment doesn&apos;t yet run a live
          on-chain cross-check on every page load — planned as a future integrity feature.
        </p>
      </div>
    </div>
  );
}
