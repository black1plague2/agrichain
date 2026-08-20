import { NextRequest, NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/data";
import { isLocale } from "@/lib/i18n/locale";

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const activity = await getRecentActivity(20, isLocale(localeParam) ? localeParam : "en");
  return NextResponse.json({ activity });
}
