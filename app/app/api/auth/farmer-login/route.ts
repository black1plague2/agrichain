import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { farmers } from "@/db/schema";
import { signSession, SESSION_COOKIE } from "@/lib/session";

const bodySchema = z.object({ phone: z.string().min(6) });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const farmer = await db.query.farmers.findFirst({ where: eq(farmers.phone, parsed.data.phone) });
  if (!farmer) {
    return NextResponse.json({ error: "no farmer registered with this phone" }, { status: 404 });
  }

  const token = await signSession({ role: "farmer", wallet: farmer.walletAddress, name: farmer.name ?? undefined });
  const response = NextResponse.json({ wallet: farmer.walletAddress });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
