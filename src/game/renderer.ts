import { ENVIRONMENT_MAP } from "@/data/environments";
import { SKILL_MAP } from "@/data/skills";
import type { EngineSnapshot } from "@/game/engine";

const bgCache = new Map<string, HTMLCanvasElement>();
const gridCache = new Map<string, HTMLCanvasElement>();
const glowCache = new Map<string, HTMLCanvasElement>();

const GRID_STEP = 42;

export function invalidateRendererCaches() {
  bgCache.clear();
  gridCache.clear();
  glowCache.clear();
}

export function drawGame(
  ctx: CanvasRenderingContext2D,
  snap: EngineSnapshot,
  width: number,
  height: number,
  time: number,
) {
  const env = ENVIRONMENT_MAP[snap.environmentId];
  const w = Math.max(1, Math.ceil(width));
  const h = Math.max(1, Math.ceil(height));

  // Cached atmosphere (rebuilds on env / size change only)
  const bgKey = `${env.id}:${w}x${h}:${env.floor}`;
  let bg = bgCache.get(bgKey);
  if (!bg) {
    bg = document.createElement("canvas");
    bg.width = w;
    bg.height = h;
    const bctx = bg.getContext("2d")!;
    const grad = bctx.createRadialGradient(
      w * 0.5,
      h * 0.4,
      20,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.75,
    );
    grad.addColorStop(0, shade(env.floor, 28));
    grad.addColorStop(0.55, env.floor);
    grad.addColorStop(1, "#070A10");
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, w, h);

    // Soft ambient blobs baked once
    paintSoftGlow(bctx, w * 0.2, h * 0.25, 90, env.accent, 0.07);
    paintSoftGlow(bctx, w * 0.8, h * 0.7, 110, "#F0B429", 0.05);
    bgCache.set(bgKey, bg);
    // Cap cache growth across env switches
    if (bgCache.size > 8) {
      const first = bgCache.keys().next().value;
      if (first) bgCache.delete(first);
    }
  }
  ctx.drawImage(bg, 0, 0);

  // Cached grid tile, scrolled via drawImage offset
  const gridKey = env.accent;
  let grid = gridCache.get(gridKey);
  if (!grid) {
    grid = document.createElement("canvas");
    grid.width = GRID_STEP;
    grid.height = GRID_STEP;
    const gctx = grid.getContext("2d")!;
    gctx.strokeStyle = withAlpha(env.accent, 0.35);
    gctx.lineWidth = 1;
    gctx.beginPath();
    gctx.moveTo(0.5, 0);
    gctx.lineTo(0.5, GRID_STEP);
    gctx.moveTo(0, 0.5);
    gctx.lineTo(GRID_STEP, 0.5);
    gctx.stroke();
    gridCache.set(gridKey, grid);
  }
  const ox = (time * 8) % GRID_STEP;
  const oy = (time * 6) % GRID_STEP;
  ctx.save();
  ctx.globalAlpha = 0.22;
  const pattern = ctx.createPattern(grid, "repeat");
  if (pattern) {
    // PatternTransform keeps scroll cheap without re-stroking lines
    const matrix = new DOMMatrix().translateSelf(-ox, -oy);
    pattern.setTransform(matrix);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // Influence radius — solid stroke, no dash rebuild
  ctx.save();
  ctx.beginPath();
  ctx.arc(snap.playerX, snap.playerY, snap.influenceRadius, 0, Math.PI * 2);
  ctx.strokeStyle = withAlpha(env.accent, 0.22 + Math.sin(time * 3) * 0.05);
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Pickups
  for (const p of snap.pickups) {
    const pulse = 1 + Math.sin(time * 8 + p.id) * 0.12;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(pulse, pulse);
    drawCachedGlow(ctx, 0, 0, 16, "#F0B429", 0.35);
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

  // Projectiles
  for (const p of snap.projectiles) {
    const skill = SKILL_MAP[p.skillId];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    drawCachedGlow(ctx, 0, 0, 14, p.color, 0.35);
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
      drawCachedGlow(ctx, 0, 0, o.radius * 2.2, "#F0B429", 0.22);
    } else {
      drawCachedGlow(ctx, 0, 0, o.radius * 1.5, o.color, 0.16);
    }

    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(14,20,29,0.92)";
    ctx.fill();
    ctx.lineWidth = o.isBoss ? 3 : 2;
    ctx.strokeStyle = o.color;
    ctx.stroke();

    ctx.font = `${o.isBoss ? 28 : 20}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.face, 0, 1);

    ctx.beginPath();
    ctx.moveTo(-4, o.radius - 2);
    ctx.lineTo(0, o.radius + 7);
    ctx.lineTo(6, o.radius - 2);
    ctx.fillStyle = "rgba(14,20,29,0.92)";
    ctx.fill();
    ctx.strokeStyle = o.color;
    ctx.stroke();

    const hpPct = clamp(o.hp / o.maxHp, 0, 1);
    const barW = o.radius * 2;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
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
    drawCachedGlow(ctx, 0, 0, 26, "#2BB5A0", 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,49,44,0.9)";
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
  const breathe = 1 + Math.sin(time * 3.2) * 0.04;
  ctx.save();
  ctx.translate(snap.playerX, snap.playerY);
  ctx.scale(breathe, breathe);
  drawCachedGlow(ctx, 0, 0, 34, env.accent, 0.3);
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fillStyle = env.accent;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "#F5F0E8";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-3, -4, 5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(245,240,232,0.35)";
  ctx.fill();
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

function drawCachedGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) {
  const radius = Math.max(4, Math.round(r));
  const a = Math.round(alpha * 100) / 100;
  const key = `${color}|${radius}|${a}`;
  let sprite = glowCache.get(key);
  if (!sprite) {
    const size = radius * 2;
    sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const sctx = sprite.getContext("2d")!;
    paintSoftGlow(sctx, radius, radius, radius, color, a);
    glowCache.set(key, sprite);
    if (glowCache.size > 64) {
      const first = glowCache.keys().next().value;
      if (first) glowCache.delete(first);
    }
  }
  ctx.drawImage(sprite, x - radius, y - radius);
}

function paintSoftGlow(
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
