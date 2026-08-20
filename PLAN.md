# AgriChain: Farmers-to-Market Blockchain Platform

Target: Hackathon demo MVP for India, Polygon Amoy testnet, Next.js frontend, $0 running cost.

This is the merged plan: PLAN (1)'s threat-model fixes (kept — they closed real bugs) plus the
MVP cut line, honest-framing talking points, and demo script (kept — they keep scope hackathon-sized).
See `CHECKLIST.md` for line-by-line build status.

## 1. Problem and goal

Indian farmers sell through a chain of middlemen who under-report weight, dispute prices, and
delay payment. AgriChain puts the mandi transaction on-chain end to end: farmer registers a
batch → daily oracle price → buyer escrows payment → a signed weighbridge reading releases
payment automatically, penalizing deviation → a consumer scans the batch QR and cross-checks
the story live against the chain.

## 2. MVP cut line

Must-have for the demo: `AgriToken`, `BatchRegistry`, `FairPriceOracle`, `WeighbridgeRegistry`,
`Escrow`, `Forwarder`, weighbridge simulator, farmer/buyer/logistics flows, `/verify/:batchId`.

Deferred until must-have runs live on Amoy: `CreditScore.sol`, USSD/SMS gateway, TamperWatch,
dual IPFS pinning, dual RPC fallback, Sentry, Playwright, 90%-coverage CI gate, `/admin`, Hindi
toggle. Build these only if time remains after P4's acceptance criterion is met.

## 3. Honest framing (say these out loud in the pitch)

- **Weight isn't unfakeable, it's un-forgeable-without-the-device-key.** `WeighbridgeRegistry`
  fixes the original design's weakest point: the app backend never holds the device's signing
  key, so a compromised server can't forge a reading. The device itself can still misreport if
  physically tampered with — that's a hardware problem, not a contract one. Say "no app-server
  can fake a reading," not "fraud is impossible."
- **Price isn't decentralized.** One feed-role key sets it. Jump-guard (`FairPriceOracle`, >20%
  move) flags manipulation but doesn't prevent a bad update. "Single trusted price feed for the
  demo, Chainlink-style oracle is the production path."
- **Custodial wallets are a real tradeoff.** Farmer keys live encrypted in Postgres. Acknowledge
  it as a UX-over-decentralization tradeoff for a feature-phone audience.
- **No real INR off-ramp yet.** AgriToken is a demo ERC20. One line ready: "post-hackathon,
  payout via UPI through Cashfree/Razorpay."
- **No separate logistics collateral pool.** The original threat-model spec mentioned "logistics
  collateral" without defining a bonding contract. Implemented simplification: on underweight
  delivery, the buyer is refunded the shortfall and logistics/farmer simply receive nothing for
  the undelivered portion — no separate bond is posted or slashed. Documented in `Escrow.sol`.

## 4. Smart contracts — status: built, 34/34 tests passing

All in `contracts/src/`. Foundry + OpenZeppelin, no upgradeable proxies.

- **`AgriToken.sol`** — ERC20 demo settlement token, deployer-mint only.
- **`BatchRegistry.sol`** — `REGISTERED → IN_TRANSIT → DELIVERED → RESOLVED`. Farmers register
  via `ERC2771Context` (gasless, through `Forwarder`); logistics/escrow act directly with
  `AccessControl` roles (`LOGISTICS_ROLE`, `ESCROW_ROLE`).
- **`FairPriceOracle.sol`** — `setDailyPrice` by `FEED_ROLE`; `getPrice` returns price + age;
  jump-guard emits `PriceJumpFlagged` on >20% moves without blocking the update.
- **`WeighbridgeRegistry.sol`** — `assignDevice` by logistics; `recordVerifiedWeight` verifies an
  ECDSA signature from the assigned device's own key, with per-device nonce replay protection.
- **`Escrow.sol`** — the two real fixes from the threat model:
  1. **Price snapshot at open, never re-read at settlement.** `openEscrow(batchId, expectedPrice)`
     requires `expectedPrice` to match the oracle's live price at that moment, then freezes it.
     Regression-tested: moving the price after open does not change the payout.
  2. **Settlement pays for verified weight, not registered quantity.** `payableWeight =
     min(verifiedWeight, registeredQuantity)`; underweight delivery refunds the buyer the
     shortfall instead of paying the farmer for goods never delivered. Regression-tested.
  - `defaultTimeoutSeconds` is a mutable admin-set value (default 7 days) captured per-escrow at
    open — set it to seconds before a live demo so the timeout-refund path is actually stageable.
  - Pull payments only: `withdraw()`, `nonReentrant`, checks-effects-interactions.
- **`Forwarder.sol`** — thin wrapper on OpenZeppelin's audited `ERC2771Forwarder`.
- Deferred: `CreditScore.sol` (stretch, see cut line).

