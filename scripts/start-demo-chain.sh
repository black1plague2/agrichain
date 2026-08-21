#!/usr/bin/env bash
# AgriChain — spins up a local demo chain, tunnels it publicly, and syncs app/.env.local so the
# local app and this run's freshly-deployed contracts always agree.
#
# Anvil's accounts are deterministic (same well-known mnemonic every fresh start) so, run from a
# genuinely fresh chain, the deployer always lands the same contracts at the same addresses. This
# script enforces "genuinely fresh" itself (kills any prior anvil first) and writes the real
# deployed addresses into app/.env.local rather than assuming they'll match anything — so it's
# correct even if that assumption ever breaks, not just reproducible when it holds.
#
# What this is NOT: a substitute for a real Amoy testnet deployment. This is a local chain
# tunneled to the public internet for demo purposes. It only stays live while this script's
# processes keep running — closing the terminal / sleeping the machine kills it.
#
# After running, if the printed addresses differ from what's already on Vercel, update Vercel's
# NEXT_PUBLIC_*_ADDRESS vars and NEXT_PUBLIC_AMOY_RPC_URL to match, then `vercel --prod` again.
#
# Requires: Foundry (forge/cast/anvil) on PATH, Node.js, and app/.env.local already containing
# DATABASE_URL and PINATA_JWT (ask the project owner, or provision your own free Neon/Pinata).

set -e

# Foundry installs to ~/.foundry/bin but non-interactive shells don't always have it on PATH
# (it's normally added via ~/.bashrc, which only loads for interactive shells).
export PATH="$HOME/.foundry/bin:$PATH"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/app/.env.local"
TUNNEL_SUBDOMAIN="agrichain-amoy-mock"

DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80      # Anvil account 0
ORACLE_FEED_ADDR=0x70997970C51812dc3A010C7d01b50e0d17dc79C8                          # Anvil account 1
LOGISTICS_ADDR=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC                            # Anvil account 2
ESCROW_OPERATOR_ADDR=0x90F79bf6EB2c4f870365E785982E1f101E93b906                      # Anvil account 3
SEED_BUYER_ADDR=0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65                          # Anvil account 4

# Add your own MetaMask address here (space-separated) to have it pre-funded with ETH, AGRI,
# and LOGISTICS_ROLE on every restart — no need to ask anyone to run cast commands for you.
EXTRA_TEST_WALLETS=(
  0xADCE48f609D12805aFCd5792Bd902EEAa7580C96
  0x26a2F149B6f0F2BAfcfc0628a86b985B60225D6c
)

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy app/.env.example to app/.env.local and fill in DATABASE_URL / PINATA_JWT first."
  exit 1
fi

echo "==> Stopping any previous run..."
# pkill -f doesn't reliably match anvil.exe / node.exe from git-bash on Windows, so fall back to
# taskkill there. Both are best-effort — a clean first run has nothing to kill anyway.
pkill -f "anvil" 2>/dev/null || true
pkill -f "workers/indexer" 2>/dev/null || true
pkill -f "localtunnel" 2>/dev/null || true
if command -v taskkill >/dev/null 2>&1; then
  taskkill //F //IM anvil.exe >/dev/null 2>&1 || true
fi
sleep 1

echo "==> [1/7] Starting Anvil (2s block interval, deterministic accounts)..."
(anvil --block-time 2 > /tmp/agrichain-anvil.log 2>&1 &)
sleep 2

echo "==> [2/7] Deploying contracts..."
cd "$REPO_ROOT/contracts"
DEPLOYER_PRIVATE_KEY=$DEPLOYER_KEY \
ORACLE_FEED_ADDRESS=$ORACLE_FEED_ADDR \
LOGISTICS_ADDRESS=$LOGISTICS_ADDR \
ESCROW_OPERATOR_ADDRESS=$ESCROW_OPERATOR_ADDR \
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast > /tmp/agrichain-deploy.log 2>&1

extract_addr() { grep -oE "$1:\s+0x[a-fA-F0-9]{40}" /tmp/agrichain-deploy.log | grep -oE "0x[a-fA-F0-9]{40}"; }
FORWARDER=$(extract_addr "Forwarder")
AGRI=$(extract_addr "AgriToken")
BATCHREG=$(extract_addr "BatchRegistry")
ORACLE=$(extract_addr "FairPriceOracle")
WEIGHBRIDGE=$(extract_addr "WeighbridgeRegistry")
ESCROW=$(extract_addr "Escrow")

if [ -z "$FORWARDER" ] || [ -z "$ESCROW" ]; then
  echo "Deploy didn't produce the expected addresses — check /tmp/agrichain-deploy.log"
  exit 1
fi

