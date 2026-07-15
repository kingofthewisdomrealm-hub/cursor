"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { generateRoutine } from "@/lib/routine-generator";
import { loadState, saveCheckIn, saveRoutine } from "@/lib/storage";
import { outcomeLabel, todayISO, cn } from "@/lib/utils";
import type {
  BodyCondition,
  DailyCheckIn,
  DesiredOutcome,
  ExperienceLevel,
  Mood,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import { ArrowRight, Moon, Battery, Brain, Heart } from "lucide-react";

const MOODS: Mood[] = [
  "calm",
  "anxious",
  "frustrated",
  "tired",
  "motivated",
  "heavy",
  "balanced",
  "overstimulated",
];

const BODIES: BodyCondition[] = [
  "normal",
  "sore",
  "tight",
  "open",
  "fatigued",
  "energized",
  "injured",
];

const OUTCOMES: DesiredOutcome[] = [
  "reduce_stress",
  "increase_energy",
  "improve_sleep",
  "improve_flexibility",
  "improve_focus",
  "ground_nervous_system",
  "cool_the_body",
  "build_strength",
];

const TIMES = [5, 10, 20, 30, 45];

export default function CheckInPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sleepScore, setSleepScore] = useState(6);
  const [energyScore, setEnergyScore] = useState(5);
  const [stressScore, setStressScore] = useState(5);
  const [mood, setMood] = useState<Mood>("balanced");
  const [bodyCondition, setBodyCondition] = useState<BodyCondition>("normal");
  const [desiredOutcome, setDesiredOutcome] =
    useState<DesiredOutcome>("reduce_stress");
  const [availableMinutes, setAvailableMinutes] = useState(20);
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const s = loadState();
    if (!s.doshaResult?.primary) {
      router.replace("/quiz");
      return;
    }
    setExperience(s.user?.experienceLevel ?? "beginner");
    setAvailableMinutes(s.user?.preferredRoutineLength ?? 20);

    // Smart defaults from dosha
    if (s.doshaResult.primary === "vata") {
      setDesiredOutcome("ground_nervous_system");
    } else if (s.doshaResult.primary === "pitta") {
      setDesiredOutcome("cool_the_body");
    } else {
      setDesiredOutcome("increase_energy");
    }
    setReady(true);
  }, [router]);

  function submit() {
    const state = loadState();
    if (!state.doshaResult || !state.user) return;
    setSubmitting(true);

    const checkIn: DailyCheckIn = {
      id: uuidv4(),
      userId: state.user.id,
      date: todayISO(),
      sleepScore,
      energyScore,
      stressScore,
      mood,
      bodyCondition,
      desiredOutcome,
      availableMinutes,
      experienceLevel: experience,
    };

    saveCheckIn(checkIn);
    const routine = generateRoutine({
      userId: state.user.id,
      primary: state.doshaResult.primary,
      secondary: state.doshaResult.secondary,
      checkIn,
      experienceLevel: experience,
    });
    saveRoutine(routine);
    router.push("/routine");
  }

  if (!ready) {
    return (
      <AppShell>
        <div className="flex min-h-[50vh] items-center justify-center text-ink-soft">
          Preparing check-in…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="py-8 animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-wider text-leaf">
          Daily check-in
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          How are you today?
        </h1>
        <p className="mt-2 text-ink-soft">
          Your answers shape today’s routine—beyond your baseline dosha.
        </p>

        <div className="mt-8 space-y-6">
          <SliderCard
            icon={<Moon className="h-4 w-4" />}
            label="How did you sleep?"
            value={sleepScore}
            onChange={setSleepScore}
            low="Poor"
            high="Great"
          />
          <SliderCard
            icon={<Battery className="h-4 w-4" />}
            label="What is your energy level?"
            value={energyScore}
            onChange={setEnergyScore}
            low="Depleted"
            high="Vibrant"
          />
          <SliderCard
            icon={<Brain className="h-4 w-4" />}
            label="What is your stress level?"
            value={stressScore}
            onChange={setStressScore}
            low="Calm"
            high="Overwhelmed"
          />

          <SelectGroup
            icon={<Heart className="h-4 w-4" />}
            label="What is your mood?"
            options={MOODS}
            value={mood}
            onChange={setMood}
            format={(v) => v.replace("_", " ")}
          />

          <SelectGroup
            label="How does your body feel?"
            options={BODIES}
            value={bodyCondition}
            onChange={setBodyCondition}
            format={(v) => v}
          />

          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">How much time do you have?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAvailableMinutes(t)}
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm font-medium transition-all",
                    availableMinutes === t
                      ? "bg-leaf text-white"
                      : "bg-sand-deep text-ink-soft hover:bg-mist"
                  )}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">What do you need most today?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setDesiredOutcome(o)}
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm transition-all",
                    desiredOutcome === o
                      ? "bg-leaf text-white"
                      : "bg-sand-deep text-ink-soft hover:bg-mist"
                  )}
                >
                  {outcomeLabel(o)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">Experience for today’s practice</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["beginner", "intermediate", "advanced"] as ExperienceLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperience(level)}
                    className={cn(
                      "rounded-2xl px-3 py-2.5 text-sm capitalize transition-all",
                      experience === level
                        ? "bg-leaf text-white"
                        : "bg-sand-deep text-ink-soft hover:bg-mist"
                    )}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={submit}
          disabled={submitting}
        >
          {submitting ? "Creating routine…" : "Generate my routine"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </AppShell>
  );
}

function SliderCard({
  icon,
  label,
  value,
  onChange,
  low,
  high,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (n: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div className="rounded-3xl bg-white/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="text-leaf">{icon}</span>
          {label}
        </div>
        <span className="rounded-full bg-sand-deep px-2.5 py-1 text-sm font-semibold text-ink">
          {value}/10
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-4 w-full accent-leaf"
      />
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function SelectGroup<T extends string>({
  icon,
  label,
  options,
  value,
  onChange,
  format,
}: {
  icon?: React.ReactNode;
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <div className="rounded-3xl bg-white/60 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        {icon && <span className="text-leaf">{icon}</span>}
        {label}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              "rounded-2xl px-3.5 py-2 text-sm capitalize transition-all",
              value === opt
                ? "bg-leaf text-white"
                : "bg-sand-deep text-ink-soft hover:bg-mist"
            )}
          >
            {format(opt)}
          </button>
        ))}
      </div>
    </div>
  );
}
