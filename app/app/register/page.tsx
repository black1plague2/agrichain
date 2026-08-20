import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import { RoleKey } from "@/components/RoleTabs";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialRole: RoleKey = role === "buyer" || role === "logistics" ? role : "farmer";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-2xl italic">
          AgriChain
        </Link>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
          Naya khaata kholein
        </p>
      </div>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-8 text-sm text-ink-soft">
        Pehle se khaata hai?{" "}
        <Link href="/login" className="font-semibold text-terracotta underline">
          Log in karein
        </Link>
      </p>
    </div>
  );
}