echo "    Forwarder:           $FORWARDER"
echo "    AgriToken:           $AGRI"
echo "    BatchRegistry:       $BATCHREG"
echo "    FairPriceOracle:     $ORACLE"
echo "    WeighbridgeRegistry: $WEIGHBRIDGE"
echo "    Escrow:              $ESCROW"

echo "==> [3/7] Syncing app/.env.local with this run's addresses..."
python_free_sed() {
  # Portable in-place replace for a KEY=... line. macOS (BSD) sed requires a backup
  # extension after -i; GNU sed (Linux/git-bash) must NOT have one. Detect via --version.
  local key="$1" value="$2"
  if grep -q "^${key}=" "$ENV_FILE"; then
    if sed --version >/dev/null 2>&1; then
      sed -i "s#^${key}=.*#${key}=${value}#" "$ENV_FILE"
    else
      sed -i '' "s#^${key}=.*#${key}=${value}#" "$ENV_FILE"
    fi
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}
python_free_sed "NEXT_PUBLIC_CHAIN_ID" "31337"
python_free_sed "NEXT_PUBLIC_AMOY_RPC_URL" "http://127.0.0.1:8545"
python_free_sed "NEXT_PUBLIC_FORWARDER_ADDRESS" "$FORWARDER"
python_free_sed "NEXT_PUBLIC_AGRI_TOKEN_ADDRESS" "$AGRI"
python_free_sed "NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS" "$BATCHREG"
python_free_sed "NEXT_PUBLIC_FAIR_PRICE_ORACLE_ADDRESS" "$ORACLE"
python_free_sed "NEXT_PUBLIC_WEIGHBRIDGE_REGISTRY_ADDRESS" "$WEIGHBRIDGE"
python_free_sed "NEXT_PUBLIC_ESCROW_ADDRESS" "$ESCROW"

echo "==> [4/7] Funding test wallets..."
ROLE=$(cast keccak "LOGISTICS_ROLE")
cast send "$SEED_BUYER_ADDR" --value 10ether --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null
cast send "$AGRI" "mint(address,uint256)" "$SEED_BUYER_ADDR" 100000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null

for wallet in "${EXTRA_TEST_WALLETS[@]}"; do
  echo "    funding $wallet (ETH + AGRI + LOGISTICS_ROLE)"
  cast send "$wallet" --value 100ether --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null
  cast send "$AGRI" "mint(address,uint256)" "$wallet" 100000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null
  cast send "$BATCHREG" "grantRole(bytes32,address)" "$ROLE" "$wallet" --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null
  cast send "$WEIGHBRIDGE" "grantRole(bytes32,address)" "$ROLE" "$wallet" --rpc-url http://127.0.0.1:8545 --private-key $DEPLOYER_KEY > /dev/null
done

echo "==> [5/7] Resetting demo data and reseeding..."
cd "$REPO_ROOT/app"
npm run reset-demo
npm run seed

echo "==> [6/7] Starting the indexer..."
(npm run indexer > /tmp/agrichain-indexer.log 2>&1 &)
sleep 2

echo "==> [7/7] Starting the public tunnel..."
(npx --yes localtunnel --port 8545 --subdomain "$TUNNEL_SUBDOMAIN" > /tmp/agrichain-tunnel.log 2>&1 &)
sleep 5
cat /tmp/agrichain-tunnel.log

echo ""
if [ "$FORWARDER" = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1" ]; then
  echo "Addresses match what's already configured on Vercel — the deployed site should be working again."
else
  echo "Addresses differ from what's on Vercel right now. Update these env vars on Vercel and redeploy:"
  echo "  NEXT_PUBLIC_AMOY_RPC_URL=https://${TUNNEL_SUBDOMAIN}.loca.lt"
  echo "  NEXT_PUBLIC_FORWARDER_ADDRESS=$FORWARDER"
  echo "  NEXT_PUBLIC_AGRI_TOKEN_ADDRESS=$AGRI"
  echo "  NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS=$BATCHREG"
  echo "  NEXT_PUBLIC_FAIR_PRICE_ORACLE_ADDRESS=$ORACLE"
  echo "  NEXT_PUBLIC_WEIGHBRIDGE_REGISTRY_ADDRESS=$WEIGHBRIDGE"
  echo "  NEXT_PUBLIC_ESCROW_ADDRESS=$ESCROW"
fi
echo "If the tunnel URL above isn't https://${TUNNEL_SUBDOMAIN}.loca.lt, someone else has that"
echo "subdomain right now — pick a different --subdomain in this script and update Vercel to match."
echo ""
echo "Logs: /tmp/agrichain-anvil.log, /tmp/agrichain-indexer.log, /tmp/agrichain-tunnel.log"
echo "Keep this terminal open — closing it stops the chain, indexer, and tunnel."
