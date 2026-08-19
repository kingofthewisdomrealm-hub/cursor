export type MasteryLevelId = 0 | 1 | 2 | 3 | 4 | 5;

export interface MasteryMission {
  id: string;
  label: string;
  detail: string;
}

export interface MasteryLevel {
  id: MasteryLevelId;
  name: string;
  epithet: string;
  width: number;
  accent: string;
  glow: string;
  looksLike: string;
  you: string;
  whyItMatters: string;
  missions: MasteryMission[];
}

/** Diagnosed from Josias's actual Cloud Agent history, Aug 2026. */
export const DIAGNOSED_LEVEL: MasteryLevelId = 2;

export const LEVELS: MasteryLevel[] = [
  {
    id: 0,
    name: "Spectator",
    epithet: "Installed. Unused.",
    width: 100,
    accent: "#6d7690",
    glow: "rgba(109, 118, 144, 0.35)",
    looksLike:
      "Cursor is on the dock. ChatGPT is still where the work happens. You have not asked the editor to touch a file.",
    you: "You left this level the first week. You already let agents write and merge code. Do not camp here.",
    whyItMatters:
      "Most people never start. You did. The danger is thinking that starting is the whole game.",
    missions: [
      {
        id: "open-cursor",
        label: "Open Cursor on Desktop at least once this week",
        detail: "Phone Cloud Agents are a surface. The IDE is the instrument.",
      },
      {
        id: "one-repo",
        label: "Know which GitHub repo is the source of truth",
        detail: "If everything lives in a junk drawer named cursor, nothing is the product.",
      },
    ],
  },
  {
    id: 1,
    name: "Prompt tourist",
    epithet: "ChatGPT in a trench coat.",
    width: 86,
    accent: "#8aa0c8",
    glow: "rgba(138, 160, 200, 0.35)",
    looksLike:
      "One-shot prompts. Copy-paste. No diff. No thread. The model is a vending machine.",
    you: "You skipped the tourist phase on specs — yours are unusually sharp. You still tour on follow-ups: “produce url,” “not working,” then a new agent.",
    whyItMatters:
      "Tourists generate. Operators steer. The gap is whether you read what came back.",
    missions: [
      {
        id: "read-diff",
        label: "Open one PR and read the files changed before you merge",
        detail: "If you cannot say what changed, you did not ship. The agent did.",
      },
      {
        id: "stay-thread",
        label: "Reply in the same agent instead of launching a twin",
        detail: "Two Communication Survival agents, five minutes apart, was tourism with extra steps.",
      },
    ],
  },
  {
    id: 2,
    name: "Cloud-agent sprinter",
    epithet: "You are here.",
    width: 72,
    accent: "#39f3ff",
    glow: "rgba(57, 243, 255, 0.45)",
    looksLike:
      "Long product specs from the phone. Cloud Agent builds an MVP. You ask for a friend URL. Merge or abandon. Next idea.",
    you: "19 agents. 16 products. 8 merges that overwrote each other. Spec quality is Level 3. Finish quality is Level 1. This stone is home until you keep one codebase alive.",
    whyItMatters:
      "Sprinting feels like mastery because the PR exists. It is not. Cursor made starting cheap. Finishing is still expensive — and that is the skill.",
    missions: [
      {
        id: "pick-one",
        label: "Pick ONE product. Give it its own repo.",
        detail: "Tax Mapper and Communication Survival are the two that actually got follow-through. Choose. Leave this junk drawer.",
      },
      {
        id: "five-bugs",
        label: "Play it yourself. Send five specific bugs before any friend URL.",
        detail: "“URL works, game doesn’t” was your best report. Make that the default.",
      },
      {
        id: "real-host",
        label: "Put it on a real host, not a dying tunnel",
        detail: "Friends hitting Cloudflare 1033 is not a launch. Vercel or Pages that you actually enabled.",
      },
      {
        id: "desktop-build",
        label: "Build the next feature on Desktop, not a new mobile agent",
        detail: "Phone is for kicks and follow-ups. Desktop is for Tab, the diff, and the running app.",
      },
      {
        id: "one-rule",
        label: "Write one Cursor rule: never replace the whole app",
        detail: "A .cursor/rules file is the cheapest way to stop agents from deleting last week’s product.",
      },
    ],
  },
  {
    id: 3,
    name: "Iterative builder",
    epithet: "Same repo. Second month.",
    width: 58,
    accent: "#7dffb3",
    glow: "rgba(125, 255, 179, 0.4)",
    looksLike:
      "One product. Desktop Agent plus Tab. You play it. You file real bugs. You review the diff. You ship to a URL that still works tomorrow.",
    you: "You have not lived here yet. Outcome Agent and Tax Mapper brushed it — then a new spec wiped the slate. This is the first level that compounds.",
    whyItMatters:
      "Dangerous people have scar tissue in one codebase. Not a museum of first drafts.",
    missions: [
      {
        id: "ten-days",
        label: "Work the same repo for ten sessions without starting a new product",
        detail: "If a new idea hits, write it in a note. Do not spawn an agent.",
      },
      {
        id: "name-surfaces",
        label: "Say out loud what Tab, Agent, and Cloud Agent are each for",
        detail: "Tab = small edit. Agent = a feature in the repo. Cloud = long job while you walk. Stop using Cloud for everything.",
      },
      {
        id: "last-pr",
        label: "Explain your last PR to a friend without opening GitHub",
        detail: "If you cannot, you merged a blur. Go back and look.",
      },
    ],
  },
  {
    id: 4,
    name: "Workflow designer",
    epithet: "The tool starts remembering you.",
    width: 50,
    accent: "#ffd166",
    glow: "rgba(255, 209, 102, 0.4)",
    looksLike:
      "Rules. Environment. Model choice. MCP when it earns its keep. CI. Follow-ups on the same thread. Agents compound instead of resetting.",
    you: "Setup PR is still a draft. No saved environment. Default model every time. You asked an agent to organize your agents — that impulse belongs here, after Level 3 is a habit.",
    whyItMatters:
      "At 4, Cursor stops being a genie and becomes a workshop you designed. Do not skip 3 to play with 4’s toys. They will multiply the firehose.",
    missions: [
      {
        id: "env-json",
        label: "Give Cloud Agents a working environment.json",
        detail: "Install, start, ports. Agents should boot into a running app, not a cold machine.",
      },
      {
        id: "pick-model",
        label: "Choose a model on purpose for one hard task",
        detail: "Default is fine for chores. Architecture and review are not chores.",
      },
      {
        id: "ci-green",
        label: "Do not merge red CI. Ever.",
        detail: "You already asked an agent to fix a failing check once. Make that non-negotiable.",
      },
    ],
  },
  {
    id: 5,
    name: "Dangerous",
    epithet: "The peak.",
    width: 36,
    accent: "#ff6b3d",
    glow: "rgba(255, 107, 61, 0.55)",
    looksLike:
      "Custom skills. Automations. Evals. Team defaults. Cursor is how the product ships, not how ideas get sketched. You can leave for a day and the system still has taste.",
    you: "This is not a setting. It is a career. You get here by keeping Level 3 for months, then teaching the tool your standards.",
    whyItMatters:
      "Dangerous means you waste almost no motion. One thread. One product. Agents that already know your rules. Ideas wait their turn.",
    missions: [
      {
        id: "taste-in-rules",
        label: "Encode your taste so a new agent sounds like you on day one",
        detail: "Stack, voice, “never replace the app,” how you test, how you ship.",
      },
      {
        id: "teach-one",
        label: "Teach one person this pyramid using your own scars",
        detail: "If you can teach it, you own it. 16 products in 7 days is the scar. Use it.",
      },
    ],
  },
];

export const LEVEL_BY_ID = Object.fromEntries(
  LEVELS.map((level) => [level.id, level]),
) as Record<MasteryLevelId, MasteryLevel>;

export function isLevelUnlocked(
  id: MasteryLevelId,
  completed: Record<number, string[]>,
): boolean {
  if (id <= DIAGNOSED_LEVEL) return true;
  const prev = id - 1;
  const prevLevel = LEVEL_BY_ID[prev as MasteryLevelId];
  const done = completed[prev] ?? [];
  return prevLevel.missions.every((mission) => done.includes(mission.id));
}

export function isLevelCleared(
  id: MasteryLevelId,
  completed: Record<number, string[]>,
): boolean {
  const level = LEVEL_BY_ID[id];
  const done = completed[id] ?? [];
  return level.missions.every((mission) => done.includes(mission.id));
}
