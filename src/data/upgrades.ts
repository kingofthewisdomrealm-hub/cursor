import type { UpgradeDef } from "@/game/types";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "fasterListening",
    name: "Faster Listening",
    description: "Skills recharge quicker as your ear sharpens.",
    maxLevel: 5,
  },
  {
    id: "widerInfluence",
    name: "Wider Influence Radius",
    description: "Your presence reaches people farther away.",
    maxLevel: 5,
  },
  {
    id: "betterStorytelling",
    name: "Better Storytelling",
    description: "Stories hit harder and travel farther.",
    maxLevel: 5,
  },
  {
    id: "moreConfidence",
    name: "More Confidence",
    description: "Collect more Confidence from every win.",
    maxLevel: 5,
  },
  {
    id: "strongerRapport",
    name: "Stronger Rapport",
    description: "All skills deal more influence.",
    maxLevel: 5,
  },
  {
    id: "increasedAuthority",
    name: "Increased Authority",
    description: "Authority skills pierce and dominate.",
    maxLevel: 5,
  },
  {
    id: "betterHumor",
    name: "Better Humor",
    description: "Humor cools hostile interactions faster.",
    maxLevel: 5,
  },
  {
    id: "fasterRecovery",
    name: "Faster Recovery",
    description: "Regain composure after mistakes quicker.",
    maxLevel: 5,
  },
  {
    id: "charismaMultiplier",
    name: "Charisma Multiplier",
    description: "A global boost to influence and Confidence.",
    maxLevel: 3,
  },
];

export const UPGRADE_MAP = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u]),
) as Record<UpgradeDef["id"], UpgradeDef>;
