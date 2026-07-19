import { ENVIRONMENT_MAP } from "@/data/environments";
import { SKILL_MAP } from "@/data/skills";
import type { EngineSnapshot } from "@/game/engine";

export function drawGame(
  ctx: CanvasRenderingContext2D,
  snap: EngineSnapshot,
  width: number,
  height: number,
  time: number,
) {
  const env = ENVIRONMENT_MAP[snap.environmentId];

  // Atmosphere
  const bg = ctx.createRadialGradient(
    width * 0.5,
    height * 0.4,
    20,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75,
  );
  bg.addColorStop(0, shade(env.floor, 28));
  bg.addColorStop(0.55, env.floor);
  bg.addColorStop(1, "#070A10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Soft grid / conversation floor
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = env.accent;
  ctx.lineWidth = 1;
  const step = 42;
  const ox = (time * 8) % step;
  const oy = (time * 6) % step;
  for (let x = -step; x < width + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + ox, 0);
    ctx.lineTo(x + ox, height);
    ctx.stroke();
  }
  for (let y = -step; y < height + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + oy);
    ctx.lineTo(width, y + oy);
    ctx.stroke();
  }
  ctx.restore();

  // Ambient glow blobs
  drawGlow(ctx, width * 0.2, height * 0.25, 90, env.accent, 0.07);
  drawGlow(ctx, width * 0.8, height * 0.7, 110, "#F0B429", 0.05);

  // Influence radius
  ctx.save();
  ctx.beginPath();
  ctx.arc(snap.playerX, snap.playerY, snap.influenceRadius, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(env.accent, 0.22 + Math.sin(time * 3) * 0.05);
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.stroke();
  ctx.restore();

  // Pickups (Confidence gems)
  for (const p of snap.pickups) {
    const pulse = 1 + Math.sin(time * 8 + p.id) * 0.12;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pulse, pulse);
    drawGlow(ctx, 0, 0, 16, "#F0B429", 0.35);
    ctx.fillStyle = "#F0B429";
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 7);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Projectiles / speech beams
  for (const p of snap.projectiles) {
    const skill = SKILL_MAP[p.skillId];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    drawGlow(ctx, 0, 0, 14, p.color, 0.4);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius + 4, p.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(skill.name.slice(0, 1), 0, 0);
    ctx.restore();
  }

  // Obstacles
  for (const o of snap.obstacles) {
    const bob = Math.sin(time * 4 + o.phase) * 2;
    ctx.save();
    ctx.translate(o.x, o.y + bob);

    if (o.isBoss) {
      drawGlow(ctx, 0, 0, o.radius * 2.2, "#F0B429", 0.25);
    } else {
      drawGlow(ctx, 0, 0, o.radius * 1.6, o.color, 0.18);
    }

    // Body bubble
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha("#0E141D", 0.92);
    ctx.fill();
    ctx.lineWidth = o.isBoss ? 3 : 2;
    ctx.strokeStyle = o.color;
    ctx.stroke();

    // Face
    ctx.font = `${o.isBoss ? 28 : 20}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.face, 0, 1);

    // Speech tick
    ctx.beginPath();
    ctx.moveTo(-4, o.radius - 2);
    ctx.lineTo(0, o.radius + 7);
    ctx.lineTo(6, o.radius - 2);
    ctx.fillStyle = withAlpha("#0E141D", 0.92);
    ctx.fill();
    ctx.strokeStyle = o.color;
    ctx.stroke();

    // HP bar
    const hpPct = clamp(o.hp / o.maxHp, 0, 1);
    const barW = o.radius * 2;
    ctx.fillStyle = withAlpha("#000", 0.45);
    ctx.fillRect(-barW / 2, -o.radius - 12, barW, 4);
    ctx.fillStyle = o.isBoss ? "#F0B429" : o.color;
    ctx.fillRect(-barW / 2, -o.radius - 12, barW * hpPct, 4);

    if (o.isBoss) {
      ctx.fillStyle = "#F5F0E8";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(o.label, 0, -o.radius - 20);
    }

    ctx.restore();
  }

  // Transform FX
  for (const t of snap.transforms) {
    const pct = t.life / t.maxLife;
    ctx.save();
    ctx.globalAlpha = clamp(pct, 0, 1);
    ctx.translate(t.x, t.y - (1 - pct) * 18);
    ctx.scale(0.9 + (1 - pct) * 0.4, 0.9 + (1 - pct) * 0.4);
    drawGlow(ctx, 0, 0, 26, "#2BB5A0", 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha("#14312C", 0.9);
    ctx.fill();
    ctx.strokeStyle = "#2BB5A0";
    ctx.stroke();
    ctx.font = "20px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.face, 0, 0);
    ctx.fillStyle = "#F5F0E8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText(t.label, 0, 26);
    ctx.restore();
  }

  // Player
  const px = snap.playerX;
  const py = snap.playerY;
  const breathe = 1 + Math.sin(time * 3.2) * 0.04;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(breathe, breathe);
  drawGlow(ctx, 0, 0, 34, env.accent, 0.35);
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  const playerGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, 18);
  playerGrad.addColorStop(0, "#F5F0E8");
  playerGrad.addColorStop(1, env.accent);
  ctx.fillStyle = playerGrad;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#F5F0E8";
  ctx.stroke();
  ctx.font = "18px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🗣️", 0, 1);
  ctx.restore();

  // Floating texts
  for (const f of snap.floats) {
    ctx.save();
    ctx.globalAlpha = clamp(f.life, 0, 1);
    ctx.fillStyle = f.color;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  }
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, withAlpha(color, alpha));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith("#") && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

function shade(hex: string, amount: number) {
  if (!hex.startsWith("#") || hex.length !== 7) return hex;
  const r = clamp(parseInt(hex.slice(1, 3), 16) + amount, 0, 255);
  const g = clamp(parseInt(hex.slice(3, 5), 16) + amount, 0, 255);
  const b = clamp(parseInt(hex.slice(5, 7), 16) + amount, 0, 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
