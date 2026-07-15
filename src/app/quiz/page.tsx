"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { QUIZ_QUESTIONS } from "@/data/quiz-questions";
import { calculateDoshaResult } from "@/lib/dosha-calculator";
import { saveQuizResult } from "@/lib/storage";
import type { ExperienceLevel, QuizAnswer } from "@/types";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [experience, setExperience] = useState<ExperienceLevel>("beginner");
  const [phase, setPhase] = useState<"intro" | "quiz" | "submitting">("intro");

  const question = QUIZ_QUESTIONS[step];
  const total = QUIZ_QUESTIONS.length;
  const progress = ((step + (answers[question?.id] ? 1 : 0)) / total) * 100;
  const selected = question ? answers[question.id]?.selectedAnswer : undefined;

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  function selectOption(optionId: string) {
    const option = question.options.find((o) => o.id === optionId);
    if (!option) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        userId: "demo-user",
        questionId: question.id,
        selectedAnswer: option.id,
        doshaType: option.doshaType,
        points: option.points,
      },
    }));
  }

  function next() {
    if (step < total - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function finish() {
    if (answeredCount < total) return;
    setPhase("submitting");
    const list = QUIZ_QUESTIONS.map((q) => answers[q.id]).filter(Boolean);
    const result = calculateDoshaResult(list);
    saveQuizResult(list, result, experience);
    setTimeout(() => router.push("/results"), 600);
  }

  if (phase === "intro") {
    return (
      <AppShell>
        <div className="py-10 animate-fade-up">
          <p className="text-sm font-medium uppercase tracking-wider text-leaf">
            Dosha assessment
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            20 questions to reveal your constitution
          </h1>
          <p className="mt-3 text-ink-soft">
            Answer honestly based on your lifelong tendencies—not how you feel
            today. There are no wrong answers.
          </p>

          <div className="mt-8 rounded-3xl bg-white/60 p-5">
            <label className="text-sm font-medium text-ink">
              Yoga experience level
            </label>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(["beginner", "intermediate", "advanced"] as ExperienceLevel[]).map(
                (level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setExperience(level)}
                    className={cn(
                      "rounded-2xl px-3 py-3 text-sm capitalize transition-all",
                      experience === level
                        ? "bg-leaf text-white shadow-sm"
                        : "bg-sand-deep text-ink-soft hover:bg-mist"
                    )}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
          </div>

          <Button
            size="lg"
            className="mt-8 w-full"
            onClick={() => setPhase("quiz")}
          >
            Start quiz
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </AppShell>
    );
  }

  if (phase === "submitting") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
          <div className="h-14 w-14 animate-breathe rounded-full bg-leaf/20" />
          <p className="mt-6 font-display text-xl text-ink">
            Calculating your dosha balance…
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="py-6">
        <ProgressBar value={((step + 1) / total) * 100} className="mb-2" />
        <div className="mb-6 flex items-center justify-between text-xs text-ink-soft">
          <span>
            Question {step + 1} of {total}
          </span>
          <span className="rounded-full bg-sand-deep px-2.5 py-1">
            {question.category}
          </span>
        </div>

        <div key={question.id} className="animate-fade-up">
          <h1 className="font-display text-2xl font-semibold leading-snug text-ink">
            {question.question}
          </h1>

          <div className="mt-6 space-y-3">
            {question.options.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(option.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition-all",
                    isSelected
                      ? "border-leaf bg-leaf/10 shadow-sm"
                      : "border-transparent bg-white/60 hover:bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-leaf bg-leaf text-white"
                        : "border-ink/20"
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="text-sm leading-relaxed text-ink sm:text-base">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            onClick={back}
            disabled={step === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={next}
            disabled={!selected}
            className="flex-[1.4]"
          >
            {step === total - 1 ? "See results" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* unused var guard — progress available for subtle UI */}
        <span className="sr-only">{Math.round(progress)}%</span>
      </div>
    </AppShell>
  );
}
