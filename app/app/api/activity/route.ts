import { NextResponse } from "next/server";
import { getRecentActivity } from "@/lib/data";

export async function GET() {
  const activity = await getRecentActivity(20);
  return NextResponse.json({ activity });
}
