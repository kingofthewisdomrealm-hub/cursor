import type {
  AppState,
  DailyCheckIn,
  DoshaResult,
  PracticeResult,
  QuizAnswer,
  User,
  YogaRoutine,
} from "@/types";

const STORAGE_KEY = "dosha-yoga-state-v1";

export const defaultUser = (): User => ({
  id: "demo-user",
  name: "Guest",
  email: "",
  experienceLevel: "beginner",
  primaryDosha: null,
  secondaryDosha: null,
  vataPercentage: 0,
  pittaPercentage: 0,
  kaphaPercentage: 0,
  physicalLimitations: [],
  preferredRoutineLength: 20,
  createdAt: new Date().toISOString(),
});

export const emptyState = (): AppState => ({
  user: null,
  quizAnswers: [],
  doshaResult: null,
  checkIns: [],
  currentCheckIn: null,
  routines: [],
  currentRoutine: null,
  practiceResults: [],
});

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) } as AppState;
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function saveQuizResult(
  answers: QuizAnswer[],
  result: DoshaResult,
  experienceLevel: User["experienceLevel"] = "beginner"
): AppState {
  const state = loadState();
  const user: User = {
    ...(state.user ?? defaultUser()),
    experienceLevel,
    primaryDosha: result.primary,
    secondaryDosha: result.secondary,
    vataPercentage: result.percentages.vata,
    pittaPercentage: result.percentages.pitta,
    kaphaPercentage: result.percentages.kapha,
  };
  const next = {
    ...state,
    user,
    quizAnswers: answers,
    doshaResult: result,
  };
  saveState(next);
  return next;
}

export function saveCheckIn(checkIn: DailyCheckIn): AppState {
  const state = loadState();
  const next = {
    ...state,
    currentCheckIn: checkIn,
    checkIns: [checkIn, ...state.checkIns.filter((c) => c.date !== checkIn.date)],
  };
  saveState(next);
  return next;
}

export function saveRoutine(routine: YogaRoutine): AppState {
  const state = loadState();
  const next = {
    ...state,
    currentRoutine: routine,
    routines: [routine, ...state.routines.filter((r) => r.id !== routine.id)],
  };
  saveState(next);
  return next;
}

export function markRoutineCompleted(routineId: string): AppState {
  const state = loadState();
  const routines = state.routines.map((r) =>
    r.id === routineId ? { ...r, completed: true } : r
  );
  const currentRoutine =
    state.currentRoutine?.id === routineId
      ? { ...state.currentRoutine, completed: true }
      : state.currentRoutine;
  const next = { ...state, routines, currentRoutine };
  saveState(next);
  return next;
}

export function savePracticeResult(result: PracticeResult): AppState {
  const state = markRoutineCompleted(result.routineId);
  const next = {
    ...state,
    practiceResults: [result, ...state.practiceResults],
  };
  saveState(next);
  return next;
}

export function updateUser(partial: Partial<User>): AppState {
  const state = loadState();
  const user = { ...(state.user ?? defaultUser()), ...partial };
  const next = { ...state, user };
  saveState(next);
  return next;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
