#!/usr/bin/env bash
# X420 — Solana dApp Store publishing pipeline.
#
# Automates every step that CAN be automated, and stops hard at the steps that
# require a human decision or a funded keypair.
#
# Prereqs (checked below, never assumed):
#   - pnpm, node >= 20
#   - a built signed APK at dapp-store/x420.apk
#   - a publishing keypair — NEVER committed; path via X420_PUBLISHER_KEYPAIR
#   - funded SOL on that keypair to mint Publisher/App/Release NFTs
#
# Usage:
#   ./scripts/dapp-store-publish.sh validate
#   ./scripts/dapp-store-publish.sh mint-publisher
#   ./scripts/dapp-store-publish.sh mint-app
#   ./scripts/dapp-store-publish.sh mint-release
#   ./scripts/dapp-store-publish.sh submit
set -euo pipefail

cd "$(dirname "$0")/.."
CMD="${1:-help}"
KEYPAIR="${X420_PUBLISHER_KEYPAIR:-$HOME/.config/x420/publisher.json}"
RPC="${SOLANA_RPC_URL:-https://api.mainnet-beta.solana.com}"
DS="pnpm dlx @solana-mobile/dapp-store-cli@1.0.0"

need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING: $1"; exit 1; }; }

preflight() {
  need node; need pnpm
  echo "node    $(node -v)"
  echo "pnpm    $(pnpm -v)"
  if [ ! -f "$KEYPAIR" ]; then
    echo
    echo "STOP: publishing keypair not found at $KEYPAIR"
    echo "  Generate one with:  solana-keygen new -o $KEYPAIR"
    echo "  Then FUND it — minting Publisher/App/Release NFTs costs SOL."
    echo "  Anyone holding this key can publish updates as you. Back it up offline."
    exit 1
  fi
  echo "keypair $KEYPAIR (present)"
  echo "rpc     $RPC"
}

case "$CMD" in
  validate)
    preflight
    echo "--- validating dapp-store/config.yaml ---"
    $DS validate -k "$KEYPAIR" -u "$RPC"
    ;;
  mint-publisher)
    preflight
    echo "This mints the PUBLISHER NFT. One per publisher, ever. Costs SOL."
    read -rp "Type PUBLISH to continue: " c; [ "$c" = "PUBLISH" ] || exit 1
    $DS create publisher -k "$KEYPAIR" -u "$RPC"
    ;;
  mint-app)
    preflight
    echo "This mints the APP NFT. One per app. Costs SOL."
    read -rp "Type PUBLISH to continue: " c; [ "$c" = "PUBLISH" ] || exit 1
    $DS create app -k "$KEYPAIR" -u "$RPC"
    ;;
  mint-release)
    preflight
    [ -f dapp-store/x420.apk ] || { echo "MISSING: dapp-store/x420.apk (build and sign the APK first)"; exit 1; }
    echo "This mints a RELEASE NFT for the current APK. Costs SOL."
    read -rp "Type PUBLISH to continue: " c; [ "$c" = "PUBLISH" ] || exit 1
    $DS create release -k "$KEYPAIR" -u "$RPC"
    ;;
  submit)
    preflight
    echo "This SUBMITS to the Solana dApp Store for review."
    read -rp "Type SUBMIT to continue: " c; [ "$c" = "SUBMIT" ] || exit 1
    $DS publish submit -k "$KEYPAIR" -u "$RPC" --requestor-is-authorized
    ;;
  *)
    cat <<'USAGE'
X420 dApp Store pipeline

  validate         check config.yaml against the store schema
  mint-publisher   mint the Publisher NFT   (once, costs SOL)
  mint-app         mint the App NFT         (once, costs SOL)
  mint-release     mint a Release NFT       (per release, costs SOL)
  submit           submit for store review

Every SOL-spending step requires typed confirmation. Nothing here spends
money without an explicit human keystroke.
USAGE
    ;;
esac
