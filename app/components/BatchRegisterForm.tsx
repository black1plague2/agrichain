"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function BatchRegisterForm({ farmerWallet }: { farmerWallet: string }) {
  const router = useRouter();
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fasal / Crop">
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="border-[1.5px] border-ink bg-paper px-3 py-2.5 font-body text-sm text-ink outline-none focus:bg-paper-raised"
          >
            <option value="wheat">Gehun (Wheat)</option>
            <option value="rice">Chawal (Rice)</option>
            <option value="cotton">Kapas (Cotton)</option>
          </select>
        </Field>
        <Field label="Wazan (kg) / Quantity">
          <Input
            type="number"
            min={1}
            value={quantityKg}
            onChange={(e) => setQuantityKg(e.target.value)}
            required
            placeholder="1000"
          />
        </Field>
      </div>
      <Field label="Location (geohash)" hint="Demo ke liye koi bhi text chalega.">
        <Input value={geohash} onChange={(e) => setGeohash(e.target.value)} placeholder="tdr1y" />
      </Field>
      <Field label="Photo">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="font-body text-sm text-ink-soft file:mr-3 file:border-[1.5px] file:border-ink file:bg-paper file:px-3 file:py-1.5 file:font-mono file:text-xs file:uppercase"
        />
      </Field>
      <Button type="submit" variant="mustard" disabled={busy} className="self-start">
        {busy ? "Register ho raha hai…" : "Batch Register Karein"}
      </Button>
      {error && <p className="border-[1.5px] border-terracotta bg-terracotta-tint px-3 py-2 text-sm text-terracotta-deep">{error}</p>}
    </form>
  );
}
