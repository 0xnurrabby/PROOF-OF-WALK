<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,12,24&height=180&section=header&text=Proof+of+Walk&fontSize=48&fontColor=000000&fontAlignY=38&desc=Walk+to+mine+blocks+%E2%80%94+kinetic+hashpower+on+Base&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

[![Live](https://img.shields.io/badge/Live%20App-bbf7d0?style=for-the-badge&logoColor=000)](https://proof-of-walk-ten.vercel.app)
[![License](https://img.shields.io/badge/MIT-bfdbfe?style=for-the-badge&logoColor=000)](LICENSE)
[![Platform](https://img.shields.io/badge/Farcaster%20Mini%20App-fde68a?style=for-the-badge&logoColor=000)]()
[![Tech](https://img.shields.io/badge/JavaScript%20%2B%20Base-fca5a5?style=for-the-badge&logoColor=000)]()

</div>

<div align="center">
<i>A Farcaster mini app where walking generates kinetic hashpower .... accumulate enough and mine a block on Base, with a USDC tip flow included.</i>
</div>

---

## ✦ Features

<div align="center">

| | Feature | What it does |
|:---:|---|---|
| 🚶 | Walk to mine | Physical movement generates kinetic hashpower for block mining |
| ⛏️ | Block mining | Use accumulated hashpower to mine your daily block on Base |
| 💰 | USDC tip | Built-in tip flow using ERC-5792 wallet_sendCalls on Base Mainnet |
| 📱 | Farcaster native | Runs inside Warpcast / Base app, uses device motion sensors |
| 🔐 | Wallet connect | Signs and sends on-chain transactions through the Mini App SDK |

</div>

---

## ✦ Download & Run

**Step 1** .... Clone the repo

```bash
git clone https://github.com/0xnurrabby/PROOF-OF-WALK
cd PROOF-OF-WALK
```

**Step 2** .... Serve the public folder

```bash
cd public
# Open directly or use a local server
npx serve .
# Open http://localhost:3000
```

**Step 3** .... Open in a Farcaster client and start walking

---

## ✦ Setup

```
1. Clone the repo
2. Navigate to the public/ folder
3. Open index.html in a browser for basic testing
4. For full mini app experience (motion sensors + wallet):
   deploy to Vercel at your domain
   ensure these paths are publicly accessible:
   - /
   - /.well-known/farcaster.json
   - /assets/embed-3x2.png
   - /assets/splash-200.png
5. Update .well-known/farcaster.json with your accountAssociation
   fields (generated via Farcaster developer tools for your domain)
6. In app.js, set RECIPIENT to your checksummed EVM address
   and set BUILDER_CODE to your program-issued builder code
```

---

## ✦ Project Structure

```
PROOF-OF-WALK/
  public/
    index.html    ->  entry point with Farcaster mini app meta
    app.js        ->  walk session, hashrate, block mining, USDC tip logic
    tip.js        ->  USDC ERC-5792 tip flow
    styles.css    ->  UI styles
    assets/       ->  icons, splash, embed images
    .well-known/  ->  Farcaster app manifest with accountAssociation
    README.md     ->  deploy and setup notes
```

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,12,24&height=100&section=footer&animation=fadeIn" width="100%"/>

<div align="center">MIT License .... built by <a href="https://github.com/0xnurrabby">0xnurrabby</a></div>
