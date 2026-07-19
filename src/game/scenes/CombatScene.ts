import Phaser from "phaser";
import { ENEMY, GAME, type EnemyKey } from "@/game/config";
import { ensureTextures } from "@/game/textures";
import { sfx } from "@/game/audio";
import type { CombatStats, HudSnapshot } from "@/types/game";
import { DEFAULT_COMBAT } from "@/store/gameStore";

export type CombatBridge = {
  getCombat: () => CombatStats;
  onHud: (hud: Partial<HudSnapshot>) => void;
  onWaveComplete: () => void;
  onPlayerDeath: () => void;
  onRunTick: (seconds: number, kills: number, level: number, xp: number) => void;
  isPausedByUi: () => boolean;
};

type EnemyObj = Phaser.Physics.Arcade.Image & {
  hp: number;
  maxHp: number;
  kind: EnemyKey;
  damage: number;
  speed: number;
  xpValue: number;
  fuse?: number;
  spitCd?: number;
};

type BulletObj = Phaser.Physics.Arcade.Image & {
  damage: number;
  piercing: boolean;
  explosive: boolean;
  life: number;
  weapon: string;
};

type GemObj = Phaser.Physics.Arcade.Image & { value: number };

export class CombatScene extends Phaser.Scene {
  bridge!: CombatBridge;
  player!: Phaser.Physics.Arcade.Image;
  survivors!: Phaser.Physics.Arcade.Group;
  enemies!: Phaser.Physics.Arcade.Group;
  bullets!: Phaser.Physics.Arcade.Group;
  gems!: Phaser.Physics.Arcade.Group;
  hazards!: Phaser.Physics.Arcade.Group;
  drone?: Phaser.Physics.Arcade.Image;

  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd!: Record<"W" | "A" | "S" | "D", Phaser.Input.Keyboard.Key>;
  joystick = { active: false, dx: 0, dy: 0 };

