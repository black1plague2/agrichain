# AgriChain Build Checklist

Tracks progress against PLAN.md (merged version). Check items off as they land. "MVP" items are required for the demo; "Stretch" items only if time remains — see PLAN.md's MVP cut line.

## P0 — Repo scaffold — DONE
- [x] Project directory created (`Desktop/agrichain`)
- [x] Foundry installed (`forge`, `cast`, `anvil`)
- [x] `contracts/` Foundry project initialized, OpenZeppelin installed
- [x] `app/` Next.js 15 (App Router, TypeScript, Tailwind) initialized
- [x] `foundry.toml` configured (Amoy RPC, remappings)
- [x] Root `.gitignore`, `README.md`
- [x] Git repo initialized locally (no commits yet — not made unless asked)
- [x] `.env.example` for both `contracts/` and `app/`

## P1 — Smart contracts (MVP) — DONE
- [x] `AgriToken.sol` — ERC20 demo settlement token
- [x] `BatchRegistry.sol` — batch lifecycle, state machine
- [x] `FairPriceOracle.sol` — price feed, staleness + jump guard
- [x] `WeighbridgeRegistry.sol` — signed device readings (real fix, kept from threat model)
- [x] `Escrow.sol` — price snapshot at open, weight-based settlement at close, demo-mode configurable timeout, pull payments, `nonReentrant`
- [x] `Forwarder.sol` — EIP-2771 gasless relay for farmers (wraps OZ `ERC2771Forwarder`)
- [x] Foundry unit tests for every state transition — 34/34 passing, including 2 exploit-regression tests
- [x] Deploy script with deterministic ordering — verified end-to-end against local Anvil
- [ ] Stretch: `CreditScore.sol`, fuzz tests

