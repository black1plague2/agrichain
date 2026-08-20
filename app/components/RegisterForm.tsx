"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleTabs, RoleKey } from "@/components/RoleTabs";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { connectAndSignLogin, NoWalletError } from "@/lib/wallet";

const DASHBOARD_PATH: Record<RoleKey, string> = {
  farmer: "/farmer",
  buyer: "/buyer",
  logistics: "/logistics",
};

export function RegisterForm({ initialRole }: { initialRole: RoleKey }) {
  const router = useRouter();
  const [role, setRole] = useState<RoleKey>(initialRole);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitFarmer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/farmer-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "registration failed");
      router.push(DASHBOARD_PATH.farmer);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  async function connectWallet(walletRole: "buyer" | "logistics") {
    setError(null);
    setBusy(true);
    try {
      const { wallet, message, signature, nonce } = await connectAndSignLogin(walletRole);
      const res = await fetch("/api/auth/wallet-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: walletRole, wallet, message, signature, nonce }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "login failed");
      router.push(DASHBOARD_PATH[walletRole]);
    } catch (err) {
      setError(err instanceof NoWalletError ? err.message : err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <RoleTabs role={role} onChange={setRole} />

      {role === "farmer" && (
        <form onSubmit={submitFarmer} className="flex flex-col gap-4">
          <Field label="Full Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ramesh Kumar" />
          </Field>
          <Field label="Phone Number" hint="Wallet is linked to this number — no seed phrase needed.">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              placeholder="98765 43210"
            />
          </Field>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Registering…" : "Register"}
          </Button>
        </form>
      )}

      {(role === "buyer" || role === "logistics") && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            {role === "buyer"
              ? "Connect your wallet to browse verified batches and open escrow."
              : "Connect your wallet to manage pickups and weighbridge confirmations."}
          </p>
          <Button variant="primary" onClick={() => connectWallet(role)} disabled={busy}>
            {busy ? "Connecting…" : "Connect Wallet"}
          </Button>
        </div>
      )}

      {error && <p className="border border-danger bg-danger-tint px-3 py-2 text-sm text-danger-hover">{error}</p>}
    </div>
  );
}
