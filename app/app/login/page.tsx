import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-layer px-6 py-16">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-semibold text-text-primary">
          AgriChain
        </Link>
        <p className="mt-2 text-sm text-text-secondary">Sign in to your account</p>
        <p className="text-xs text-text-placeholder">Khaate mein wapas jaayein</p>
      </div>
      <LoginForm />
      <p className="mt-8 text-sm text-text-secondary">
        New here?{" "}
        <Link href="/register" className="font-medium text-accent underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