## P2 — Backend services (MVP) — code done, provisioning is on you
- [x] Drizzle schema (`db/schema.ts`) — idempotent `raw_events` log keyed by (blockNumber, logIndex), domain tables projected from it. Migration generated at `db/migrations/0000_cheerful_silk_fever.sql`.
- [x] Event indexer (`workers/indexer.ts`) — polls all 4 contracts, per-contract cursor, backfills in 2000-block chunks, conditional upserts guarded against out-of-order reprocessing
- [x] Relayer (`lib/relayer.ts`) — EIP-712 signs farmer meta-tx (matches OZ `ERC2771Forwarder`'s exact typehash/domain), submits with exponential backoff
- [x] Weighbridge simulator (`lib/weighbridge.ts` + `/api/weighbridge/simulate`) — signs with a device key kept separate from the app/relayer key, submits the on-chain reading
- [x] IPFS uploader (`/api/upload`) — Pinata, single pin for MVP, 8MB cap
- [x] Custodial key encryption (`lib/custody.ts`) — AES-256-GCM, matches threat model L4
- [x] `@neondatabase/serverless` pooled driver wired (`db/client.ts`)
- [x] Full `npm run build` passes clean (verified with dummy env values, then removed)
- [ ] **You need to do this part**: create a free Neon project, put the pooled connection string in `app/.env.local` as `DATABASE_URL`, then run `npm run db:migrate`. Same for a free Pinata account → `PINATA_JWT`. I don't have a way to provision third-party cloud accounts or pull their secrets on your behalf — that has to come from your own login to each dashboard.
- [ ] Stretch: TamperWatch drift job, USSD gateway simulator, dual IPFS pin

## P3 — Frontend (MVP) — DONE, build verified clean, dev server smoke-tested
- [x] Design system: `globals.css` tokens (paper/ink/mustard/terracotta), Fraunces/Work Sans/IBM Plex Mono via `next/font/google`, ledger-rule background texture, `Panel`/`Button`/`Field`/`StatusDot`/`Numeral` primitives — pushed toward a tactile consumer "weighbridge ticket" feel per your steer, not a SaaS dashboard
- [x] `/` marketing/pitch page — three promises as ledger line items, honest-framing section visible (not buried), stamp motif, staggered reveal animation
- [x] `/login`, `/register` — role tabs (farmer/buyer/logistics); farmer is phone-based (no wallet UI, custodial key generated server-side); buyer/logistics connect via raw `window.ethereum` + signed-message session (see note below)
- [x] `/farmer` — batch registration form (photo → Pinata → gasless relayed register), batch history table, QR export per batch, live AGRI balance
- [x] `/buyer` — available (un-escrowed) batches with live price, one-click open-escrow (approve + openEscrow from the buyer's own wallet), settlement history
- [x] `/logistics` — pickup queue driven by real status, per-status actions (pickup → deliver → weigh-in-simulate → settle), penalty count
- [x] `/verify/:batchId` — public, no login, full batch story, deviation/penalty banner, explorer link
- [ ] Stretch: `/admin`, Hindi toggle — not built, per MVP cut line
- **Judgment call**: PLAN.md named NextAuth.js JWT and RainbowKit; I implemented a lightweight `jose`-based JWT session and plain `window.ethereum` wallet connect instead. Reason: RainbowKit needs a WalletConnect Cloud project ID — another third-party account I can't provision for you, same issue as Neon/Pinata. Functionally equivalent for the demo; swapping in the heavier libraries later is straightforward if you want RainbowKit's UI polish.
- [ ] Stretch: `/admin`, Hindi toggle (next-intl)

## P4 — End-to-end demo — code + verification done, live Amoy run is blocked on your credentials
- [x] Seed script (`scripts/seed.ts`): sets prices for wheat/rice/cotton, creates one demo farmer (phone `9999900001`), registers one demo batch via the gasless relay
- [x] **Real bug found and fixed**: `dotenv/config` imported inside `workers/indexer.ts` / `scripts/seed.ts` silently failed to populate `process.env` in time — esbuild hoists `import` statements ahead of same-file function calls, so a same-file `dotenv.config()` ran too late relative to `lib/chain.ts`'s own module-load-time env read. Fixed by switching to Node's native `--env-file=.env.local` flag in `package.json` (also applied to `db:migrate`/`db:studio`), and removed the now-unneeded `dotenv` dependency.
- [x] **Verified against a live local chain, not just reasoned about**: wrote a throwaway script that ran the actual `lib/relayer.ts` (EIP-712 farmer meta-tx) and `lib/weighbridge.ts` (device-key signing) code — deployed fresh contracts to Anvil, registered a batch through the real gasless-relay path, confirmed `_msgSender()` resolved to the farmer's address through the Forwarder; assigned a device and submitted a signed weight reading through the real signing code, confirmed it verified on-chain. Both passed. Script deleted after (throwaway, not a deliverable).
- [x] Demo script written for real (PLAN.md §8) — concrete page-by-page walkthrough now that P3 pages exist, not a placeholder
- [x] README finished — setup steps, the three things you must provide (funded wallet, RPC URL, Neon, Pinata), the `--env-file` note, demo script pointer
- [ ] **Blocked on you**: the actual "watch it run on Amoy" acceptance criterion needs a funded Amoy deployer wallet (free faucet), an Amoy RPC URL, your Neon `DATABASE_URL` migrated, and your `PINATA_JWT`. I cannot create or fund any of these myself. Once you have them: `forge script script/Deploy.s.sol --rpc-url amoy --broadcast`, fill `app/.env.local`, `npm run db:migrate`, `npm run seed`, `npm run indexer` + `npm run dev`.
- [ ] Failure path 1 live on Amoy: weight deviation → penalty (code path verified locally in Foundry tests + the live-chain check above; not yet run on Amoy itself)
- [ ] Failure path 2 live on Amoy: escrow timeout → refund (same — verified in Foundry tests, not yet run on Amoy itself)
- [ ] Stretch: CI pipeline (lint/typecheck/tests on push), coverage gate

---
**Legend:** unchecked = not started. I'll update this file at the end of each stage and report status here.
