/** Tiny WebAudio SFX — no asset files required. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function beep(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.05,
  slideTo?: number,
) {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume();

  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, slideTo),
      ac.currentTime + duration,
    );
  }
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export const sfx = {
  shoot: () => beep(420, 0.05, "square", 0.03, 180),
  hit: () => beep(140, 0.04, "sawtooth", 0.04),
  explode: () => beep(90, 0.25, "sawtooth", 0.08, 40),
  pickup: () => beep(660, 0.08, "sine", 0.04, 990),
  levelUp: () => {
    beep(523, 0.1, "triangle", 0.06);
    setTimeout(() => beep(659, 0.1, "triangle", 0.06), 80);
    setTimeout(() => beep(784, 0.16, "triangle", 0.07), 160);
  },
  success: () => {
    beep(523, 0.09, "sine", 0.07);
    setTimeout(() => beep(784, 0.14, "sine", 0.07), 90);
  },
  fail: () => beep(160, 0.22, "triangle", 0.06, 80),
  upgrade: () => {
    beep(440, 0.12, "sine", 0.06);
    setTimeout(() => beep(880, 0.2, "sine", 0.07), 100);
  },
  ambiencePulse: () => beep(55, 0.4, "sine", 0.015),
};
