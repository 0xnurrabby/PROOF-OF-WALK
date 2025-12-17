// Proof of Walk — Farcaster Mini App (static, no framework)
// DOMAIN: https://proof-of-walk-ten.vercel.app/
// PRIMARY_ROUTE: /
//
// IMPORTANT FIX:
// - NO top-level external imports here.
// - Tip module is lazy-loaded (tip.js) only when user taps TIP,
//   so UI/buttons never die if CSP blocks esm imports.

const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const RECIPIENT = "0x5eC6AF0798b25C563B102d3469971f1a8d598121";
const BUILDER_CODE = "bc_t4gtym55";

const el = (id) => document.getElementById(id);
const $status = el("status");
const $steps = el("steps");
const $hashrate = el("hashrate");
const $blocks = el("blocks");
const $bar = el("bar");
const $toast = el("toast");

const $btnStart = el("btnStart");
const $btnStep = el("btnStep");
const $btnReset = el("btnReset");
const $btnTip = el("btnTip");
const $btnAdd = el("btnAdd");

const $sheet = el("sheet");
const $sheetBack = el("sheetBack");
const $sheetClose = el("sheetClose");
const $tipCta = el("tipCta");
const $customUsd = el("customUsd");
const $tipNote = el("tipNote");

const STATE = {
  walking: false,
  steps: 0,
  stepEvents: [],
  blocksMined: 0,
  hasMotionPermission: false,
  tip: {
    usd: null,
    phase: "idle", // idle|preparing|confirm|sending|done
  },
};

function toast(msg, tone = "info") {
  $toast.textContent = msg;
  $toast.style.borderColor =
    tone === "err" ? "var(--err)" : tone === "ok" ? "var(--warn)" : "var(--fg)";
  $toast.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => $toast.classList.remove("show"), 2200);
}

function isValidEvmAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function openSheet() {
  $sheetBack.hidden = false;
  $sheet.hidden = false;
}
function closeSheet() {
  $sheetBack.hidden = true;
  $sheet.hidden = true;
  setTipPhase("idle");
}

function setTipPhase(phase) {
  STATE.tip.phase = phase;
  if (phase === "idle") $tipCta.textContent = "Send USDC";
  if (phase === "preparing") $tipCta.textContent = "Preparing tip…";
  if (phase === "confirm") $tipCta.textContent = "Confirm in wallet";
  if (phase === "sending") $tipCta.textContent = "Sending…";
  if (phase === "done") $tipCta.textContent = "Send again";
}

function setTipAmount(usd) {
  STATE.tip.usd = usd;
  $customUsd.value = usd ?? "";
  $tipNote.textContent = `Network: Base Mainnet (0x2105) • Token: USDC (6 decimals) • Amount: $${usd || "—"}`;
}

function tick() {
  const now = Date.now();
  STATE.stepEvents = STATE.stepEvents.filter((t) => now - t <= 30000);

  const spm = Math.round(STATE.stepEvents.length * 2);
  const hashrate = STATE.walking ? spm : 0;

  $steps.textContent = String(STATE.steps);
  $hashrate.textContent = String(hashrate);
  $blocks.textContent = `${STATE.blocksMined} / day`;

  const progress = (STATE.steps % 1000) / 1000;
  $bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;

  if (!STATE.walking) {
    $status.textContent = "STOPPED (hashrate=0)";
  } else {
    $status.textContent = hashrate > 0 ? "MINING…" : "WALK TO MINE";
  }

  requestAnimationFrame(tick);
}

function addStep(n = 1) {
  const now = Date.now();
  for (let i = 0; i < n; i++) STATE.stepEvents.push(now);
  STATE.steps += n;

  const newBlocks = Math.floor(STATE.steps / 1000);
  if (newBlocks > STATE.blocksMined) {
    STATE.blocksMined = newBlocks;
    toast(`Block mined! Total today: ${STATE.blocksMined}`, "ok");
    try {
      window.miniapp?.sdk?.actions?.haptics?.impact?.("medium");
    } catch {}
  }
}

async function requestMotionPermissionIfNeeded() {
  try {
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      const res = await DeviceMotionEvent.requestPermission();
      STATE.hasMotionPermission = res === "granted";
      return STATE.hasMotionPermission;
    }
    STATE.hasMotionPermission = true;
    return true;
  } catch {
    STATE.hasMotionPermission = false;
    return false;
  }
}

function attachMotionStepCounter() {
  let lastPeak = 0;
  let lastMag = 0;
  const THRESH = 12.5;
  const MIN_GAP_MS = 280;

  window.addEventListener(
    "devicemotion",
    (e) => {
      if (!STATE.walking) return;
      const a = e.accelerationIncludingGravity;
      if (!a) return;

      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const now = Date.now();

      if (mag > THRESH && lastMag <= THRESH && now - lastPeak > MIN_GAP_MS) {
        lastPeak = now;
        addStep(1);
      }
      lastMag = mag;
    },
    { passive: true }
  );
}

