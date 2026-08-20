import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export function Header({ role }: { role?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border-subtle bg-text-primary px-6 py-3.5">
      <Link href="/" className="flex items-baseline gap-3">
        <span className="text-lg font-semibold tracking-tight text-text-on-color">AgriChain</span>
        <span className="hidden text-xs text-text-placeholder sm:inline">Supply Chain Platform</span>
      </Link>
      {role && (
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-placeholder">{role}</span>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
