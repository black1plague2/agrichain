"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X } from "@phosphor-icons/react";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

function QRCanvas({ batchId, size }: { batchId: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${window.location.origin}/verify/${batchId}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: "#161616", light: "#ffffff" },
    });
  }, [batchId, size]);

  return <canvas ref={canvasRef} />;
}

/** Small thumbnail that expands to a full-size, scannable QR in a modal on click — the thumbnail
 * alone (was ~64px) is too small to reliably scan with a phone camera at arm's length. */
export function BatchQR({ batchId, size = 64, locale }: { batchId: string; size?: number; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const t = dict(locale).batchQr;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-border-subtle bg-bg p-0.5 transition-shadow hover:shadow-[0_0_0_2px] hover:shadow-accent"
        title={t.clickToEnlarge}
      >
        <QRCanvas batchId={batchId} size={size} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex flex-col items-center gap-4 border border-border-subtle bg-bg p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between gap-8">
              <span className="text-sm font-semibold text-text-primary">Batch #{batchId}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <QRCanvas batchId={batchId} size={280} />
            <p className="max-w-[280px] text-center text-xs text-text-placeholder">{t.scanHint}</p>
          </div>
        </div>
      )}
    </>
  );
}
