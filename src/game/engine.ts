import { BOSSES } from "@/data/bosses";
import { ENVIRONMENTS, ENVIRONMENT_MAP } from "@/data/environments";
import { OBSTACLE_MAP, OBSTACLES } from "@/data/obstacles";
import { SKILL_MAP, SKILLS, STARTER_SKILL } from "@/data/skills";
import { UPGRADE_MAP, UPGRADES } from "@/data/upgrades";
import type {
  EnvironmentId,
  FloatingText,
  LevelChoice,
  ObstacleEntity,
  ObstacleKind,
  OwnedSkill,
  OwnedUpgrade,
  Pickup,
  PlayerStats,
  Projectile,
  RunSummary,
  SkillId,
  TransformFx,
  UpgradeId,
  Vec2,
} from "@/game/types";

const WAVE_DURATION = 45;
const BOSS_EVERY = 3;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dist(a: Vec2, b: Vec2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function norm(x: number, y: number): Vec2 {
  const len = Math.hypot(x, y) || 1;
  return { x: x / len, y: y / len };
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export interface EngineSnapshot {
  playerX: number;
  playerY: number;
  composure: number;
  maxComposure: number;
  confidence: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  wave: number;
  waveTimeLeft: number;
  environmentId: EnvironmentId;
  environmentName: string;
  skills: OwnedSkill[];
  upgrades: OwnedUpgrade[];
  obstacles: ObstacleEntity[];
  projectiles: Projectile[];
  pickups: Pickup[];
  transforms: TransformFx[];
  floats: FloatingText[];
  influenceRadius: number;
  transformed: number;
  bossActive: boolean;
  bossName: string | null;
  elapsed: number;
  levelChoices: LevelChoice[];
  summary: RunSummary | null;
  status: "playing" | "levelUp" | "waveClear" | "defeat" | "victory";
}

export class GameEngine {
  width = 390;
  height = 720;
  player: Vec2 = { x: 195, y: 360 };
  move: Vec2 = { x: 0, y: 0 };
  stats: PlayerStats;
  skills: OwnedSkill[] = [{ id: STARTER_SKILL.id, level: 1 }];
  upgrades: OwnedUpgrade[] = [];
  skillCooldowns = new Map<SkillId, number>();
  obstacles: ObstacleEntity[] = [];
  projectiles: Projectile[] = [];
  pickups: Pickup[] = [];
  transforms: TransformFx[] = [];
  floats: FloatingText[] = [];
  confidence = 0;
  level = 1;
  xpIntoLevel = 0;
  wave = 1;
  waveTimer = WAVE_DURATION;
  spawnAcc = 0;
  nextId = 1;
  transformed = 0;
  elapsed = 0;
  environmentId: EnvironmentId = "networking";
  status: EngineSnapshot["status"] = "playing";
  levelChoices: LevelChoice[] = [];
  summary: RunSummary | null = null;
  bossActive = false;
  bossName: string | null = null;
  invuln = 0;
  recoveryAcc = 0;

  constructor(environmentId?: EnvironmentId) {
    this.stats = {
      maxComposure: 100,
      composure: 100,
      moveSpeed: 145,
      influenceRadius: 0,
      confidenceGain: 1,
      rapport: 1,
      authority: 1,
      humor: 1,
      recovery: 1,
      charisma: 1,
      listeningSpeed: 1,
      storytelling: 1,
    };
    if (environmentId) this.environmentId = environmentId;
    else this.environmentId = "networking";
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.player.x = width / 2;
    this.player.y = height / 2;
  }

  setMove(x: number, y: number) {
    const n = norm(x, y);
    const mag = clamp(Math.hypot(x, y), 0, 1);
    this.move = { x: n.x * mag, y: n.y * mag };
  }

  private xpNeeded(level: number) {
    return Math.floor(28 + level * 18 + level * level * 2.2);
  }

  private upgradeLevel(id: UpgradeId) {
    return this.upgrades.find((u) => u.id === id)?.level ?? 0;
  }

  private refreshDerivedStats() {
    const listen = this.upgradeLevel("fasterListening");
    const wide = this.upgradeLevel("widerInfluence");
    const story = this.upgradeLevel("betterStorytelling");
    const conf = this.upgradeLevel("moreConfidence");
    const rapport = this.upgradeLevel("strongerRapport");
    const auth = this.upgradeLevel("increasedAuthority");
    const humor = this.upgradeLevel("betterHumor");
    const recovery = this.upgradeLevel("fasterRecovery");
    const charisma = this.upgradeLevel("charismaMultiplier");

    this.stats.listeningSpeed = 1 + listen * 0.12;
    this.stats.influenceRadius = 20 + wide * 14;
    this.stats.storytelling = 1 + story * 0.15;
    this.stats.confidenceGain = 1 + conf * 0.18;
    this.stats.rapport = 1 + rapport * 0.12;
    this.stats.authority = 1 + auth * 0.15;
    this.stats.humor = 1 + humor * 0.15;
    this.stats.recovery = 1 + recovery * 0.2;
    this.stats.charisma = 1 + charisma * 0.2;
    this.stats.moveSpeed = 145 + wide * 4;
  }

  private spawnObstacle(kind?: ObstacleKind, isBoss = false) {
    const env = ENVIRONMENT_MAP[this.environmentId];
    const chosen =
      kind ??
      (Math.random() < 0.7
        ? pick(env.obstacleBias)
        : pick(OBSTACLES.map((o) => o.kind)));
    const def = OBSTACLE_MAP[chosen];
    const edge = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const pad = 30;
    if (edge === 0) {
      x = randRange(0, this.width);
      y = -pad;
    } else if (edge === 1) {
      x = this.width + pad;
      y = randRange(0, this.height);
    } else if (edge === 2) {
      x = randRange(0, this.width);
      y = this.height + pad;
    } else {
      x = -pad;
      y = randRange(0, this.height);
    }

    const waveScale = 1 + (this.wave - 1) * 0.12;
    const entity: ObstacleEntity = {
      id: this.nextId++,
      kind: def.kind,
      x,
      y,
      hp: def.hp * waveScale * (isBoss ? 1 : 1),
      maxHp: def.hp * waveScale,
      radius: def.radius,
      speed: def.speed * (1 + (this.wave - 1) * 0.04),
      damage: def.damage * (1 + (this.wave - 1) * 0.06),
      confidence: def.confidence,
      behavior: def.behavior,
      weakTo: def.weakTo,
      face: def.face,
      resolvedFace: def.resolvedFace,
      resolvedLabel: def.resolvedLabel,
      color: def.color,
      label: def.label,
      phase: Math.random() * Math.PI * 2,
      dashCooldown: randRange(0.5, 2),
      isBoss: false,
    };
    this.obstacles.push(entity);
  }

  private spawnBoss() {
    const boss = pick(BOSSES);
    const edge = Math.random() < 0.5 ? -40 : this.width + 40;
    const entity: ObstacleEntity = {
      id: this.nextId++,
      kind: "heckler",
      x: edge,
      y: this.height * 0.35,
      hp: boss.hp * (1 + (this.wave - 1) * 0.1),
      maxHp: boss.hp * (1 + (this.wave - 1) * 0.1),
      radius: boss.radius,
      speed: boss.speed,
      damage: boss.damage,
      confidence: boss.confidence,
      behavior: "chase",
      weakTo: boss.weakTo,
      face: boss.face,
      resolvedFace: boss.resolvedFace,
      resolvedLabel: "Aligned",
      color: "#F0B429",
      label: boss.name,
      phase: 0,
      dashCooldown: 1.2,
      isBoss: true,
      bossId: boss.id,
    };
    this.obstacles.push(entity);
    this.bossActive = true;
    this.bossName = boss.name;
    this.addFloat(this.player.x, this.player.y - 40, `${boss.name} enters`, "#F0B429");
  }

  private addFloat(x: number, y: number, text: string, color: string) {
    this.floats.push({
      id: this.nextId++,
      x,
      y,
      text,
      color,
      life: 0.9,
    });
  }

  private nearestObstacle(range: number): ObstacleEntity | null {
    let best: ObstacleEntity | null = null;
    let bestD = range;
    for (const o of this.obstacles) {
      const d = dist(this.player, o);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  private skillPower(skillId: SkillId, level: number) {
    const base = SKILL_MAP[skillId];
    let power = base.power * (1 + (level - 1) * 0.22) * this.stats.rapport * this.stats.charisma;
    if (skillId === "storytelling") power *= this.stats.storytelling;
    if (skillId === "authority") power *= this.stats.authority;
    if (skillId === "humor") power *= this.stats.humor;
    if (skillId === "empathy" || skillId === "activeListening") power *= 1 + this.stats.recovery * 0.05;
    return power;
  }

  private fireSkills(dt: number) {
    for (const owned of this.skills) {
      const def = SKILL_MAP[owned.id];
      const cd = this.skillCooldowns.get(owned.id) ?? 0;
      const next = Math.max(0, cd - dt);
      this.skillCooldowns.set(owned.id, next);
      if (next > 0) continue;

      const range = def.range + this.stats.influenceRadius + owned.level * 8;
      const target = this.nearestObstacle(range);
      if (!target) continue;

      const cooldown = def.cooldown / this.stats.listeningSpeed;
      this.skillCooldowns.set(owned.id, cooldown);

      const power = this.skillPower(owned.id, owned.level);

      if (def.style === "pulse" || def.style === "burst") {
        for (const o of this.obstacles) {
          if (dist(this.player, o) <= range) {
            this.damageObstacle(o, power, owned.id);
          }
        }
        this.transforms.push({
          id: this.nextId++,
          x: this.player.x,
          y: this.player.y,
          face: def.style === "pulse" ? "👂" : "⚡",
          label: def.name,
          life: 0.35,
          maxLife: 0.35,
        });
      } else {
        const dir = norm(target.x - this.player.x, target.y - this.player.y);
        const pierce =
          def.pierce +
          (owned.id === "authority" ? this.upgradeLevel("increasedAuthority") : 0) +
          Math.floor((owned.level - 1) / 2);
        this.projectiles.push({
          id: this.nextId++,
          x: this.player.x,
          y: this.player.y,
          vx: dir.x * def.projectileSpeed,
          vy: dir.y * def.projectileSpeed,
          skillId: owned.id,
          power,
          pierce,
          life: 1.4,
          color: def.color,
          radius: 7 + owned.level,
        });
      }
    }
  }

  private damageObstacle(o: ObstacleEntity, power: number, skillId: SkillId) {
    let dmg = power;
    if (o.weakTo.includes(skillId)) {
      dmg *= 1.55;
      this.addFloat(o.x, o.y - o.radius - 8, "Resonance!", "#2BB5A0");
    }
    o.hp -= dmg;
    if (o.hp <= 0) this.resolveObstacle(o);
  }

  private resolveObstacle(o: ObstacleEntity) {
    const idx = this.obstacles.indexOf(o);
    if (idx >= 0) this.obstacles.splice(idx, 1);
    this.transformed += 1;

    const value = Math.round(
      o.confidence * this.stats.confidenceGain * this.stats.charisma * (o.isBoss ? 1.4 : 1),
    );
    this.pickups.push({
      id: this.nextId++,
      x: o.x,
      y: o.y,
      value,
      life: 8,
    });

    this.transforms.push({
      id: this.nextId++,
      x: o.x,
      y: o.y,
      face: o.resolvedFace,
      label: o.resolvedLabel,
      life: 1.1,
      maxLife: 1.1,
    });
    this.addFloat(o.x, o.y - 20, o.resolvedLabel, "#F5F0E8");

    if (o.isBoss) {
      this.bossActive = false;
      this.bossName = null;
      this.addFloat(this.player.x, this.player.y - 50, "Conversation won", "#F0B429");
    }
  }

  private gainConfidence(amount: number) {
    this.confidence += amount;
    this.xpIntoLevel += amount;
    while (this.xpIntoLevel >= this.xpNeeded(this.level)) {
      this.xpIntoLevel -= this.xpNeeded(this.level);
      this.level += 1;
      this.stats.maxComposure += 6;
      this.stats.composure = Math.min(
        this.stats.maxComposure,
        this.stats.composure + 20,
      );
      this.prepareLevelUp();
    }
  }

  private prepareLevelUp() {
    this.status = "levelUp";
    this.levelChoices = this.rollLevelChoices();
  }

  private rollLevelChoices(): LevelChoice[] {
    const choices: LevelChoice[] = [];
    const ownedIds = new Set(this.skills.map((s) => s.id));
    const canUpgradeSkill = this.skills.filter((s) => s.level < 5);
    const newSkills = SKILLS.filter((s) => !ownedIds.has(s.id));
    const upgradePool = UPGRADES.filter((u) => {
      const lvl = this.upgradeLevel(u.id);
      return lvl < u.maxLevel;
    });

    const pool: LevelChoice[] = [];

    for (const s of canUpgradeSkill) {
      const def = SKILL_MAP[s.id];
      pool.push({
        type: "skill",
        skillId: s.id,
        title: def.name,
        description: `Level ${s.level + 1}`,
        detail: def.description,
      });
    }
    for (const s of newSkills) {
      pool.push({
        type: "skill",
        skillId: s.id,
        title: s.name,
        description: "New skill",
        detail: s.description,
      });
    }
    for (const u of upgradePool) {
      const lvl = this.upgradeLevel(u.id);
      pool.push({
        type: "upgrade",
        upgradeId: u.id,
        title: u.name,
        description: `Level ${lvl + 1}`,
        detail: u.description,
      });
    }

    // Ensure at least one of each category when possible
    const skillChoices = pool.filter((c) => c.type === "skill");
    const upChoices = pool.filter((c) => c.type === "upgrade");
    const picked = new Set<string>();

    const take = (list: LevelChoice[]) => {
      const available = list.filter(
        (c) => !picked.has(`${c.type}:${c.skillId ?? c.upgradeId}`),
      );
      if (!available.length) return;
      const c = pick(available);
      picked.add(`${c.type}:${c.skillId ?? c.upgradeId}`);
      choices.push(c);
    };

    if (skillChoices.length) take(skillChoices);
    if (upChoices.length) take(upChoices);
    while (choices.length < 3 && picked.size < pool.length) {
      take(pool);
    }
    while (choices.length < 3) {
      choices.push({
        type: "upgrade",
        upgradeId: "moreConfidence",
        title: "More Confidence",
        description: "Boost",
        detail: UPGRADE_MAP.moreConfidence.description,
      });
    }
    return choices.slice(0, 3);
  }

  chooseLevelOption(index: number) {
    const choice = this.levelChoices[index];
    if (!choice) return;
    if (choice.type === "skill" && choice.skillId) {
      const existing = this.skills.find((s) => s.id === choice.skillId);
      if (existing) existing.level += 1;
      else this.skills.push({ id: choice.skillId, level: 1 });
    } else if (choice.upgradeId) {
      const existing = this.upgrades.find((u) => u.id === choice.upgradeId);
      if (existing) existing.level += 1;
      else this.upgrades.push({ id: choice.upgradeId, level: 1 });
      this.refreshDerivedStats();
    }
    this.levelChoices = [];
    this.status = "playing";
  }

  applyLearningReward(upgradeId: UpgradeId) {
    const def = UPGRADE_MAP[upgradeId];
    const existing = this.upgrades.find((u) => u.id === upgradeId);
    if (existing) {
      if (existing.level < def.maxLevel) existing.level += 1;
    } else {
      this.upgrades.push({ id: upgradeId, level: 1 });
    }
    this.refreshDerivedStats();
    this.gainConfidence(25);
  }

  beginNextWave() {
    this.wave += 1;
    this.waveTimer = WAVE_DURATION;
    this.spawnAcc = 0;
    this.status = "playing";

    const unlocked = ENVIRONMENTS.filter((e) => e.unlockWave <= this.wave);
    if (unlocked.length) {
      this.environmentId = pick(unlocked).id;
    }

    if (this.wave % BOSS_EVERY === 0) {
      this.spawnBoss();
    }

    if (this.wave > 12) {
      this.status = "victory";
      this.finish("victory");
    }
  }

  private finish(status: "defeat" | "victory") {
    this.status = status;
    this.summary = {
      wave: this.wave,
      confidence: Math.round(this.confidence),
      level: this.level,
      transformed: this.transformed,
      environment: this.environmentId,
      durationSec: Math.round(this.elapsed),
    };
  }

  private updateObstacles(dt: number) {
    for (const o of this.obstacles) {
      o.phase += dt;
      o.dashCooldown = Math.max(0, o.dashCooldown - dt);
      const toPlayer = norm(this.player.x - o.x, this.player.y - o.y);
      let vx = 0;
      let vy = 0;

      switch (o.behavior) {
        case "chase":
          vx = toPlayer.x * o.speed;
          vy = toPlayer.y * o.speed;
          break;
        case "orbit": {
          const dx = this.player.x - o.x;
          const dy = this.player.y - o.y;
          const d = Math.hypot(dx, dy) || 1;
          const tx = -dy / d;
          const ty = dx / d;
          const pull = d > 120 ? 0.55 : d < 70 ? -0.4 : 0.15;
          vx = (tx * 0.85 + toPlayer.x * pull) * o.speed;
          vy = (ty * 0.85 + toPlayer.y * pull) * o.speed;
          break;
        }
        case "dash":
          if (o.dashCooldown <= 0) {
            vx = toPlayer.x * o.speed * 2.4;
            vy = toPlayer.y * o.speed * 2.4;
            o.dashCooldown = o.isBoss ? 1.4 : 2.2;
          } else {
            vx = toPlayer.x * o.speed * 0.35;
            vy = toPlayer.y * o.speed * 0.35;
          }
          break;
        case "wander":
          vx = (toPlayer.x * 0.4 + Math.cos(o.phase * 2.1)) * o.speed;
          vy = (toPlayer.y * 0.4 + Math.sin(o.phase * 1.7)) * o.speed;
          break;
        case "swarm":
          vx = (toPlayer.x + Math.cos(o.phase * 6) * 0.6) * o.speed * 1.15;
          vy = (toPlayer.y + Math.sin(o.phase * 6) * 0.6) * o.speed * 1.15;
          break;
        case "linger":
          vx = toPlayer.x * o.speed * (dist(this.player, o) > 140 ? 0.9 : 0.2);
          vy = toPlayer.y * o.speed * (dist(this.player, o) > 140 ? 0.9 : 0.2);
          break;
      }

      if (o.isBoss) {
        vx += Math.cos(o.phase * 1.3) * 20;
        vy += Math.sin(o.phase * 1.1) * 16;
      }

      o.x += vx * dt;
      o.y += vy * dt;

      const d = dist(this.player, o);
      if (d < o.radius + 14 && this.invuln <= 0) {
        this.stats.composure -= o.damage;
        this.invuln = 0.55;
        this.addFloat(this.player.x, this.player.y - 24, `-${Math.round(o.damage)} composure`, "#E85D4C");
        // knockback
        const kb = norm(this.player.x - o.x, this.player.y - o.y);
        this.player.x += kb.x * 28;
        this.player.y += kb.y * 28;
        if (this.stats.composure <= 0) {
          this.stats.composure = 0;
          this.finish("defeat");
        }
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      for (let j = this.obstacles.length - 1; j >= 0; j--) {
        const o = this.obstacles[j]!;
        if (dist(p, o) < o.radius + p.radius) {
          this.damageObstacle(o, p.power, p.skillId);
          p.pierce -= 1;
          if (p.pierce <= 0) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i]!;
      p.life -= dt;
      const d = dist(this.player, p);
      const magnet = 70 + this.stats.influenceRadius;
      if (d < magnet) {
        const n = norm(this.player.x - p.x, this.player.y - p.y);
        const pull = d < 28 ? 320 : 160;
        p.x += n.x * pull * dt;
        p.y += n.y * pull * dt;
      }
      if (d < 22) {
        this.gainConfidence(p.value);
        this.addFloat(this.player.x, this.player.y - 30, `+${p.value} Confidence`, "#F0B429");
        this.pickups.splice(i, 1);
        if (this.status === "levelUp") return;
        continue;
      }
      if (p.life <= 0) this.pickups.splice(i, 1);
    }
  }

  update(dt: number) {
    if (this.status !== "playing") {
      // still animate fx lightly
      this.tickFx(dt);
      return;
    }

    this.elapsed += dt;
    this.invuln = Math.max(0, this.invuln - dt);
    this.refreshDerivedStats();

    this.player.x = clamp(
      this.player.x + this.move.x * this.stats.moveSpeed * dt,
      18,
      this.width - 18,
    );
    this.player.y = clamp(
      this.player.y + this.move.y * this.stats.moveSpeed * dt,
      18,
      this.height - 18,
    );

    // passive composure recovery
    this.recoveryAcc += dt;
    if (this.recoveryAcc > 1.2) {
      this.recoveryAcc = 0;
      this.stats.composure = Math.min(
        this.stats.maxComposure,
        this.stats.composure + 1.5 * this.stats.recovery,
      );
    }

    this.waveTimer -= dt;
    const spawnRate = Math.max(0.35, 1.35 - this.wave * 0.08);
    this.spawnAcc += dt;
    const maxObstacles = 18 + this.wave * 2;
    while (this.spawnAcc >= spawnRate && this.obstacles.length < maxObstacles) {
      this.spawnAcc -= spawnRate;
      this.spawnObstacle();
    }

    this.fireSkills(dt);
    this.updateObstacles(dt);
    if (this.status !== "playing") {
      this.tickFx(dt);
      return;
    }
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.tickFx(dt);

    if (this.waveTimer <= 0 && !this.bossActive) {
      this.status = "waveClear";
    }
  }

  private tickFx(dt: number) {
    for (let i = this.transforms.length - 1; i >= 0; i--) {
      const t = this.transforms[i]!;
      t.life -= dt;
      if (t.life <= 0) this.transforms.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i]!;
      f.life -= dt;
      f.y -= 28 * dt;
      if (f.life <= 0) this.floats.splice(i, 1);
    }
  }

  snapshot(): EngineSnapshot {
    const env = ENVIRONMENT_MAP[this.environmentId];
    return {
      playerX: this.player.x,
      playerY: this.player.y,
      composure: this.stats.composure,
      maxComposure: this.stats.maxComposure,
      confidence: this.confidence,
      level: this.level,
      xpIntoLevel: this.xpIntoLevel,
      xpForLevel: this.xpNeeded(this.level),
      wave: this.wave,
      waveTimeLeft: Math.max(0, this.waveTimer),
      environmentId: this.environmentId,
      environmentName: env.name,
      skills: this.skills.map((s) => ({ ...s })),
      upgrades: this.upgrades.map((u) => ({ ...u })),
      obstacles: this.obstacles,
      projectiles: this.projectiles,
      pickups: this.pickups,
      transforms: this.transforms,
      floats: this.floats,
      influenceRadius: 90 + this.stats.influenceRadius,
      transformed: this.transformed,
      bossActive: this.bossActive,
      bossName: this.bossName,
      elapsed: this.elapsed,
      levelChoices: this.levelChoices,
      summary: this.summary,
      status: this.status,
    };
  }
}
