"use client";

import { useRouter } from "next/navigation";

/** Was missing entirely before — /api/auth/logout existed but nothing in the UI called it. */
export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className="text-xs font-medium text-text-on-color underline-offset-2 hover:underline">
      Log out
    </button>
  );
}
