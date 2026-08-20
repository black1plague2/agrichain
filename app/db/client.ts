import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// @neondatabase/serverless over HTTP — no connection pooling to exhaust from Vercel's
// per-request serverless invocations. See PLAN.md §5 for why plain `pg` was ruled out.
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — copy app/.env.example to app/.env.local");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