  hp: number = GAME.playerMaxHp;
  maxHp: number = GAME.playerMaxHp;
  level = 1;
  xp = 0;
  xpToNext: number = GAME.xpBase;
  kills = 0;
  wave = 1;
  waveTimer: number = GAME.waveDuration;
  survivalSeconds = 0;
  spawnAcc = 0;
  fireAcc = 0;
  grenadeAcc = 0;
  healAcc = 0;
  ambienceAcc = 0;
  bossSpawned = false;
  combatFrozen = false;
  particleBurst!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super("CombatScene");
  }

  init(data: { bridge: CombatBridge }) {
    this.bridge = data.bridge;
  }

  create() {
    ensureTextures(this);
    const { width, height } = this.scale;

    this.add
      .tileSprite(0, 0, width * 3, height * 3, "city_tile")
      .setOrigin(0)
      .setScrollFactor(0.4)
      .setAlpha(0.95);

    // Neon street glow planes
    const glow = this.add.graphics();
    glow.fillStyle(0x39f3ff, 0.05);
    glow.fillRect(0, height * 0.35, width, 8);
    glow.fillStyle(0xff006e, 0.04);
    glow.fillRect(0, height * 0.7, width, 6);
    glow.setScrollFactor(0);

    this.physics.world.setBounds(0, 0, width, height);

    this.player = this.physics.add.image(width / 2, height / 2, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setCircle(12);

    this.survivors = this.physics.add.group();
    this.enemies = this.physics.add.group({
      maxSize: GAME.maxEnemies,
      runChildUpdate: false,
    });
    this.bullets = this.physics.add.group({ maxSize: 400 });
    this.gems = this.physics.add.group({ maxSize: 250 });
    this.hazards = this.physics.add.group({ maxSize: 40 });

    this.particleBurst = this.add.particles(0, 0, "xp", {
      speed: { min: 40, max: 160 },
      scale: { start: 0.7, end: 0 },
      lifespan: 350,
      emitting: false,
      tint: [0xff4d6d, 0x39f3ff, 0xffd166],
    });

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.onBulletHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.onPlayerTouchEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.gems,
      this.onPickupGem as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );
    this.physics.add.overlap(
      this.player,
      this.hazards,
      this.onHazardHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = this.input.keyboard.addKeys("W,A,S,D") as typeof this.wasd;
    }

    this.setupJoystick();
    this.syncSurvivors();
    this.emitHud();
    this.cameras.main.setBackgroundColor("#070b16");
    this.cameras.main.flash(400, 10, 20, 40);

    this.events.on("resume-combat", () => {
      this.combatFrozen = false;
      this.waveTimer = GAME.waveDuration;
      this.syncSurvivors();
      this.syncDrone();
      this.physics.resume();
    });

    this.events.on("apply-slowmo", () => {
      this.time.timeScale = 0.35;
      this.tweens.timeScale = 0.35;
      this.time.delayedCall(700, () => {
        this.time.timeScale = 1;
        this.tweens.timeScale = 1;
      });
    });
  }

  setupJoystick() {
    const zone = this.add
      .zone(0, 0, this.scale.width, this.scale.height)
      .setOrigin(0)
      .setInteractive();

    let baseX = 0;
    let baseY = 0;

    zone.on("pointerdown", (p: Phaser.Input.Pointer) => {
      if (p.y < this.scale.height * 0.2) return;
      this.joystick.active = true;
      baseX = p.x;
      baseY = p.y;
    });
    zone.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!this.joystick.active || !p.isDown) return;
      const dx = p.x - baseX;
      const dy = p.y - baseY;
      const len = Math.hypot(dx, dy) || 1;
      const max = 60;
      const clamped = Math.min(len, max);
      this.joystick.dx = (dx / len) * (clamped / max);
      this.joystick.dy = (dy / len) * (clamped / max);
    });
    const end = () => {
      this.joystick.active = false;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
    };
    zone.on("pointerup", end);
    zone.on("pointerupoutside", end);
  }

  getCombat(): CombatStats {
    return this.bridge?.getCombat() ?? DEFAULT_COMBAT;
  }

  syncSurvivors() {
    const count = this.getCombat().survivorCount;
    while (this.survivors.getLength() < count) {
      const s = this.survivors.create(
        this.player.x + Phaser.Math.Between(-24, 24),
        this.player.y + Phaser.Math.Between(-24, 24),
        "survivor",
      ) as Phaser.Physics.Arcade.Image;
      s.setDepth(9);
      s.setCircle(9);
    }
    while (this.survivors.getLength() > count) {
      const child = this.survivors.getFirstAlive();
      if (child) child.destroy();
      else break;
    }
  }

  syncDrone() {
    if (this.getCombat().healingDrone && !this.drone) {
      this.drone = this.physics.add.image(
        this.player.x,
        this.player.y - 28,
        "drone",
      );
      this.drone.setDepth(11);
    }
  }

  update(_time: number, delta: number) {
    if (!this.bridge || this.bridge.isPausedByUi() || this.combatFrozen) {
      this.player.setVelocity(0, 0);
      return;
    }

    const dt = delta / 1000;
    this.survivalSeconds += dt;
    this.waveTimer -= dt;
    this.ambienceAcc += dt;
    if (this.ambienceAcc > 3.5) {
      this.ambienceAcc = 0;
      sfx.ambiencePulse();
    }

    this.movePlayer(dt);
    this.updateSurvivors(dt);
    this.updateEnemies(dt);
    this.updateBullets(dt);
    this.spawnWave(dt);
    this.autoFire(dt);
    this.updateWeapons(dt);
    this.updateDrone(dt);
    this.pullGems(dt);

    if (this.waveTimer <= 0) {
      this.freezeForChallenge();
    }

    if (this.wave >= GAME.bossAtWave && !this.bossSpawned) {
      this.spawnEnemy("boss");
      this.bossSpawned = true;
      this.cameras.main.shake(300, 0.01);
    }

    this.bridge.onRunTick(
      Math.floor(this.survivalSeconds),
      this.kills,
      this.level,
      this.xp,
    );
    this.emitHud();
  }

  freezeForChallenge() {
    this.combatFrozen = true;
    this.physics.pause();
    this.player.setVelocity(0, 0);
    this.bridge.onWaveComplete();
  }

  movePlayer(dt: number) {
    const combat = this.getCombat();
    const speed = GAME.playerSpeed * combat.moveSpeedMult;
    let mx = 0;
    let my = 0;

    if (this.joystick.active) {
      mx = this.joystick.dx;
      my = this.joystick.dy;
    } else if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) mx -= 1;
      if (this.cursors.right.isDown || this.wasd.D.isDown) mx += 1;
      if (this.cursors.up.isDown || this.wasd.W.isDown) my -= 1;
      if (this.cursors.down.isDown || this.wasd.S.isDown) my += 1;
    }

    const len = Math.hypot(mx, my);
    if (len > 0) {
      mx /= len;
      my /= len;
    }
    this.player.setVelocity(mx * speed, my * speed);

    // Subtle neon trail
    if (len > 0 && Math.random() < dt * 8) {
      const t = this.add.circle(this.player.x, this.player.y, 3, 0x39f3ff, 0.35);
      this.tweens.add({
        targets: t,
        alpha: 0,
        scale: 0.2,
        duration: 280,
        onComplete: () => t.destroy(),
      });
    }
  }

  updateSurvivors(dt: number) {
    const kids = this.survivors.getChildren() as Phaser.Physics.Arcade.Image[];
    kids.forEach((s, i) => {
      const angle = this.time.now / 700 + (i * Math.PI * 2) / Math.max(1, kids.length);
      const tx = this.player.x + Math.cos(angle) * 28;
      const ty = this.player.y + Math.sin(angle) * 28;
      const dx = tx - s.x;
      const dy = ty - s.y;
      s.setVelocity(dx * 8, dy * 8);
      void dt;
    });
  }

  updateDrone(dt: number) {
    const combat = this.getCombat();
    if (!combat.healingDrone) return;
    this.syncDrone();
    if (!this.drone) return;
    const angle = this.time.now / 500;
    this.drone.x = this.player.x + Math.cos(angle) * 26;
    this.drone.y = this.player.y + Math.sin(angle) * 26 - 8;
    this.healAcc += dt;
    if (this.healAcc > 1) {
      this.healAcc = 0;
      this.hp = Math.min(this.maxHp, this.hp + 3);
    }
  }

  nearestEnemy(
    x: number,
    y: number,
  ): EnemyObj | null {
    let best: EnemyObj | null = null;
    let bestD = Infinity;
    const list = this.enemies.getChildren() as EnemyObj[];
    for (const e of list) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Squared(x, y, e.x, e.y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  autoFire(dt: number) {
    const combat = this.getCombat();
    const cooldown = GAME.baseFireCooldown / combat.fireRateMult;
    this.fireAcc += dt * 1000;
    if (this.fireAcc < cooldown) return;
    this.fireAcc = 0;

    const shooters: { x: number; y: number }[] = [
      { x: this.player.x, y: this.player.y },
      ...(this.survivors.getChildren() as Phaser.Physics.Arcade.Image[]).map(
        (s) => ({ x: s.x, y: s.y }),
      ),
    ];

    for (const s of shooters) {
      const target = this.nearestEnemy(s.x, s.y);
      if (!target) continue;
      this.fireWeapon("default", s.x, s.y, target.x, target.y, combat);
      if (combat.weapons.includes("shotgun")) {
        this.fireWeapon("shotgun", s.x, s.y, target.x, target.y, combat);
      }
      if (combat.weapons.includes("sniper") && Math.random() < 0.35) {
        this.fireWeapon("sniper", s.x, s.y, target.x, target.y, combat);
      }
    }
    sfx.shoot();
  }

  updateWeapons(dt: number) {
    const combat = this.getCombat();
    if (combat.weapons.includes("flamethrower")) {
      const target = this.nearestEnemy(this.player.x, this.player.y);
      if (target) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          target.x,
          target.y,
        );
        if (dist < 130 && Math.random() < dt * 14) {
          this.fireWeapon(
            "flamethrower",
            this.player.x,
            this.player.y,
            target.x,
            target.y,
            combat,
          );
        }
      }
    }

    if (combat.weapons.includes("grenades")) {
      this.grenadeAcc += dt;
      if (this.grenadeAcc > 2.2) {
        this.grenadeAcc = 0;
        const target = this.nearestEnemy(this.player.x, this.player.y);
        if (target) this.lobGrenade(target.x, target.y, combat);
      }
    }
  }

  fireWeapon(
    weapon: string,
    x: number,
    y: number,
    tx: number,
    ty: number,
    combat: CombatStats,
  ) {
    const angle = Phaser.Math.Angle.Between(x, y, tx, ty);
    const mk = (
      key: string,
      speed: number,
      damage: number,
      life: number,
      spread = 0,
    ) => {
      const a = angle + spread;
      const b = this.bullets.get(x, y, key) as BulletObj | null;
      if (!b) return;
      b.setActive(true).setVisible(true);
      b.damage = damage * combat.damageMult;
      b.piercing = combat.piercing && weapon !== "flamethrower";
      b.explosive = combat.explosiveAmmo;
      b.life = life;
      b.weapon = weapon;
      b.setRotation(a + Math.PI / 2);
      b.setDepth(8);
      this.physics.velocityFromRotation(a, speed, b.body?.velocity);
    };

    if (weapon === "default") {
      mk("bullet", 340, GAME.baseDamage, 900);
    } else if (weapon === "shotgun") {
      for (let i = -2; i <= 2; i += 1) {
        mk("pellet", 300, GAME.baseDamage * 0.55, 420, i * 0.14);
      }
    } else if (weapon === "flamethrower") {
      mk("flame", 220, GAME.baseDamage * 0.35, 220, Phaser.Math.FloatBetween(-0.2, 0.2));
    } else if (weapon === "sniper") {
      mk("sniper_bullet", 520, GAME.baseDamage * 2.4, 1200);
    }
  }

  lobGrenade(tx: number, ty: number, combat: CombatStats) {
    const g = this.bullets.get(this.player.x, this.player.y, "grenade") as BulletObj | null;
    if (!g) return;
    g.setActive(true).setVisible(true);
    g.damage = 40 * combat.damageMult;
    g.piercing = false;
    g.explosive = true;
    g.life = 700;
    g.weapon = "grenade";
    this.physics.moveTo(g, tx, ty, 220);
  }

  updateBullets(dt: number) {
    const list = this.bullets.getChildren() as BulletObj[];
    for (const b of list) {
      if (!b.active) continue;
      b.life -= dt * 1000;
      if (
        b.life <= 0 ||
        b.x < -40 ||
        b.y < -40 ||
        b.x > this.scale.width + 40 ||
        b.y > this.scale.height + 40
      ) {
        if (b.weapon === "grenade") this.explodeAt(b.x, b.y, b.damage, 70);
        b.setActive(false).setVisible(false);
        b.body?.stop();
      }
    }
  }

  spawnWave(dt: number) {
    const rate = Math.max(0.12, 0.55 - this.wave * 0.03 - this.level * 0.01);
    this.spawnAcc += dt;
    while (this.spawnAcc >= rate) {
      this.spawnAcc -= rate;
      if (this.enemies.countActive(true) >= GAME.maxEnemies) break;
      this.spawnEnemy(this.pickEnemyType());
    }
  }

  pickEnemyType(): EnemyKey {
    const roll = Math.random() + this.wave * 0.02;
    if (roll > 1.35) return "tank";
    if (roll > 1.15) return "spitter";
    if (roll > 0.95) return "exploder";
    if (roll > 0.55) return "runner";
    return "walker";
  }

  spawnEnemy(kind: EnemyKey) {
    const def = ENEMY[kind];
    const side = Phaser.Math.Between(0, 3);
    let x = 0;
    let y = 0;
    const w = this.scale.width;
    const h = this.scale.height;
    if (side === 0) {
      x = Phaser.Math.Between(0, w);
      y = -20;
    } else if (side === 1) {
      x = w + 20;
      y = Phaser.Math.Between(0, h);
    } else if (side === 2) {
      x = Phaser.Math.Between(0, w);
      y = h + 20;
    } else {
      x = -20;
      y = Phaser.Math.Between(0, h);
    }

    const e = this.enemies.get(x, y, kind) as EnemyObj | null;
    if (!e) return;
    e.setActive(true).setVisible(true);
    e.kind = kind;
    e.hp = def.hp * (1 + (this.wave - 1) * 0.12);
    e.maxHp = e.hp;
    e.damage = def.damage;
    e.speed = def.speed;
    e.xpValue = def.xp;
    e.fuse = kind === "exploder" ? ENEMY.exploder.fuse : undefined;
    e.spitCd = 0;
    e.setDepth(6);
    e.setCircle(def.radius);
    e.setTint(def.color);
  }

  updateEnemies(dt: number) {
    const list = this.enemies.getChildren() as EnemyObj[];
    for (const e of list) {
      if (!e.active) continue;
      const angle = Phaser.Math.Angle.Between(e.x, e.y, this.player.x, this.player.y);
      let speed = e.speed;

      if (e.kind === "runner") {
        // Dashier zig-zag
        speed *= 1 + Math.sin(this.time.now / 120 + e.x) * 0.15;
      }
      if (e.kind === "spitter") {
        const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        if (dist < ENEMY.spitter.range) {
          speed *= 0.25;
          e.spitCd = (e.spitCd ?? 0) - dt * 1000;
          if ((e.spitCd ?? 0) <= 0) {
            e.spitCd = ENEMY.spitter.spitCooldown;
            this.spitAt(e.x, e.y, this.player.x, this.player.y);
          }
        }
      }
      if (e.kind === "exploder") {
        const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        if (dist < 42) {
          e.fuse = (e.fuse ?? 180) - dt * 1000;
          e.setTint(Phaser.Display.Color.GetColor(255, 80 + Math.sin(this.time.now / 40) * 40, 40));
          if ((e.fuse ?? 0) <= 0) {
            this.explodeAt(e.x, e.y, e.damage, 56);
            this.hurtPlayer(e.damage * 0.6);
            this.killEnemy(e, false);
            continue;
          }
        }
      }
      if (e.kind === "boss") {
        speed *= 1 + Math.sin(this.time.now / 400) * 0.2;
        if (Math.random() < dt * 0.7) {
          this.spawnEnemy(Math.random() > 0.5 ? "runner" : "walker");
        }
      }

      this.physics.velocityFromRotation(angle, speed, e.body?.velocity);
    }
  }

  spitAt(x: number, y: number, tx: number, ty: number) {
    const spit = this.hazards.get(x, y, "spit") as
      | (Phaser.Physics.Arcade.Image & { damage: number; life: number })
      | null;
    if (!spit) return;
    spit.setActive(true).setVisible(true);
    spit.damage = ENEMY.spitter.damage;
    spit.life = 1800;
    this.physics.moveTo(spit, tx, ty, 180);
  }

  onBulletHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    bulletObj,
    enemyObj,
  ) => {
    const b = bulletObj as BulletObj;
    const e = enemyObj as EnemyObj;
    if (!b.active || !e.active) return;

    e.hp -= b.damage;
    sfx.hit();
    this.particleBurst.emitParticleAt(e.x, e.y, 3);

    if (b.explosive) {
      this.explodeAt(e.x, e.y, b.damage * 0.45, 40);
    }

    if (!b.piercing || b.weapon === "grenade") {
      if (b.weapon === "grenade") this.explodeAt(b.x, b.y, b.damage, 70);
      b.setActive(false).setVisible(false);
      b.body?.stop();
    }

    if (e.hp <= 0) this.killEnemy(e, true);
  };

  explodeAt(x: number, y: number, damage: number, radius: number) {
    sfx.explode();
    const ring = this.add.circle(x, y, 8, 0xff4d6d, 0.55);
    this.tweens.add({
      targets: ring,
      radius,
      alpha: 0,
      duration: 220,
      onComplete: () => ring.destroy(),
    });
    this.particleBurst.emitParticleAt(x, y, 12);

    const list = this.enemies.getChildren() as EnemyObj[];
    for (const e of list) {
      if (!e.active) continue;
      if (Phaser.Math.Distance.Between(x, y, e.x, e.y) <= radius) {
        e.hp -= damage;
        if (e.hp <= 0) this.killEnemy(e, true);
      }
    }
  }

  killEnemy(e: EnemyObj, dropXp: boolean) {
    if (!e.active) return;
    e.setActive(false).setVisible(false);
    e.body?.stop();
    this.kills += 1;
    if (dropXp) this.dropGem(e.x, e.y, e.xpValue);
    if (e.kind === "boss") {
      this.cameras.main.flash(500, 255, 0, 110);
      this.dropGem(e.x, e.y, 40);
      this.bossSpawned = false;
    }
  }

  dropGem(x: number, y: number, value: number) {
    const gem = this.gems.get(x, y, "xp") as GemObj | null;
    if (!gem) return;
    gem.setActive(true).setVisible(true);
    gem.value = value;
    gem.setDepth(5);
  }

  pullGems(dt: number) {
    const list = this.gems.getChildren() as GemObj[];
    for (const g of list) {
      if (!g.active) continue;
      const dist = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y);
      if (dist < 90) {
        this.physics.moveToObject(g, this.player, 220);
      } else {
        g.body?.stop();
      }
      void dt;
    }

    const hazards = this.hazards.getChildren() as (Phaser.Physics.Arcade.Image & {
      life: number;
    })[];
    for (const h of hazards) {
      if (!h.active) continue;
      h.life -= dt * 1000;
      if (h.life <= 0) {
        h.setActive(false).setVisible(false);
        h.body?.stop();
      }
    }
  }

  onPickupGem: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    gemObj,
  ) => {
    const gem = gemObj as GemObj;
    if (!gem.active) return;
    this.xp += gem.value;
    gem.setActive(false).setVisible(false);
    gem.body?.stop();
    sfx.pickup();
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.floor(this.xpToNext * GAME.xpGrowth);
      this.maxHp += 5;
      this.hp = Math.min(this.maxHp, this.hp + 20);
      sfx.levelUp();
      this.cameras.main.flash(200, 57, 243, 255);
      const label = this.add
        .text(this.player.x, this.player.y - 30, "LEVEL UP", {
          fontFamily: "Orbitron, sans-serif",
          fontSize: "16px",
          color: "#39f3ff",
        })
        .setOrigin(0.5)
        .setDepth(20);
      this.tweens.add({
        targets: label,
        y: label.y - 40,
        alpha: 0,
        duration: 800,
        onComplete: () => label.destroy(),
      });
    }
  };

  onPlayerTouchEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    enemyObj,
  ) => {
    const e = enemyObj as EnemyObj;
    if (!e.active) return;
    this.hurtPlayer(e.damage * 0.05);
  };

  onHazardHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (
    _player,
    hazardObj,
  ) => {
    const h = hazardObj as Phaser.Physics.Arcade.Image & { damage: number };
    if (!h.active) return;
    this.hurtPlayer(h.damage);
    h.setActive(false).setVisible(false);
    h.body?.stop();
  };

  hurtPlayer(amount: number) {
    this.hp -= amount;
    this.cameras.main.shake(80, 0.004);
    if (this.hp <= 0) {
      this.hp = 0;
      this.combatFrozen = true;
      this.physics.pause();
      this.bridge.onPlayerDeath();
    }
  }

  emitHud() {
    this.bridge.onHud({
      hp: Math.max(0, Math.round(this.hp)),
      maxHp: this.maxHp,
      level: this.level,
      xp: Math.floor(this.xp),
      xpToNext: this.xpToNext,
      wave: this.wave,
      waveTimer: Math.max(0, this.waveTimer),
      kills: this.kills,
      survivorCount: this.getCombat().survivorCount,
    });
  }

  syncFromStore(wave: number) {
    this.wave = wave;
    this.syncSurvivors();
    this.syncDrone();
  }
}
