import type { DisciplineDef } from "@/game/types";

export const DISCIPLINES: DisciplineDef[] = [
  {
    id: "sales",
    name: "Sales",
    description: "Turn objections into curiosity and closes.",
    unlockLevel: 1,
    starterSkill: "openQuestions",
  },
  {
    id: "customerService",
    name: "Customer Service",
    description: "De-escalate heat and rebuild trust.",
    unlockLevel: 2,
    starterSkill: "empathy",
  },
  {
    id: "negotiation",
    name: "Negotiation",
    description: "Trade value without surrendering ground.",
    unlockLevel: 3,
    starterSkill: "labeling",
  },
  {
    id: "publicSpeaking",
    name: "Public Speaking",
    description: "Hold rooms, not just microphones.",
    unlockLevel: 4,
    starterSkill: "storytelling",
  },
  {
    id: "leadership",
    name: "Leadership",
    description: "Speak so people move with you.",
    unlockLevel: 5,
    starterSkill: "authority",
  },
  {
    id: "conflictResolution",
    name: "Conflict Resolution",
    description: "Transform friction into forward motion.",
    unlockLevel: 6,
    starterSkill: "activeListening",
  },
  {
    id: "management",
    name: "Management",
    description: "Clarity, feedback, and calm under pressure.",
    unlockLevel: 7,
    starterSkill: "summarizing",
  },
  {
    id: "coaching",
    name: "Coaching",
    description: "Ask the question that unlocks their answer.",
    unlockLevel: 8,
    starterSkill: "mirroring",
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Reframe problems into solvable paths.",
    unlockLevel: 9,
    starterSkill: "reframing",
  },
  {
    id: "dating",
    name: "Dating",
    description: "Warmth, wit, and genuine presence.",
    unlockLevel: 10,
    starterSkill: "humor",
  },
];

export const DISCIPLINE_MAP = Object.fromEntries(
  DISCIPLINES.map((d) => [d.id, d]),
) as Record<DisciplineDef["id"], DisciplineDef>;
