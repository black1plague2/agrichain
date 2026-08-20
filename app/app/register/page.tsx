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
    <div className="flex flex-1 flex-col items-center justify-center bg-layer px-6 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-semibold text-text-primary">
          AgriChain
        </Link>
        <p className="mt-2 text-sm text-text-secondary">Create an account</p>
        <p className="text-xs text-text-placeholder">Naya khaata kholein</p>
      </div>
      <RegisterForm initialRole={initialRole} />
      <p className="mt-8 text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
