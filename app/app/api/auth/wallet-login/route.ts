import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyMessage } from "viem";
import { signSession, SESSION_COOKIE } from "@/lib/session";

const bodySchema = z.object({
  role: z.enum(["buyer", "logistics"]),
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string(),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  nonce: z.coerce.number(),
});

const FIVE_MINUTES_MS = 5 * 60 * 1000;

/** Buyer/logistics prove wallet ownership with a signed message — no WalletConnect project ID
 * required (unlike RainbowKit), just window.ethereum's personal_sign. See lib/wallet.ts. */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { role, wallet, message, signature, nonce } = parsed.data;

  if (Math.abs(Date.now() - nonce) > FIVE_MINUTES_MS) {
    return NextResponse.json({ error: "login challenge expired, try again" }, { status: 401 });
  }

  const expectedMessage = `AgriChain login\nrole: ${role}\nwallet: ${wallet}\nnonce: ${nonce}`;
  if (message !== expectedMessage) {
    return NextResponse.json({ error: "message mismatch" }, { status: 401 });
  }

  const valid = await verifyMessage({
    address: wallet as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });
  if (!valid) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const token = await signSession({ role, wallet });
  const response = NextResponse.json({ wallet });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
