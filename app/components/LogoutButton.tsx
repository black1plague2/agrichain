"use client";

import { useRouter } from "next/navigation";
import { dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/locale";

/** Was missing entirely before — /api/auth/logout existed but nothing in the UI called it. */
export function LogoutButton({ locale }: { locale: Locale }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-xs font-medium text-text-on-color underline-offset-2 hover:underline">
      {dict(locale).common.logOut}
    </button>
  );
}
