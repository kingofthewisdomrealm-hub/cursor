"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PoseIcon } from "@/components/ui/PoseIcon";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { loadState, savePracticeResult } from "@/lib/storage";
import { formatDuration, moodLabel, cn } from "@/lib/utils";
import type {
  DifficultyRating,
  Mood,
  PracticeResult,
  YogaRoutine,
} from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react";

const AFTER_MOODS: Mood[] = [
  "calm",
  "balanced",
  "motivated",
  "tired",
  "anxious",
  "frustrated",
];

export default function PracticePage() {
  const router = useRouter();
  const [routine, setRoutine] = useState<YogaRoutine | null>(null);
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [paused, setPaused] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [phase, setPhase] = useState<"practice" | "feedback" | "done">("practice");
  const [moodAfter, setMoodAfter] = useState<Mood>("calm");
  const [difficulty, setDifficulty] = useState<DifficultyRating>("balanced");
  const [wouldRepeat, setWouldRepeat] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cuedRef = useRef(false);

  useEffect(() => {
    const s = loadState();
    if (!s.currentRoutine) {
      router.replace("/check-in");
      return;
    }
    setRoutine(s.currentRoutine);
    setRemaining(s.currentRoutine.poses[0]?.holdSeconds ?? 0);
  }, [router]);

  const speak = useCallback(
    (text: string) => {
      if (!audioOn || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    },
    [audioOn]
  );

  const goToPose = useCallback(
    (nextIndex: number) => {
      if (!routine) return;
      if (nextIndex < 0) return;
      if (nextIndex >= routine.poses.length) {
        setPhase("feedback");
        speak("Practice complete. How do you feel now?");
        return;
      }
      setIndex(nextIndex);
      setRemaining(routine.poses[nextIndex].holdSeconds);
      cuedRef.current = false;
      setPaused(false);
    },
    [routine, speak]
  );

  useEffect(() => {
    if (!routine || phase !== "practice" || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const pose = routine.poses[index];
    if (!cuedRef.current) {
      speak(`${pose.name}. ${pose.instructions.split(".")[0]}.`);
      cuedRef.current = true;
    }

    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => goToPose(index + 1), 100);
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [routine, index, paused, phase, speak, goToPose]);

  function submitFeedback() {
    const state = loadState();
    if (!routine || !state.user) return;
    const checkIn = state.currentCheckIn;
    const result: PracticeResult = {
      id: uuidv4(),
      userId: state.user.id,
      routineId: routine.id,
      routineTitle: routine.title,
      moodBefore: checkIn?.mood ?? "balanced",
      moodAfter,
      energyBefore: checkIn?.energyScore ?? 5,
      energyAfter: Math.min(
        10,
        Math.max(
          1,
          (checkIn?.energyScore ?? 5) +
            (moodAfter === "motivated" || moodAfter === "balanced" ? 2 : moodAfter === "tired" ? -1 : 1)
        )
      ),
      stressBefore: checkIn?.stressScore ?? 5,
      stressAfter: Math.min(
        10,
        Math.max(
          1,
          (checkIn?.stressScore ?? 5) -
            (moodAfter === "calm" || moodAfter === "balanced" ? 2 : 0)
        )
      ),
      difficultyRating: difficulty,
      wouldRepeat,
      durationMinutes: routine.duration,
      completedAt: new Date().toISOString(),
    };
    savePracticeResult(result);
    setPhase("done");
  }

  if (!routine) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-soft">
        Loading practice…
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center animate-fade-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kapha-soft text-kapha">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
          Beautiful practice
        </h1>
        <p className="mt-2 text-ink-soft">
          Your progress has been saved. Come back tomorrow for another check-in.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <Button href="/progress" size="lg" className="w-full">
            View progress
          </Button>
          <Button href="/" variant="outline" size="lg" className="w-full">
            Home
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "feedback") {
    return (
      <div className="mx-auto min-h-screen max-w-lg px-4 py-10 animate-fade-up">
        <h1 className="font-display text-3xl font-semibold text-ink">
          How do you feel now?
        </h1>
        <p className="mt-2 text-ink-soft">
          Your reflection helps refine future recommendations.
        </p>

        <div className="mt-8 space-y-6">
          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">Mood after practice</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AFTER_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoodAfter(m)}
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm capitalize transition-all",
                    moodAfter === m
                      ? "bg-leaf text-white"
                      : "bg-sand-deep text-ink-soft"
                  )}
                >
                  {moodLabel(m)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">
              Was the routine too easy, balanced, or too difficult?
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ["too_easy", "Too easy"],
                  ["balanced", "Balanced"],
                  ["too_difficult", "Too hard"],
                ] as [DifficultyRating, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDifficulty(val)}
                  className={cn(
                    "rounded-2xl px-2 py-2.5 text-sm transition-all",
                    difficulty === val
                      ? "bg-leaf text-white"
                      : "bg-sand-deep text-ink-soft"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white/60 p-5">
            <p className="text-sm font-medium text-ink">
              Would you repeat this routine?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setWouldRepeat(val)}
                  className={cn(
                    "rounded-2xl px-3 py-2.5 text-sm transition-all",
                    wouldRepeat === val
                      ? "bg-leaf text-white"
                      : "bg-sand-deep text-ink-soft"
                  )}
                >
                  {val ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button size="lg" className="mt-8 w-full" onClick={submitFeedback}>
          Save & finish
        </Button>
      </div>
    );
  }

  const pose = routine.poses[index];
  const nextPose = routine.poses[index + 1];
  const progress = ((index + 1) / routine.poses.length) * 100;
  const poseProgress =
    pose.holdSeconds > 0
      ? ((pose.holdSeconds - remaining) / pose.holdSeconds) * 100
      : 100;

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-8 pt-6">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/routine")}
          className="text-sm text-ink-soft hover:text-ink"
        >
          Exit
        </button>
        <p className="text-xs font-medium text-ink-soft">
          {index + 1} / {routine.poses.length}
        </p>
        <button
          type="button"
          onClick={() => setAudioOn((v) => !v)}
          className="rounded-xl bg-sand-deep p-2 text-ink-soft"
          aria-label="Toggle audio cues"
        >
          {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      <ProgressBar value={progress} className="mt-4" barClassName="bg-leaf" />

      <div className="mt-8 flex flex-1 flex-col items-center text-center animate-scale-in" key={pose.id + index}>
        <PoseIcon
          image={pose.image}
          dosha={routine.targetDosha}
          className="h-24 w-24 rounded-3xl"
        />
        <p className="mt-5 text-xs uppercase tracking-wider text-ink-soft">
          {pose.category.replace("_", " ")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
          {pose.name}
        </h1>
        <p className="text-sm italic text-ink-soft">{pose.sanskritName}</p>

        <div className="mt-8 flex h-28 w-28 items-center justify-center rounded-full border-4 border-leaf/30 bg-white/50">
          <span className="font-display text-3xl font-semibold text-ink tabular-nums">
            {formatDuration(remaining)}
          </span>
        </div>
        <div className="mt-4 w-48">
          <ProgressBar value={poseProgress} barClassName="bg-vata" />
        </div>

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-soft">
          {pose.instructions}
        </p>
        {pose.notes && (
          <p className="mt-2 text-xs font-medium text-leaf-deep">{pose.notes}</p>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Beginner tip: {pose.beginnerModification}
        </p>
      </div>

      {nextPose && (
        <div className="mt-4 rounded-2xl bg-white/50 px-4 py-3 text-left">
          <p className="text-[11px] uppercase tracking-wider text-ink-soft">
            Up next
          </p>
          <p className="text-sm font-medium text-ink">{nextPose.name}</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => goToPose(index - 1)}
          disabled={index === 0}
          className="rounded-2xl bg-sand-deep p-3.5 text-ink disabled:opacity-40"
          aria-label="Previous pose"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="rounded-2xl bg-leaf p-4 text-white shadow-sm"
          aria-label={paused ? "Resume" : "Pause"}
        >
          {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </button>
        <button
          type="button"
          onClick={() => goToPose(index + 1)}
          className="rounded-2xl bg-sand-deep p-3.5 text-ink"
          aria-label="Skip pose"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
