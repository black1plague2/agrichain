"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

export function BatchRegisterForm({ farmerWallet, locale }: { farmerWallet: string; locale: Locale }) {
  const router = useRouter();
  const t = dict(locale);
  const [crop, setCrop] = useState("wheat");
  const [quantityKg, setQuantityKg] = useState("");
  const [geohash, setGeohash] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      let ipfsPhotoHash = "no-photo";
      if (file) {
        const form = new FormData();
        form.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "photo upload failed");
        ipfsPhotoHash = uploadData.cid;
      }

      const res = await fetch("/api/batches/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerWallet, crop, quantityKg, geohash: geohash || "unset", ipfsPhotoHash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "registration failed");

      setQuantityKg("");
      setGeohash("");
      setFile(null);
      const startedAt = Date.now();
      while (Date.now() - startedAt < 30000) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.batchRegisterForm.cropLabel}>
          <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="wheat">{t.common.crops.wheat}</option>
            <option value="rice">{t.common.crops.rice}</option>
            <option value="cotton">{t.common.crops.cotton}</option>
          </Select>
        </Field>
        <Field label={t.batchRegisterForm.quantityLabel}>
          <Input
            type="number"
            min={1}
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
            placeholder={t.batchRegisterForm.quantityPlaceholder}
          />
        </Field>
      </div>
      <Field label={t.batchRegisterForm.locationLabel} hint={t.batchRegisterForm.locationHint}>
        <Input value={geohash} onChange={(e) => setGeohash(e.target.value)} placeholder="tdr1y" />
      </Field>
      <Field label={t.batchRegisterForm.photoLabel}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="font-body text-sm text-text-secondary file:mr-3 file:border file:border-border-subtle file:bg-bg file:px-3 file:py-1.5 file:text-xs file:font-medium"
        />
      </Field>
      <Button type="submit" variant="primary" disabled={busy} className="self-start">
        {busy ? t.batchRegisterForm.submitting : t.batchRegisterForm.submit}
      </Button>
      {busy && (
        <p className="text-xs text-text-secondary">
          {t.batchRegisterForm.syncing}
        </p>
      )}
      {error && <p className="border border-danger bg-danger-tint px-3 py-2 text-sm text-danger-hover">{error}</p>}
    </form>
  );
}
