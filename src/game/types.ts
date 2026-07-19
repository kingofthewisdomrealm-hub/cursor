export type ObstacleKind =
  | "objection"
  | "angry"
  | "indifferent"
  | "confused"
  | "distraction"
  | "skeptic"
  | "heckler"
  | "timePressure"
  | "competing"
  | "selfDoubt";

export type Behavior =
  | "chase"
  | "orbit"
  | "dash"
  | "wander"
  | "swarm"
  | "linger";

export type SkillId =
  | "openQuestions"
  | "activeListening"
  | "storytelling"
  | "humor"
  | "mirroring"
  | "reframing"
  | "labeling"
  | "patternInterrupt"
  | "summarizing"
  | "empathy"
  | "authority";

export type UpgradeId =
  | "fasterListening"
  | "widerInfluence"
  | "betterStorytelling"
  | "moreConfidence"
  | "strongerRapport"
  | "increasedAuthority"
  | "betterHumor"
  | "fasterRecovery"
  | "charismaMultiplier";

export type DisciplineId =
  | "sales"
  | "leadership"
  | "publicSpeaking"
  | "customerService"
  | "negotiation"
  | "dating"
  | "management"
  | "conflictResolution"
  | "coaching"
  | "consulting";

export type EnvironmentId =
  | "networking"
  | "salesFloor"
  | "stage"
  | "podcast"
  | "coffeeShop"
  | "familyDinner"
  | "jobInterview"
  | "conference"
  | "negotiationRoom"
  | "tradeShow";

export type BossId =
  | "difficultClient"
  | "hostileAudience"
  | "toughNegotiator"
  | "publicDebate"
  | "angryCustomer"
  | "investorPitch"
  | "mediaInterview";

export type GamePhase =
  | "menu"
  | "playing"
  | "levelUp"
  | "learning"
  | "bossIntro"
  | "paused"
  | "victory"
  | "defeat";

export interface Vec2 {
  x: number;
  y: number;
}

export interface ObstacleDef {
  kind: ObstacleKind;
  label: string;
  face: string;
  resolvedFace: string;
  resolvedLabel: string;
  color: string;
  speed: number;
  hp: number;
  damage: number;
  radius: number;
  confidence: number;
  behavior: Behavior;
  weakTo: SkillId[];
}

export interface SkillDef {
  id: SkillId;
  name: string;
  description: string;
  color: string;
  cooldown: number;
  range: number;
  power: number;
  projectileSpeed: number;
  pierce: number;
  style: "beam" | "pulse" | "arc" | "burst";
}

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  description: string;
  maxLevel: number;
}

export interface EnvironmentDef {
  id: EnvironmentId;
  name: string;
  tagline: string;
  accent: string;
  floor: string;
  obstacleBias: ObstacleKind[];
  unlockWave: number;
}

export interface BossDef {
  id: BossId;
  name: string;
  face: string;
  resolvedFace: string;
  description: string;
  hp: number;
  speed: number;
  damage: number;
  radius: number;
  confidence: number;
  weakTo: SkillId[];
  environment: EnvironmentId;
}

export interface ScenarioChoice {
  id: string;
  text: string;
  correct: boolean;
}

export interface ScenarioDef {
  id: string;
  discipline: DisciplineId;
  prompt: string;
  speaker: string;
  choices: ScenarioChoice[];
  explanation: string;
  rewardUpgrade: UpgradeId;
}

export interface DisciplineDef {
  id: DisciplineId;
  name: string;
  description: string;
  unlockLevel: number;
  starterSkill: SkillId;
}

export interface PlayerStats {
  maxComposure: number;
  composure: number;
  moveSpeed: number;
  influenceRadius: number;
  confidenceGain: number;
  rapport: number;
  authority: number;
  humor: number;
  recovery: number;
  charisma: number;
  listeningSpeed: number;
  storytelling: number;
}

export interface OwnedSkill {
  id: SkillId;
  level: number;
}

export interface OwnedUpgrade {
  id: UpgradeId;
  level: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  skillId: SkillId;
  power: number;
  pierce: number;
  life: number;
  color: string;
  radius: number;
  hitIds: Set<number>;
}

export interface Pickup {
  id: number;
  x: number;
  y: number;
  value: number;
  life: number;
}

export interface TransformFx {
  id: number;
  x: number;
  y: number;
  face: string;
  label: string;
  life: number;
  maxLife: number;
}

export interface ObstacleEntity {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  damage: number;
  confidence: number;
  behavior: Behavior;
  weakTo: SkillId[];
  face: string;
  resolvedFace: string;
  resolvedLabel: string;
  color: string;
  label: string;
  phase: number;
  dashCooldown: number;
  isBoss: boolean;
  bossId?: BossId;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface LevelChoice {
  type: "skill" | "upgrade";
  skillId?: SkillId;
  upgradeId?: UpgradeId;
  title: string;
  description: string;
  detail: string;
}

export interface RunSummary {
  wave: number;
  confidence: number;
  level: number;
  transformed: number;
  environment: EnvironmentId;
  durationSec: number;
}
