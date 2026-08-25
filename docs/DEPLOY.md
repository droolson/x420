# Deploying X420

Honest status: nothing here is deployed yet. These are the exact steps, and the
exact blockers, verified 2026-08-25.

## Current infrastructure facts

| Thing | State |
|---|---|
| `x420.org` | Registered at **Cloudflare**, created 2026-08-25. NS `paloma`/`ryan.ns.cloudflare.com`. **No A record yet.** |
| Cloudflare API token | **Not in Keychain.** `secretctl has CLOUDFLARE_API_TOKEN` → absent. |
| Vercel token | ✅ present and verified (`secretctl get VERCEL_TOKEN`, user `drooly`) |
| Solana treasury address | **Not chosen yet.** `wrangler.toml` has a placeholder. |
| KV namespace | **Not created yet.** Placeholder id in `wrangler.toml`. |

## 1. Cloudflare API token (needed once)

The Worker deploy needs a token. Create it at
<https://dash.cloudflare.com/profile/api-tokens> with:

- **Account** → Workers Scripts → Edit
- **Account** → Workers KV Storage → Edit
- **Zone** → DNS → Edit (zone: `x420.org`)
- **Zone** → Workers Routes → Edit (zone: `x420.org`)

Then store it — **never in a file**:

```bash
~/.hermes/bin/secretctl set CLOUDFLARE_API_TOKEN
~/.hermes/bin/secretctl set CLOUDFLARE_ACCOUNT_ID
```

## 2. Create the KV namespace

```bash
cd workers/api
export CLOUDFLARE_API_TOKEN=$(~/.hermes/bin/secretctl get CLOUDFLARE_API_TOKEN)
pnpm dlx wrangler kv namespace create X420_KV
# copy the returned id into wrangler.toml -> kv_namespaces[0].id
```

## 3. Set the treasury address

Decide the Solana address that receives x402 settlement, then:

```bash
# in wrangler.toml, replace REPLACE_WITH_X420_TREASURY_ADDRESS
# and set the facilitator key as a SECRET, not a var:
pnpm dlx wrangler secret put FACILITATOR_API_KEY
```

**Do not reuse the dApp Store publishing keypair as the treasury.** Different
blast radius: one publishes app updates, the other holds money.

## 4. Deploy the API Worker

```bash
cd workers/api
pnpm dlx wrangler deploy
# then verify for real:
curl -s https://api.x420.org/health | jq
curl -s https://api.x420.org/v1/dispensaries?county=Orange | jq '.total'
curl -si https://api.x420.org/v1/dataset/ommu-snapshot | head -1   # expect: HTTP/2 402
```

The last one is the important check: an unpaid request to a metered route must
return **402**, not the data.

## 5. Deploy the web app to Vercel

```bash
cd apps/web
pnpm build
pnpm dlx vercel deploy --prod --token "$(~/.hermes/bin/secretctl get VERCEL_TOKEN)"
```

Set `VITE_X420_API=https://api.x420.org` in the Vercel project env.

## 6. DNS

In Cloudflare DNS for `x420.org`:

- `x420.org` → Vercel (CNAME per Vercel's instructions, proxied **off** for the
  apex verification, then per Vercel's guidance)
- `api.x420.org` → handled by the Worker route in `wrangler.toml`; no manual
  record needed once the route is bound.

## 7. dApp Store (Seeker)

Blocked on an Android build. The pipeline itself is ready:

```bash
./scripts/dapp-store-publish.sh validate
./scripts/dapp-store-publish.sh mint-publisher   # costs SOL, prompts
./scripts/dapp-store-publish.sh mint-app         # costs SOL, prompts
./scripts/dapp-store-publish.sh mint-release     # needs dapp-store/x420.apk
./scripts/dapp-store-publish.sh submit
```

Prerequisites not yet met:

1. **No Android app exists yet.** The web app is the starting point; the Seeker
   app needs React Native + Mobile Wallet Adapter.
2. **No Android SDK on this machine** (checked: `~/Library/Android/sdk` absent).
3. **No publishing keypair**, and it must be funded with SOL to mint the
   Publisher/App/Release NFTs.

### Ecosystem rewards — what's real

Verified: the dApp Store charges **0% platform fees**, has **1,561+ apps** as of
June 2026, and runs **builder grants** plus **Seeker Season** campaigns. Apps that
integrate **SKR** as a reward or payment primitive get **featured placement**.

What that means concretely for X420: integrate SKR as a payment option alongside
USDC in the x402 gateway, and apply for a builder grant once there is a shipping
APK. Anything beyond that — specific payout figures, guaranteed airdrop
allocations — is not something anyone can promise you, and this repo won't pretend
otherwise.
