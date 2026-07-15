export type DoshaType = "vata" | "pitta" | "kapha";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type DesiredOutcome =
  | "reduce_stress"
  | "increase_energy"
  | "improve_sleep"
  | "improve_flexibility"
  | "improve_focus"
  | "ground_nervous_system"
  | "cool_the_body"
  | "build_strength";

export type Mood =
  | "calm"
  | "anxious"
  | "frustrated"
  | "tired"
  | "motivated"
  | "heavy"
  | "balanced"
  | "overstimulated";

export type BodyCondition =
  | "sore"
  | "tight"
  | "open"
  | "fatigued"
  | "energized"
  | "injured"
  | "normal";

export type DifficultyRating = "too_easy" | "balanced" | "too_difficult";

export interface User {
  id: string;
  name: string;
  email: string;
  experienceLevel: ExperienceLevel;
  primaryDosha: DoshaType | null;
  secondaryDosha: DoshaType | null;
  vataPercentage: number;
  pittaPercentage: number;
  kaphaPercentage: number;
  physicalLimitations: string[];
  preferredRoutineLength: number;
  createdAt: string;
}

export interface QuizOption {
  id: string;
  label: string;
  doshaType: DoshaType;
  points: number;
}

export interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: QuizOption[];
}

export interface QuizAnswer {
  userId: string;
  questionId: string;
  selectedAnswer: string;
  doshaType: DoshaType;
  points: number;
}

export interface DoshaPercentages {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface DoshaResult {
  percentages: DoshaPercentages;
  primary: DoshaType;
  secondary: DoshaType;
  points: DoshaPercentages;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  sleepScore: number;
  energyScore: number;
  stressScore: number;
  mood: Mood;
  bodyCondition: BodyCondition;
  desiredOutcome: DesiredOutcome;
  availableMinutes: number;
  experienceLevel?: ExperienceLevel;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  instructions: string;
  image: string;
  difficulty: ExperienceLevel;
  duration: number;
  repetitions?: number;
  doshaTags: DoshaType[];
  benefitTags: string[];
  contraindications: string[];
  beginnerModification: string;
  category:
    | "arrival"
    | "breathwork"
    | "warmup"
    | "standing"
    | "seated"
    | "balance"
    | "core"
    | "hip"
    | "twist"
    | "forward_fold"
    | "backbend"
    | "inversion"
    | "cooldown"
    | "relaxation"
    | "reflection";
}

export interface RoutinePose extends YogaPose {
  holdSeconds: number;
  reps?: number;
  notes?: string;
}

export interface YogaRoutine {
  id: string;
  title: string;
  userId: string;
  duration: number;
  difficulty: ExperienceLevel;
  targetDosha: DoshaType;
  targetOutcome: DesiredOutcome;
  focus: string;
  poses: RoutinePose[];
  createdAt: string;
  completed: boolean;
}

export interface PracticeResult {
  id: string;
  userId: string;
  routineId: string;
  routineTitle: string;
  moodBefore: Mood;
  moodAfter: Mood;
  energyBefore: number;
  energyAfter: number;
  stressBefore: number;
  stressAfter: number;
  difficultyRating: DifficultyRating;
  wouldRepeat: boolean;
  durationMinutes: number;
  completedAt: string;
}

export interface AppState {
  user: User | null;
  quizAnswers: QuizAnswer[];
  doshaResult: DoshaResult | null;
  checkIns: DailyCheckIn[];
  currentCheckIn: DailyCheckIn | null;
  routines: YogaRoutine[];
  currentRoutine: YogaRoutine | null;
  practiceResults: PracticeResult[];
}
