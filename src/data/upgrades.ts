import type { UpgradeDef } from "@/types/game";

export const UPGRADES: UpgradeDef[] = [
  {
    id: "fire_rate",
    name: "+25% Fire Rate",
    description: "Squad shoots faster. More bullets, more breathers.",
    neon: "#39f3ff",
    stackable: true,
    maxStacks: 5,
  },
  {
    id: "damage",
    name: "+20% Damage",
    description: "Every hit hits harder. Walkers melt.",
    neon: "#ff4d6d",
    stackable: true,
    maxStacks: 5,
  },
  {
    id: "move_speed",
    name: "+15% Move Speed",
    description: "Kite runners. Outrun the horde.",
    neon: "#7dffb3",
    stackable: true,
    maxStacks: 4,
  },
  {
    id: "extra_survivor",
    name: "+1 Survivor",
    description: "Another ally auto-fires beside you.",
    neon: "#ffd166",
    stackable: true,
    maxStacks: 4,
  },
  {
    id: "piercing",
    name: "Piercing Bullets",
    description: "Shots punch through whole packs.",
    neon: "#c77dff",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "shotgun",
    name: "Shotgun",
    description: "Close-range cone of pellets. Brutal.",
    neon: "#ff9f1c",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "flamethrower",
    name: "Flamethrower",
    description: "Continuous fire cone. Crowds vanish.",
    neon: "#ff6b35",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "sniper",
    name: "Sniper",
    description: "Long-range heavy rounds. Tank shredder.",
    neon: "#4cc9f0",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "grenades",
    name: "Grenades",
    description: "Periodic blasts clear dense clusters.",
    neon: "#80ed99",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "healing_drone",
    name: "Healing Drone",
    description: "Slow HP regen while you stay alive.",
    neon: "#52b788",
    stackable: false,
    maxStacks: 1,
  },
  {
    id: "explosive_ammo",
    name: "Explosive Ammo",
    description: "Hits splash damage onto nearby zombies.",
    neon: "#f72585",
    stackable: false,
    maxStacks: 1,
  },
];

export function getUpgrade(id: string): UpgradeDef | undefined {
  return UPGRADES.find((u) => u.id === id);
}
