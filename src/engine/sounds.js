/**
 * sounds.js
 * Synthesized sound effects using the Web Audio API.
 * No external audio files needed — all sounds are generated programmatically.
 *
 * Lazily creates an AudioContext on first use (requires user interaction).
 */

let ctx = null;

function isMuted() {
  try {
    const raw = localStorage.getItem("wys2_settings");
    if (!raw) return false;
    const s = JSON.parse(raw);
    return s.soundEnabled === false;
  } catch {
    return false;
  }
}

function getCtx() {
  if (isMuted()) return null;
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Short click/tap sound for selecting a choice */
export function playClick() {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.setValueAtTime(660, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(440, c.currentTime + 0.06);
  o.type = "sine";
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.08);
}

/** Low rumble for taking damage (health loss) */
export function playDamage() {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.setValueAtTime(150, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(60, c.currentTime + 0.3);
  o.type = "sawtooth";
  g.gain.setValueAtTime(0.15, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.3);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.3);
}

/** Dissonant hum for stress increase */
export function playStress() {
  const c = getCtx();
  if (!c) return;
  const o1 = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o1.connect(g);
  o2.connect(g);
  g.connect(c.destination);
  o1.frequency.value = 220;
  o2.frequency.value = 233;
  o1.type = "sine";
  o2.type = "sine";
  g.gain.setValueAtTime(0.08, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  o1.start(c.currentTime);
  o2.start(c.currentTime);
  o1.stop(c.currentTime + 0.35);
  o2.stop(c.currentTime + 0.35);
}

/** Pleasant ascending arpeggio for gaining an item */
export function playItemGain() {
  const c = getCtx();
  if (!c) return;
  [520, 660, 784].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = freq;
    o.type = "sine";
    const t = c.currentTime + i * 0.08;
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.start(t);
    o.stop(t + 0.15);
  });
}

/** Soft tick for timer countdown (last 3 seconds) */
export function playTimerTick() {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.value = 880;
  o.type = "sine";
  g.gain.setValueAtTime(0.06, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.05);
}

/** Descending tone when timer runs out */
export function playTimerExpire() {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.frequency.setValueAtTime(440, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(110, c.currentTime + 0.5);
  o.type = "square";
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.5);
}