Deploy script (`script/Deploy.s.sol`) deploys all six and wires role grants in one broadcast;
verified against a local Anvil chain.

## 5. Backend services (MVP) — status: not started

All TypeScript inside the Next.js app as route handlers plus worker scripts.

- **Event indexer**: polls Amoy, upserts rows keyed by `(blockNumber, logIndex)`. Use
  `@neondatabase/serverless` or PgBouncer pooling — plain `pg` against Neon's unpooled string
  exhausts connections under Vercel's serverless invocations.
- **Relayer**: holds sponsor key, submits farmer intents through `Forwarder`, tracks per-farmer
  nonces, retries with backoff.
- **Weighbridge simulator**: signs mock readings with a device key that is *not* shared with the
  app's other keys — the separation is what makes the on-chain signature check meaningful.
- **IPFS uploader**: multipart photo → Pinata, single pin for MVP.
- Deferred: TamperWatch drift job, USSD gateway, dual IPFS pinning, credit score recompute.

## 6. Frontend (MVP) — status: scaffolded (Next.js 15, TS, Tailwind, App Router)

Pages: `/`, `/login`, `/register`, `/farmer`, `/buyer`, `/logistics`, `/verify/:batchId`.
Deferred: `/admin`, Hindi toggle.

Design direction — field ledger, not startup landing page: paper-warm `#F5F1E8` background, ink
`#1C1917` text, mustard `#C99A2E` for money, terracotta `#B4552D` for status, monospace numerals
wherever money/weight appears, terse mixed Hinglish copy, data-dense tables over cards.

Stack (as built): Next.js 16, TypeScript, Tailwind v4, viem (no wagmi/RainbowKit — see P3 note
below), qrcode, zod, `jose` for sessions. Fonts: Fraunces (display), Work Sans (body), IBM Plex
Mono (every number) — pushed toward a tactile "weighbridge ticket" consumer feel, not a SaaS
dashboard.

## 7. Roadmap

1. **P0 — done**: repo scaffold, Foundry + OpenZeppelin, Next.js 16 app, `.env.example` for both.
2. **P1 — done**: 6 must-have contracts, 34 passing tests including the two exploit regressions,
   deploy script verified on local Anvil.
3. **P2 — done**: indexer (idempotent, per-contract cursor), relayer (EIP-712, verified against a
   live chain), weighbridge simulator (device-key signing, verified against a live chain), IPFS
   uploader, Drizzle schema with bigint-mode numeric columns, `@neondatabase/serverless` pooled
   driver. Provisioning Neon/Pinata themselves is on you — see README.
4. **P3 — done**: all 7 pages, field-ledger design system. **Deviation from plan**: NextAuth.js
   and RainbowKit were named in the original spec; built a lightweight `jose` JWT session and
   plain `window.ethereum` connect instead, because RainbowKit needs a WalletConnect Cloud
   project ID — another third-party account that has to come from you, same as Neon/Pinata.
5. **P4 — code done, live run blocked on your credentials**: seed script written and its riskiest
   pieces (EIP-712 farmer relay, device-key weighbridge signing) verified end-to-end against a
   real local chain — not just reasoned about from the Solidity source. The actual "watch it run
   on Amoy in front of a judge" acceptance criterion below still needs your funded wallet, RPC
   URL, Neon DB, and Pinata account, per README.

Acceptance for P4: a judge watches a farmer register a batch, a buyer escrow it, a signed
weighbridge reading release payment, and a consumer scan verify the story against the chain — all
on testnet, all free.

## 8. Demo script

1. **Hook (30s)**: on `/`, read the three promises straight off the ledger line items, then land
   the honest-framing section in one breath — "here's what this doesn't claim" lands better
   coming from you first than pulled out of you in Q&A.
2. **Happy path (90s)**: log in as the seeded farmer (phone `9999900001`, or register fresh from
   `/register`) → `/farmer` → register a batch with a real photo. Switch to `/buyer` (a second
   browser profile with a funded MetaMask) → open escrow on that batch (approve + openEscrow, two
   wallet prompts). Switch to `/logistics` → Pickup → Delivered → Weight Verify Karein (enter the
   same kg as registered) → Bhugtan Jari Karein. Scan the batch's QR from `/farmer` on a phone →
   lands on `/verify/:batchId` showing the settled story.
3. **Failure path (45s)**: pick one — (a) reduce `defaultTimeoutSeconds` on Escrow before the demo
   and let a second escrow time out live, or (b) on the weigh-in prompt, enter a weight >5% under
   the registered quantity and show the penalty banner on `/verify`.
4. **Close (15s)**: the AGRI→INR one-liner from §3, then the roadmap.

Rehearse against live Amoy, not localhost — RPC latency changes the pacing, and MetaMask's own
confirmation UI adds seconds the local flow doesn't have.
