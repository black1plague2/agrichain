import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-2xl italic">
          AgriChain
        </Link>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">
          Khaate mein wapas jaayein
        </p>
      </div>
      <LoginForm />
      <p className="mt-8 text-sm text-ink-soft">
        Naye ho?{" "}
        <Link href="/register" className="font-semibold text-terracotta underline">
          Register karein
        </Link>
      </p>
    </div>
  );
}
