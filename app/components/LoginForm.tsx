"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleTabs, RoleKey } from "@/components/RoleTabs";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { connectAndSignLogin, NoWalletError } from "@/lib/wallet";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

const DASHBOARD_PATH: Record<RoleKey, string> = {
  farmer: "/farmer",
  buyer: "/buyer",
  logistics: "/logistics",
};

export function LoginForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = dict(locale);
  const [role, setRole] = useState<RoleKey>("farmer");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitFarmer(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/farmer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "login failed");
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
      <RoleTabs role={role} onChange={setRole} locale={locale} />

      {role === "farmer" && (
        <form onSubmit={submitFarmer} className="flex flex-col gap-4">
          <Field label={t.auth.phoneLabel}>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              type="tel"
              placeholder={t.auth.phonePlaceholder}
            />
          </Field>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? t.auth.signingIn : t.auth.logInButton}
          </Button>
        </form>
      )}

      {(role === "buyer" || role === "logistics") && (
        <Button variant="primary" onClick={() => connectWallet(role)} disabled={busy}>
          {busy ? t.common.connecting : t.common.connectWallet}
        </Button>
      )}

      {error && <p className="border border-danger bg-danger-tint px-3 py-2 text-sm text-danger-hover">{error}</p>}
    </div>
  );
}
