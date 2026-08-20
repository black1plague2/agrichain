import { NextRequest, NextResponse } from "next/server";
import { getBatchActivity } from "@/lib/data";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  try {
    const activity = await getBatchActivity(BigInt(batchId), 20);
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "invalid batchId" }, { status: 400 });
  }
}
