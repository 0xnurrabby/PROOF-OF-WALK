# Proof of Walk — Farcaster Mini App (Base)

**Domain:** https://nurrabby.com  
**Primary route:** https://nurrabby.com/

## What this is
A production-ready static Mini App that:
- Implements required Mini App embed meta tags (`fc:miniapp` and `fc:frame`)
- Hosts a Farcaster manifest at `/.well-known/farcaster.json`
- Calls `miniapp.sdk.actions.ready()` on load
- Includes an in-app USDC tip flow on Base Mainnet using ERC-5792 `wallet_sendCalls`

## Deploy
This is a pure static site. Deploy the contents of this folder to **https://nurrabby.com** (root).

Ensure these paths are publicly accessible:
- https://nurrabby.com/
- https://nurrabby.com/.well-known/farcaster.json
- https://nurrabby.com/assets/embed-3x2.png
- https://nurrabby.com/assets/splash-200.png
- https://nurrabby.com/assets/icon-1024.png

## Tip configuration
- Recipient: 0x8Bc0C8DB6e6b48cA38B4a8875C559E890f3Fc355
- USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Base Mainnet)
- Builder code: nurrabby-proof-of-walk-001

## Notes on `accountAssociation`
The `accountAssociation` fields in `.well-known/farcaster.json` must be generated for your Farcaster account (domain verification).
Use Farcaster developer tools / domain manifest generator to create a signed association for **nurrabby.com** and paste it into the manifest.
