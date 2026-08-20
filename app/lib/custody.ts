import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { requireEnv } from "./chain";

/**
 * AES-256-GCM at rest for farmer custodial private keys, per PLAN.md threat model L4. This is a
 * real mitigation, not a solved problem: if CUSTODY_MASTER_KEY and the Postgres backup both leak,
 * funds are still exposed. Documented as a deliberate tradeoff, not hidden — see PLAN.md §3.
 * Production path: account abstraction / non-custodial signing, noted as future work.
 */
function masterKey(): Buffer {
  const key = requireEnv("CUSTODY_MASTER_KEY");
  const buf = Buffer.from(key, "hex");
  if (buf.length !== 32) {
    throw new Error("CUSTODY_MASTER_KEY must be 32 bytes hex-encoded (64 hex chars)");
  }
  return buf;
}

/** Encrypts a raw private key (hex string, with or without 0x) into a storable payload. */
export function encryptFarmerKey(privateKeyHex: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey(), iv);
  const plaintext = Buffer.from(privateKeyHex.replace(/^0x/, ""), "hex");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // iv.authTag.ciphertext, each base64 — stored as a single text column.
  return [iv.toString("base64"), authTag.toString("base64"), ciphertext.toString("base64")].join(".");
}

/** Decrypts a stored payload back into a 0x-prefixed private key. Never logged. */
export function decryptFarmerKey(payload: string): `0x${string}` {
  const [ivB64, authTagB64, ciphertextB64] = payload.split(".");
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error("malformed custodial key payload");
  }

  const decipher = createDecipheriv("aes-256-gcm", masterKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, "base64")),
    decipher.final(),
  ]);

  return `0x${plaintext.toString("hex")}`;
}
