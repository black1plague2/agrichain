import { NextResponse } from "next/server";
import { deviceAccount } from "@/lib/chain";

/** Exposes only the device's public address so logistics can call assignDevice — the private
 * key backing it (WEIGHBRIDGE_DEVICE_PRIVATE_KEY) never leaves the server. */
export async function GET() {
  try {
    const account = deviceAccount();
    return NextResponse.json({ address: account.address });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
