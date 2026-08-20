import { NextRequest, NextResponse } from "next/server";
import { getBatchActivity } from "@/lib/data";
import { isLocale } from "@/lib/i18n/locale";

export async function GET(request: NextRequest, { params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const localeParam = request.nextUrl.searchParams.get("locale");
  try {
    const activity = await getBatchActivity(BigInt(batchId), 20, isLocale(localeParam) ? localeParam : "en");
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "invalid batchId" }, { status: 400 });
  }
}