async function initMiniAppSdk() {
  // Always call ready() so Mini App chrome/splash behaves correctly.
  try {
    if (window.miniapp?.sdk?.actions?.ready) {
      await window.miniapp.sdk.actions.ready();
    }
  } catch {}

  $btnAdd.addEventListener("click", async () => {
    try {
      await window.miniapp?.sdk?.actions?.addMiniApp?.();
      toast("Added to your Mini Apps", "ok");
    } catch {
      toast("Could not add (not supported here).", "err");
    }
  });
}

function wireWalking() {
  $btnStep.addEventListener("click", () => addStep(1));

  $btnReset.addEventListener("click", () => {
    STATE.steps = 0;
    STATE.blocksMined = 0;
    STATE.stepEvents = [];
    toast("Reset.", "ok");
  });

  $btnStart.addEventListener("click", async () => {
    STATE.walking = !STATE.walking;
    $btnStart.textContent = STATE.walking ? "CONFIRM: STOP WALKING" : "CONFIRM: START WALKING";
    if (STATE.walking) {
      const ok = await requestMotionPermissionIfNeeded();
      toast(ok ? "Walking started. Move to mine." : "Motion permission denied. Use + STEP.", ok ? "ok" : "err");
    } else {
      toast("Walking stopped. Hashrate is 0.", "err");
    }
  });
}

function wireTipSheet() {
  $btnTip.addEventListener("click", () => openSheet());
  $sheetClose.addEventListener("click", closeSheet);
  $sheetBack.addEventListener("click", closeSheet);

  document.querySelectorAll(".preset").forEach((b) => {
    b.addEventListener("click", () => setTipAmount(b.dataset.usd));
  });

  $customUsd.addEventListener("input", () => {
    const v = $customUsd.value.trim();
    STATE.tip.usd = v || null;
    $tipNote.textContent = `Network: Base Mainnet (0x2105) • Token: USDC (6 decimals) • Amount: $${v || "—"}`;
  });

  $tipCta.addEventListener("click", async () => {
    try {
      const usd = (STATE.tip.usd ?? "").toString().trim();
      if (!usd) throw new Error("Choose a preset or enter an amount.");

      if (!isValidEvmAddress(RECIPIENT)) {
        toast("Recipient misconfigured. Sending disabled.", "err");
        return;
      }
      if (!BUILDER_CODE || BUILDER_CODE.includes("TODO")) {
        toast("Builder code missing. Sending disabled.", "err");
        return;
      }

      // Pre-transaction UX: animate 1–1.5s BEFORE wallet opens
      setTipPhase("preparing");
      $tipCta.disabled = true;

      const start = performance.now();
      const dur = 1250;
      const spin = () => {
        const t = (performance.now() - start) / dur;
        if (t >= 1) return;
        $tipNote.textContent = `Preparing tip… ${Math.round(t * 100)}%`;
        requestAnimationFrame(spin);
      };
      requestAnimationFrame(spin);

      await new Promise((r) => setTimeout(r, dur));

      setTipPhase("confirm");
      $tipNote.textContent = "Confirm in wallet…";

      // Lazy-load tip module (ONLY here)
      let tip;
      try {
        tip = await import("https://nurrabby.com/tip.js");
      } catch {
        setTipPhase("idle");
        $tipCta.disabled = false;
        toast("Tip module blocked (CSP/network). UI is fine; tip unavailable.", "err");
        return;
      }

      try {
        setTipPhase("sending");
        await tip.sendUsdcTip({
          usd,
          usdcContract: USDC_CONTRACT,
          recipient: RECIPIENT,
          builderCode: BUILDER_CODE,
        });

        setTipPhase("done");
        $tipCta.disabled = false;
        $tipNote.textContent = "Tip sent. Thank you!";
        toast("USDC tip sent!", "ok");
      } catch (e) {
        setTipPhase("idle");
        $tipCta.disabled = false;

        const msg = (e?.message || "").toLowerCase();
        if (msg.includes("rejected") || msg.includes("denied") || msg.includes("user")) {
          toast("Tip cancelled.", "err");
          return;
        }
        toast(e?.message || "Tip failed.", "err");
      }
    } catch (e) {
      $tipCta.disabled = false;
      setTipPhase("idle");
      toast(e?.message || "Error", "err");
    }
  });
}

function boot() {
  // Don’t kill UI outside domain; just warn.
  if (location.origin !== "https://nurrabby.com") {
    toast("Domain mismatch. Expected https://nurrabby.com", "err");
  }

  $status.textContent = "READY";
  wireWalking();
  wireTipSheet();
  attachMotionStepCounter();
  tick();
}

await initMiniAppSdk();
boot();
