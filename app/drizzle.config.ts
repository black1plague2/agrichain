import { defineConfig } from "drizzle-kit";

// DATABASE_URL comes from `node --env-file=.env.local` (see package.json's db:migrate/db:studio
// scripts) — not a dotenv import, which loads too late relative to this file's own top-level
// `process.env.DATABASE_URL` read. `db:generate` doesn't need a live DB, so it's unaffected.

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
