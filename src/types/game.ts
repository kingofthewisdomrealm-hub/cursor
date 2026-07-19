export type EnemyType =
  | "walker"
  | "runner"
  | "tank"
  | "exploder"
  | "spitter"
  | "boss";

export type WeaponId =
  | "default"
  | "shotgun"
  | "flamethrower"
  | "sniper"
  | "grenades";

export type UpgradeId =
  | "fire_rate"
  | "damage"
  | "move_speed"
  | "extra_survivor"
  | "piercing"
  | "shotgun"
  | "flamethrower"
  | "sniper"
  | "grenades"
  | "healing_drone"
  | "explosive_ammo";

export type GamePhase =
  | "menu"
  | "combat"
  | "challenge"
  | "explanation"
  | "upgrade"
  | "score"
  | "dead";

export interface ScenarioOption {
  id: string;
  text: string;
}

export interface Scenario {
  id: string;
  packId: string;
  prompt: string;
  speaker: string;
  options: ScenarioOption[];
  correctOptionId: string;
  why: string;
  psychology: string;
  application: string;
}

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  neon: string;
  stackable: boolean;
  maxStacks: number;
}

export interface PackDef {
  id: string;
  name: string;
  description: string;
  unlockXp: number;
}

export interface CombatStats {
  fireRateMult: number;
  damageMult: number;
  moveSpeedMult: number;
  survivorCount: number;
  piercing: boolean;
  explosiveAmmo: boolean;
  healingDrone: boolean;
  weapons: WeaponId[];
}

export interface RunStats {
  kills: number;
  wave: number;
  survivalSeconds: number;
  questionsAnswered: number;
  questionsCorrect: number;
  xpCollected: number;
  level: number;
  upgradesTaken: UpgradeId[];
}

export interface ProgressionState {
  totalXp: number;
  unlockedPackIds: string[];
  bestScore: number;
  bestAccuracy: number;
  runsCompleted: number;
}

export interface HudSnapshot {
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  xpToNext: number;
  wave: number;
  waveTimer: number;
  kills: number;
  survivorCount: number;
}
