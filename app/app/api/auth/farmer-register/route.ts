import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { db } from "@/db/client";
import { farmers } from "@/db/schema";
import { encryptFarmerKey } from "@/lib/custody";
import { signSession, SESSION_COOKIE } from "@/lib/session";

const bodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
});

/**
 * Creates a farmer's custodial wallet server-side — the farmer never sees a seed phrase or a
 * wallet UI. Private key is generated, immediately encrypted (AES-256-GCM, lib/custody.ts), and
 * only the ciphertext ever touches Postgres.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { name, phone } = parsed.data;

  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  try {
    await db.insert(farmers).values({
      walletAddress: account.address,
      name,
      phone,
      custodialKeyEncrypted: encryptFarmerKey(privateKey),
    });
  } catch {
    return NextResponse.json({ error: "phone already registered" }, { status: 409 });
  }

  const token = await signSession({ role: "farmer", wallet: account.address, name });
  const response = NextResponse.json({ wallet: account.address });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
