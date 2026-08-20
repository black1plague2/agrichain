import { NextRequest, NextResponse } from "next/server";

const REAL_RPC_URL = process.env.NEXT_PUBLIC_AMOY_RPC_URL ?? process.env.AMOY_RPC_URL ?? "";

/**
 * Same-origin JSON-RPC proxy for browser calls. Browsers hitting the tunnel RPC URL directly
 * were breaking for real visitors: sending a custom header to skip localtunnel's browser
 * interstitial forces a CORS preflight, and Anvil's own CORS policy only allows the
 * `content-type` header — so the browser refuses to send the real request at all, silently.
 * Proxying through our own domain sidesteps CORS entirely (same-origin, no preflight) and lets
 * this server-to-server leg add the bypass header safely, the same way curl already could.
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const upstream = await fetch(REAL_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "bypass-tunnel-reminder": "1" },
    body,
  });
  const text = await upstream.text();
  // Fetch spec forbids a body on 204/205/304 — constructing a Response with one throws. Anvil's
  // CORS layer returns a bare 204 for a handful of malformed-request edge cases, so this isn't
  // just theoretical.
  if (upstream.status === 204 || upstream.status === 205 || upstream.status === 304) {
    return new NextResponse(null, { status: upstream.status });
  }
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  });
}
