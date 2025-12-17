// tip.js — isolated tip module (lazy-loaded)
// DOMAIN: https://proof-of-walk-ten.vercel.app/
//
// Requirements covered:
// - Import Attribution EXACTLY from esm.sh
// - Manual ERC-20 transfer encoding (a9059cbb)
// - ERC-5792 wallet_sendCalls with all required fields
// - Chain handling: switch to Base Mainnet 0x2105

import { Attribution } from "https://esm.sh/ox/erc8021";

function isValidEvmAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function pad32(hexNo0x) {
  return hexNo0x.padStart(64, "0");
}

function usdToUsdcAmount6(usdStr) {
  const s = (usdStr ?? "").trim();
  if (!s) throw new Error("Enter an amount");
  if (!/^\d+(\.\d+)?$/.test(s)) throw new Error("Invalid number");
  const [i, d = ""] = s.split(".");
  const dec = d.slice(0, 6).padEnd(6, "0");
  const big = BigInt(i) * 1000000n + BigInt(dec);
  if (big <= 0n) throw new Error("Amount must be > 0");
  return big;
}

function encodeErc20Transfer(to, amount6) {
  if (!isValidEvmAddress(to)) throw new Error("Invalid recipient address");
  if (amount6 <= 0n) throw new Error("Amount must be > 0");
  const selector = "a9059cbb";
  const toNo0x = to.slice(2);
  const toPadded = pad32(toNo0x.toLowerCase());
  const amtHex = amount6.toString(16);
  const amtPadded = pad32(amtHex);
  return "0x" + selector + toPadded + amtPadded;
}

async function getProvider() {
  try {
    if (window.miniapp?.sdk?.wallet?.getEthereumProvider) {
      return await window.miniapp.sdk.wallet.getEthereumProvider();
    }
  } catch {}
  if (window.ethereum) return window.ethereum;
  throw new Error("No Ethereum provider found in this context.");
}

async function ensureBaseMainnet(provider) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (chainId === "0x2105") return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }],
    });
  } catch {
    throw new Error("Please switch to Base Mainnet (0x2105) in your wallet to send USDC.");
  }
}

export async function sendUsdcTip({ usd, usdcContract, recipient, builderCode }) {
  if (!isValidEvmAddress(recipient)) throw new Error("Recipient misconfigured.");
  if (!builderCode || builderCode.includes("TODO")) throw new Error("Builder code missing.");

  const dataSuffix = Attribution.toDataSuffix({
    codes: [builderCode],
  });

  const provider = await getProvider();

  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const from = accounts?.[0];
  if (!from) throw new Error("No account connected.");

  await ensureBaseMainnet(provider);

  const amount6 = usdToUsdcAmount6(usd);
  const data = encodeErc20Transfer(recipient, amount6);

  const params = {
    version: "2.0.0",
    from,
    chainId: "0x2105",
    atomicRequired: true,
    calls: [
      {
        to: usdcContract,
        value: "0x0",
        data,
      },
    ],
    capabilities: {
      dataSuffix,
    },
  };

  return provider.request({
    method: "wallet_sendCalls",
    params: [params],
  });
}
