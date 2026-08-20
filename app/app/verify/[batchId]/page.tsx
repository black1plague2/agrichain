import Link from "next/link";
import { notFound } from "next/navigation";
import { getBatchStory, getBatchMoneyTrail } from "@/lib/data";
import { Panel } from "@/components/ui/Panel";
import { Numeral, formatAgri, formatKg } from "@/components/ui/Numeral";
import { StatusDot, BatchStatusKey } from "@/components/ui/StatusDot";
import { PipelineTracker } from "@/components/PipelineTracker";
import { derivePipelineStage } from "@/lib/pipeline";
import { ActivityFeed } from "@/components/ActivityFeed";
import { MoneyTrail } from "@/components/MoneyTrail";
import { AutoRefresh } from "@/components/AutoRefresh";
import { explorerAddressUrl } from "@/lib/chain";
import { getLocale } from "@/lib/i18n/getLocale";
import { dict } from "@/lib/i18n/dictionary";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs";

export default async function VerifyPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const locale = await getLocale();
  const t = dict(locale).verifyPage;
  const crops = dict(locale).common.crops;
  let story;
  try {
    story = await getBatchStory(BigInt(batchId));
  } catch {
    notFound();
  }
  if (!story) notFound();

  const moneyTrail = await getBatchMoneyTrail(BigInt(batchId));
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

  const farmerWalletExplorerUrl = explorerAddressUrl(batch.farmerWallet);
  const cropName = crops[batch.crop as keyof typeof crops] ?? batch.crop;

  return (
    <div className="flex flex-1 flex-col items-center bg-layer px-6 py-12 sm:px-10">
      <AutoRefresh />
      <div className="w-full max-w-3xl">
        <div className="mb-2 flex justify-end">
          <LanguageSwitcher locale={locale} />
        </div>
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-semibold text-text-primary">
            AgriChain
          </Link>
          <p className="mt-1 text-xs uppercase tracking-wide text-text-placeholder">{t.publicRecordTag}</p>
        </div>

        <Panel title={t.whereRightNow} className="animate-rise mb-4">
          <PipelineTracker current={pipelineStage} locale={locale} />
        </Panel>

        <Panel title={`${t.batchPrefix}${batchId}`} stamp={batch.status} className="animate-rise">
          <div className="flex flex-col gap-4">
            {batch.ipfsPhotoHash && batch.ipfsPhotoHash !== "no-photo" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${IPFS_GATEWAY}/${batch.ipfsPhotoHash}`}
                alt={`${cropName} batch photo`}
                className="border border-border-subtle object-cover"
              />
            )}

            <div className="grid grid-cols-2 gap-4 rule pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-placeholder">{t.crop}</p>
                <p className="text-xl font-semibold text-text-primary">{cropName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-text-placeholder">{t.registeredQuantity}</p>
                <p className="text-xl font-semibold text-text-primary">
                  <Numeral>{formatKg(batch.quantityKg)} kg</Numeral>
                </p>
              </div>
            </div>

            <div className="rule flex items-center justify-between pb-4">
              <span className="text-xs uppercase tracking-wide text-text-placeholder">{t.status}</span>
              <StatusDot status={batch.status as BatchStatusKey} locale={locale} />
            </div>

            {reading && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">{t.weighbridgeVerified}</span>
                <Numeral className="font-semibold text-text-primary">{formatKg(reading.weightKg)} kg</Numeral>
              </div>
            )}

            {escrow && (
              <div className="rule flex items-center justify-between pb-4">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">{t.lockedPrice}</span>
                <Numeral className="font-semibold text-text-primary">₹{formatAgri(escrow.snapshotPrice)}/kg</Numeral>
              </div>
            )}

            {escrow?.settled && (
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-text-placeholder">{t.farmerPaid}</span>
                <Numeral className="text-lg font-semibold text-success">
                  {formatAgri(escrow.farmerPayout ?? 0n)} AGRI
                </Numeral>
              </div>
            )}

            {deviationBps !== null && deviationBps > 500 && (
              <p className="border border-danger bg-danger-tint px-3 py-2 text-xs text-danger">
                {t.deviationWarning((deviationBps / 100).toFixed(1))}
              </p>
            )}

            {latestPrice && (
              <p className="text-xs text-text-placeholder">
                {t.priceSource} {latestPrice.sourceUri}
              </p>
            )}
          </div>
        </Panel>

        <div className="mt-4">
          <MoneyTrail entries={moneyTrail} locale={locale} />
        </div>

        <div className="mt-4">
          <ActivityFeed batchId={batchId} title={t.fullStoryTitle} locale={locale} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {farmerWalletExplorerUrl ? (
            <a
              href={farmerWalletExplorerUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-border-subtle bg-bg px-3 py-2 text-xs text-text-secondary hover:bg-layer"
            >
              {t.viewFarmerWallet}
            </a>
          ) : (
            <span
              className="border border-border-subtle bg-bg px-3 py-2 font-mono text-xs text-text-placeholder"
              title="Local demo chain — no public block explorer. This is still the farmer's real on-chain address."
            >
              {batch.farmerWallet}
            </span>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-placeholder">{t.cacheDisclaimer}</p>
      </div>
    </div>
  );
}
