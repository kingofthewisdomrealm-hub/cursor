import { YOGA_POSES } from "@/data/yoga-poses";
import type {
  DailyCheckIn,
  DesiredOutcome,
  DoshaType,
  ExperienceLevel,
  RoutinePose,
  YogaPose,
  YogaRoutine,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

const OUTCOME_TAGS: Record<DesiredOutcome, string[]> = {
  reduce_stress: ["calming", "stress", "grounding"],
  increase_energy: ["energizing", "strengthening", "heat"],
  improve_sleep: ["sleep", "calming", "grounding"],
  improve_flexibility: ["flexibility", "hips"],
  improve_focus: ["focus", "grounding"],
  ground_nervous_system: ["grounding", "calming", "anxiety"],
  cool_the_body: ["cooling", "calming"],
  build_strength: ["strengthening", "energizing", "core", "heat"],
};

const DOSHA_PRIORITY_TAGS: Record<DoshaType, string[]> = {
  vata: ["grounding", "calming", "stability", "anxiety"],
  pitta: ["cooling", "calming", "hips"],
  kapha: ["energizing", "strengthening", "heat"],
};

const DOSHA_AVOID_TAGS: Record<DoshaType, string[]> = {
  vata: ["heat"],
  pitta: ["heat"],
  kapha: ["sleep"],
};

function difficultyRank(level: ExperienceLevel): number {
  return level === "beginner" ? 1 : level === "intermediate" ? 2 : 3;
}

function scorePose(
  pose: YogaPose,
  primary: DoshaType,
  secondary: DoshaType,
  checkIn: DailyCheckIn,
  experience: ExperienceLevel
): number {
  let score = 0;

  if (pose.doshaTags.includes(primary)) score += 6;
  if (pose.doshaTags.includes(secondary)) score += 3;

  for (const tag of DOSHA_PRIORITY_TAGS[primary]) {
    if (pose.benefitTags.includes(tag)) score += 4;
  }

  for (const tag of OUTCOME_TAGS[checkIn.desiredOutcome]) {
    if (pose.benefitTags.includes(tag)) score += 5;
  }

  if (checkIn.stressScore >= 7 && pose.benefitTags.some((t) => ["calming", "grounding", "cooling"].includes(t))) {
    score += 4;
  }
  if (checkIn.energyScore <= 4 && primary === "kapha" && pose.benefitTags.includes("energizing")) {
    score += 5;
  }
  if (checkIn.energyScore <= 4 && primary === "vata" && pose.benefitTags.includes("grounding")) {
    score += 5;
  }
  if (checkIn.sleepScore <= 4 && pose.benefitTags.includes("sleep")) {
    score += 4;
  }
  if (
    (checkIn.mood === "anxious" || checkIn.mood === "overstimulated") &&
    pose.benefitTags.some((t) => ["calming", "grounding", "anxiety"].includes(t))
  ) {
    score += 5;
  }
  if (
    (checkIn.mood === "frustrated" || checkIn.mood === "overstimulated") &&
    primary === "pitta" &&
    pose.benefitTags.includes("cooling")
  ) {
    score += 5;
  }
  if (
    (checkIn.mood === "heavy" || checkIn.mood === "tired") &&
    primary === "kapha" &&
    pose.benefitTags.includes("energizing")
  ) {
    score += 5;
  }

  for (const avoid of DOSHA_AVOID_TAGS[primary]) {
    if (pose.benefitTags.includes(avoid) && checkIn.stressScore >= 6) score -= 3;
  }

  if (difficultyRank(pose.difficulty) > difficultyRank(experience)) {
    score -= 4;
  } else if (pose.difficulty === experience) {
    score += 1;
  }

  if (
    checkIn.bodyCondition === "injured" &&
    pose.contraindications.length > 0
  ) {
    score -= 8;
  }
  if (checkIn.bodyCondition === "sore" && pose.benefitTags.includes("strengthening")) {
    score -= 2;
  }
  if (checkIn.bodyCondition === "fatigued" && pose.benefitTags.includes("energizing") && primary === "vata") {
    score -= 3;
  }

  return score;
}

function pickBest(
  candidates: YogaPose[],
  used: Set<string>,
  count: number
): YogaPose[] {
  return candidates
    .filter((p) => !used.has(p.id))
    .slice(0, count);
}

function toRoutinePose(pose: YogaPose, holdSeconds: number, notes?: string): RoutinePose {
  return {
    ...pose,
    holdSeconds,
    reps: pose.repetitions,
    notes,
  };
}

function titleFor(
  primary: DoshaType,
  minutes: number,
  checkIn: DailyCheckIn
): { title: string; focus: string } {
  if (primary === "vata" && (checkIn.stressScore >= 7 || checkIn.sleepScore <= 4 || checkIn.mood === "anxious")) {
    return {
      title: `${minutes}-Minute Emergency Grounding Routine`,
      focus: "Slow, stable, calm, and grounding.",
    };
  }
  if (primary === "pitta" && (checkIn.stressScore >= 7 || checkIn.mood === "frustrated")) {
    return {
      title: `Cooling Pitta Flow (${minutes} min)`,
      focus: "Cooling, releasing pressure, and reducing intensity.",
    };
  }
  if (primary === "kapha" && (checkIn.energyScore <= 4 || checkIn.mood === "heavy" || checkIn.mood === "tired")) {
    return {
      title: `Energizing Kapha Flow (${minutes} min)`,
      focus: "Activation, strength, momentum, and heat.",
    };
  }

  const names: Record<DoshaType, string> = {
    vata: "Grounding Vata Flow",
    pitta: "Cooling Pitta Flow",
    kapha: "Energizing Kapha Flow",
  };
  const focuses: Record<DoshaType, string> = {
    vata: "Slow, stable, calm, and grounding.",
    pitta: "Cooling, releasing pressure, and reducing intensity.",
    kapha: "Activation, strength, momentum, and heat.",
  };
  return { title: `${names[primary]} · ${minutes} min`, focus: focuses[primary] };
}

function holdMultiplier(primary: DoshaType, checkIn: DailyCheckIn): number {
  if (primary === "vata") return checkIn.stressScore >= 7 ? 1.35 : 1.2;
  if (primary === "pitta") return 1.1;
  if (primary === "kapha") return checkIn.energyScore <= 4 ? 0.75 : 0.85;
  return 1;
}

function allocateBudget(totalSeconds: number) {
  // Approximate section budgets
  return {
    arrival: Math.round(totalSeconds * 0.08),
    breathwork: Math.round(totalSeconds * 0.1),
    warmup: Math.round(totalSeconds * 0.18),
    main: Math.round(totalSeconds * 0.42),
    cooldown: Math.round(totalSeconds * 0.12),
    relaxation: Math.round(totalSeconds * 0.08),
    reflection: Math.round(totalSeconds * 0.02),
  };
}

export function generateRoutine(params: {
  userId: string;
  primary: DoshaType;
  secondary: DoshaType;
  checkIn: DailyCheckIn;
  experienceLevel: ExperienceLevel;
}): YogaRoutine {
  const { userId, primary, secondary, checkIn, experienceLevel } = params;
  const minutes = checkIn.availableMinutes;
  const totalSeconds = minutes * 60;
  const mult = holdMultiplier(primary, checkIn);
  const budget = allocateBudget(totalSeconds);

  const scored = YOGA_POSES.map((pose) => ({
    pose,
    score: scorePose(pose, primary, secondary, checkIn, experienceLevel),
  })).sort((a, b) => b.score - a.score);

  const byCategory = (categories: YogaPose["category"][]) =>
    scored
      .filter((s) => categories.includes(s.pose.category))
      .map((s) => s.pose);

  const used = new Set<string>();
  const sequence: RoutinePose[] = [];

  const arrivalPool = byCategory(["arrival"]);
  const breathPool = byCategory(["breathwork"]);
  const warmupPool = byCategory(["warmup"]);
  const mainPool = byCategory([
    "standing",
    "balance",
    "hip",
    "twist",
    "forward_fold",
    "core",
    "backbend",
    "seated",
  ]);
  const cooldownPool = byCategory(["cooldown", "twist", "forward_fold", "hip", "inversion"]);
  const relaxPool = byCategory(["relaxation", "inversion"]);
  const reflectPool = byCategory(["reflection"]);

  // Arrival
  const arrival = pickBest(arrivalPool, used, 1)[0] ?? YOGA_POSES[0];
  used.add(arrival.id);
  sequence.push(toRoutinePose(arrival, Math.max(30, Math.round(budget.arrival * mult))));

  // Breathwork — prefer dosha-aligned
  let breath =
    breathPool.find((p) => p.doshaTags.includes(primary) && !used.has(p.id)) ??
    pickBest(breathPool, used, 1)[0];
  if (primary === "pitta") {
    breath = breathPool.find((p) => p.id === "sheetali" || p.id === "relaxed-breathing") ?? breath;
  }
  if (primary === "kapha") {
    breath = breathPool.find((p) => p.id === "kapalabhati" || p.benefitTags.includes("energizing")) ?? breath;
  }
  if (primary === "vata") {
    breath = breathPool.find((p) => p.id === "nadi-shodhana" || p.benefitTags.includes("calming")) ?? breath;
  }
  if (breath) {
    used.add(breath.id);
    sequence.push(toRoutinePose(breath, Math.max(45, Math.round(budget.breathwork * mult))));
  }

  // Warmup
  const warmupCount = minutes >= 20 ? 2 : 1;
  let warmups = pickBest(warmupPool, used, warmupCount);

  if (primary === "kapha") {
    const fast = warmupPool.find((p) => p.id === "sun-salutation-fast" || p.id === "dynamic-cat-cow");
    if (fast && !used.has(fast.id)) warmups = [fast, ...warmups.filter((w) => w.id !== fast.id)].slice(0, warmupCount);
  }
  if (primary === "pitta") {
    const moon = warmupPool.find((p) => p.id === "moon-salutation");
    if (moon && !used.has(moon.id) && minutes >= 15) {
      warmups = [moon, ...warmups.filter((w) => w.id !== moon.id)].slice(0, warmupCount);
    }
  }
  if (primary === "vata") {
    const slow = warmupPool.find((p) => p.id === "sun-salutation-slow" || p.id === "cat-cow");
    if (slow && !used.has(slow.id)) {
      warmups = [slow, ...warmups.filter((w) => w.id !== slow.id)].slice(0, warmupCount);
    }
  }

  const warmupHold = Math.max(30, Math.round((budget.warmup / Math.max(warmups.length, 1)) * mult));
  for (const w of warmups) {
    used.add(w.id);
    sequence.push(toRoutinePose(w, warmupHold));
  }

  // Main sequence — fill remaining time budget
  const mainCount =
    minutes <= 5 ? 2 : minutes <= 10 ? 3 : minutes <= 20 ? 4 : minutes <= 30 ? 5 : 6;

  let mains = pickBest(mainPool, used, mainCount);

  // Dosha-specific main pose preferences
  if (primary === "vata") {
    const preferred = ["warrior-ii", "tree-pose", "seated-forward-fold", "low-lunge", "standing-forward-fold"];
    mains = [
      ...preferred.map((id) => mainPool.find((p) => p.id === id)).filter(Boolean) as YogaPose[],
      ...mains,
    ]
      .filter((p, i, arr) => !used.has(p.id) && arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, mainCount);
  }
  if (primary === "pitta") {
    const preferred = ["low-lunge", "triangle", "gentle-twist", "pigeon-pose", "seated-forward-fold", "sphinx"];
    mains = [
      ...preferred.map((id) => mainPool.find((p) => p.id === id)).filter(Boolean) as YogaPose[],
      ...mains,
    ]
      .filter((p, i, arr) => !used.has(p.id) && arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, mainCount);
  }
  if (primary === "kapha") {
    const preferred = ["chair-pose", "warrior-i", "warrior-iii", "plank", "boat-pose", "bridge-pose", "goddess"];
    mains = [
      ...preferred.map((id) => mainPool.find((p) => p.id === id)).filter(Boolean) as YogaPose[],
      ...mains,
    ]
      .filter((p, i, arr) => !used.has(p.id) && arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, mainCount);
  }

  const mainHold = Math.max(20, Math.round((budget.main / Math.max(mains.length, 1)) * mult));
  for (const m of mains) {
    used.add(m.id);
    const bilateral = ["warrior-i", "warrior-ii", "warrior-iii", "tree-pose", "low-lunge", "triangle", "pigeon-pose", "gentle-twist"].includes(m.id);
    sequence.push(
      toRoutinePose(
        m,
        bilateral ? Math.round(mainHold * 0.7) : mainHold,
        bilateral ? "Practice both sides." : undefined
      )
    );
  }

  // Cooldown
  const cooldownCount = minutes >= 20 ? 2 : 1;
  let cooldowns = pickBest(
    cooldownPool.filter((p) => !["childs-pose"].includes(p.id) || primary !== "kapha"),
    used,
    cooldownCount
  );
  if (primary === "vata") {
    const legs = cooldownPool.find((p) => p.id === "legs-up-wall" || p.id === "supine-twist");
    if (legs && !used.has(legs.id) && minutes >= 10) {
      cooldowns = [legs, ...cooldowns.filter((c) => c.id !== legs.id)].slice(0, cooldownCount);
    }
  }
  const coolHold = Math.max(30, Math.round((budget.cooldown / Math.max(cooldowns.length, 1)) * mult));
  for (const c of cooldowns) {
    used.add(c.id);
    sequence.push(toRoutinePose(c, coolHold, c.id.includes("twist") || c.id.includes("pigeon") ? "Practice both sides." : undefined));
  }

  // Relaxation
  const relax =
    primary === "kapha"
      ? relaxPool.find((p) => p.id === "short-savasana") ?? relaxPool[0]
      : relaxPool.find((p) => p.id === "savasana" || p.id === "legs-up-wall") ?? relaxPool[0];
  if (relax && !used.has(relax.id)) {
    used.add(relax.id);
    const relaxHold =
      primary === "kapha"
        ? Math.max(40, Math.round(budget.relaxation * 0.7))
        : Math.max(60, Math.round(budget.relaxation * mult));
    sequence.push(toRoutinePose(relax, relaxHold));
  }

  // Reflection
  const reflect = pickBest(reflectPool, used, 1)[0];
  if (reflect) {
    used.add(reflect.id);
    sequence.push(toRoutinePose(reflect, Math.max(30, budget.reflection)));
  }

  // Normalize total duration roughly to selected minutes
  const actual = sequence.reduce((sum, p) => sum + p.holdSeconds, 0);
  if (actual > 0 && Math.abs(actual - totalSeconds) > 30) {
    const scale = totalSeconds / actual;
    for (const pose of sequence) {
      pose.holdSeconds = Math.max(15, Math.round(pose.holdSeconds * scale));
    }
  }

  const { title, focus } = titleFor(primary, minutes, checkIn);
  const duration = Math.round(sequence.reduce((s, p) => s + p.holdSeconds, 0) / 60);

  return {
    id: uuidv4(),
    title,
    userId,
    duration: Math.max(1, duration),
    difficulty: experienceLevel,
    targetDosha: primary,
    targetOutcome: checkIn.desiredOutcome,
    focus,
    poses: sequence,
    createdAt: new Date().toISOString(),
    completed: false,
  };
}
