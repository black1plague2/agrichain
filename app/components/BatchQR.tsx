"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function BatchQR({ batchId, size = 96 }: { batchId: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${window.location.origin}/verify/${batchId}`;
    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark: "#211c16", light: "#f4efe2" },
    });
  }, [batchId, size]);

  return <canvas ref={canvasRef} className="border-[1.5px] border-ink" />;
}
