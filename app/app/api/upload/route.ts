import { NextRequest, NextResponse } from "next/server";
import { requireEnv } from "@/lib/chain";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB cap — batch photos, not video

/**
 * Pins a batch photo to Pinata, returns the CID that goes on-chain in registerBatch.
 * Single pin for MVP — PLAN.md defers dual-pinning (Pinata + web3.storage) to the stretch list.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "multipart 'file' field required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: `file exceeds ${MAX_FILE_BYTES} byte cap` }, { status: 413 });
  }

  const pinataForm = new FormData();
  pinataForm.append("file", file);

  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${requireEnv("PINATA_JWT")}` },
      body: pinataForm,
    });

    if (!response.ok) {
      return NextResponse.json({ error: await response.text() }, { status: response.status });
    }

    const result = (await response.json()) as { IpfsHash: string };
    return NextResponse.json({ cid: result.IpfsHash });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
