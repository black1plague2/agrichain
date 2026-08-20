import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireEnv } from "./chain";

export const SESSION_COOKIE = "agrichain_session";
export type Role = "farmer" | "buyer" | "logistics";

export type Session = { role: Role; wallet: string; name?: string };

function secretKey() {
  return new TextEncoder().encode(requireEnv("NEXTAUTH_SECRET"));
}

/**
 * Deliberately lightweight JWT session instead of the full NextAuth.js wiring PLAN.md names —
 * farmer login is phone lookup (no wallet UI), buyer/logistics login is a signed-message check.
 * Full NextAuth Credentials+wallet provider setup is a stretch item, not required for the demo.
 */
export async function signSession(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
