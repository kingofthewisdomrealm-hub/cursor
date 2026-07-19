import type { ScenarioDef } from "@/game/types";

export const SCENARIOS: ScenarioDef[] = [
  {
    id: "price-too-high",
    discipline: "sales",
    speaker: "Customer",
    prompt: "Your price is too high.",
    choices: [
      { id: "a", text: "Defend the price with features.", correct: false },
      { id: "b", text: "Ask a clarifying question about what “too high” means.", correct: true },
      { id: "c", text: "Discount immediately.", correct: false },
    ],
    explanation:
      "Clarifying questions uncover the real concern—budget, ROI, or comparison—so you can respond with relevance instead of reacting with price cuts.",
    rewardUpgrade: "moreConfidence",
  },
  {
    id: "angry-wait",
    discipline: "customerService",
    speaker: "Customer",
    prompt: "I’ve been waiting forever and nobody cares!",
    choices: [
      { id: "a", text: "Explain the policy and queue times.", correct: false },
      { id: "b", text: "Label the frustration, then own the next step.", correct: true },
      { id: "c", text: "Tell them to calm down.", correct: false },
    ],
    explanation:
      "Naming the emotion (“It sounds incredibly frustrating…”) reduces charge. Ownership of the next step rebuilds trust faster than policy lectures.",
    rewardUpgrade: "fasterRecovery",
  },
  {
    id: "not-interested",
    discipline: "sales",
    speaker: "Prospect",
    prompt: "We’re not interested right now.",
    choices: [
      { id: "a", text: "Push harder with urgency.", correct: false },
      { id: "b", text: "Acknowledge, then ask what would make timing right.", correct: true },
      { id: "c", text: "Hang up politely.", correct: false },
    ],
    explanation:
      "Interest often hides behind timing. Curiosity keeps the door open without pressure and turns a no into useful information.",
    rewardUpgrade: "widerInfluence",
  },
  {
    id: "negotiate-walkaway",
    discipline: "negotiation",
    speaker: "Counterpart",
    prompt: "That’s our final offer. Take it or leave it.",
    choices: [
      { id: "a", text: "Accept immediately to avoid conflict.", correct: false },
      { id: "b", text: "Pause, summarize interests, and propose a trade.", correct: true },
      { id: "c", text: "Match their threat with your own.", correct: false },
    ],
    explanation:
      "Ultimatums are often tactics. Summarizing interests and offering a trade reopens options without escalating the standoff.",
    rewardUpgrade: "increasedAuthority",
  },
  {
    id: "heckler-stage",
    discipline: "publicSpeaking",
    speaker: "Audience member",
    prompt: "This is boring—when do we get to the point?",
    choices: [
      { id: "a", text: "Ignore them and keep reading slides.", correct: false },
      { id: "b", text: "Use a pattern interrupt and deliver the point now.", correct: true },
      { id: "c", text: "Argue with them publicly.", correct: false },
    ],
    explanation:
      "A light pattern interrupt plus an immediate value hit reclaims the room. Fighting the heckler makes them the main character.",
    rewardUpgrade: "betterHumor",
  },
  {
    id: "team-missed",
    discipline: "leadership",
    speaker: "Team member",
    prompt: "I missed the deadline. Everyone’s already upset.",
    choices: [
      { id: "a", text: "Lecture them on accountability.", correct: false },
      { id: "b", text: "Listen first, then co-create the recovery plan.", correct: true },
      { id: "c", text: "Reassign the work without discussion.", correct: false },
    ],
    explanation:
      "Listening before fixing preserves dignity and surfaces root causes. Shared recovery plans rebuild ownership better than lectures.",
    rewardUpgrade: "strongerRapport",
  },
  {
    id: "conflict-blame",
    discipline: "conflictResolution",
    speaker: "Colleague",
    prompt: "This failed because of your team.",
    choices: [
      { id: "a", text: "Defend your team point by point.", correct: false },
      { id: "b", text: "Mirror their concern and reframe toward shared goals.", correct: true },
      { id: "c", text: "Blame another department.", correct: false },
    ],
    explanation:
      "Mirroring shows you heard them. Reframing to shared goals moves the conversation from blame to problem-solving.",
    rewardUpgrade: "fasterListening",
  },
  {
    id: "coach-stuck",
    discipline: "coaching",
    speaker: "Coachee",
    prompt: "I just don’t know what to do anymore.",
    choices: [
      { id: "a", text: "Give them your best three tips.", correct: false },
      { id: "b", text: "Ask an open question that expands their options.", correct: true },
      { id: "c", text: "Tell them to toughen up.", correct: false },
    ],
    explanation:
      "Coaching multiplies their agency. Open questions help them generate options they will actually own.",
    rewardUpgrade: "charismaMultiplier",
  },
  {
    id: "consult-scope",
    discipline: "consulting",
    speaker: "Client",
    prompt: "Just fix everything. We need miracles by Friday.",
    choices: [
      { id: "a", text: "Promise the miracle.", correct: false },
      { id: "b", text: "Reframe into prioritized outcomes and a realistic path.", correct: true },
      { id: "c", text: "List every limitation coldly.", correct: false },
    ],
    explanation:
      "Reframing chaos into prioritized outcomes protects trust. Clarity beats heroics that will miss the mark.",
    rewardUpgrade: "betterStorytelling",
  },
  {
    id: "dating-quiet",
    discipline: "dating",
    speaker: "Date",
    prompt: "…",
    choices: [
      { id: "a", text: "Fill silence with your life story.", correct: false },
      { id: "b", text: "Use light humor and an open question about them.", correct: true },
      { id: "c", text: "Check your phone.", correct: false },
    ],
    explanation:
      "Warm humor lowers pressure; curiosity invites them in. Monologues and phones both kill presence.",
    rewardUpgrade: "betterHumor",
  },
  {
    id: "manager-pushback",
    discipline: "management",
    speaker: "Direct report",
    prompt: "I disagree with this direction.",
    choices: [
      { id: "a", text: "Shut it down—decisions are final.", correct: false },
      { id: "b", text: "Summarize their view, then share the why and invite input.", correct: true },
      { id: "c", text: "Agree to everything to keep peace.", correct: false },
    ],
    explanation:
      "Summarizing proves respect. Explaining the why and inviting input builds buy-in without abandoning the decision.",
    rewardUpgrade: "increasedAuthority",
  },
  {
    id: "media-gotcha",
    discipline: "publicSpeaking",
    speaker: "Reporter",
    prompt: "Isn’t this just a PR stunt?",
    choices: [
      { id: "a", text: "Get defensive and list credentials.", correct: false },
      { id: "b", text: "Acknowledge the concern, reframe, and land one clear proof point.", correct: true },
      { id: "c", text: "Attack the premise angrily.", correct: false },
    ],
    explanation:
      "Acknowledgment + reframe + proof turns a gotcha into a message. Defense and anger both become the headline.",
    rewardUpgrade: "charismaMultiplier",
  },
];
