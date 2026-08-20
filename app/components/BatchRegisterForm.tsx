"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Select } from "@/components/ui/Field";
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
        <Field label="Crop">
          <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="wheat">Wheat (Gehun)</option>
            <option value="rice">Rice (Chawal)</option>
            <option value="cotton">Cotton (Kapas)</option>
          </Select>
        </Field>
        <Field label="Quantity (kg)">
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
      <Field label="Collection Location" hint="Any text works for this deployment (geohash).">
        <Input value={geohash} onChange={(e) => setGeohash(e.target.value)} placeholder="tdr1y" />
      </Field>
      <Field label="Photo">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="font-body text-sm text-text-secondary file:mr-3 file:border file:border-border-subtle file:bg-bg file:px-3 file:py-1.5 file:text-xs file:font-medium"
        />
      </Field>
      <Button type="submit" variant="primary" disabled={busy} className="self-start">
        {busy ? "Registering…" : "Register Batch"}
      </Button>
      {error && <p className="border border-danger bg-danger-tint px-3 py-2 text-sm text-danger-hover">{error}</p>}
    </form>
  );
}
