"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useMission } from "@/hooks/useMission";
import { getLocalMission, updateLocalMission, updateLocalQuestions } from "@/lib/mission-store";

export default function ClarifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { mission, loading } = useMission(id);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <LoadingState />;
  }

  if (!mission) {
    return <NotFoundState />;
  }

  const questions = mission.questions;

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const updatedQuestions = questions.map((q) => ({
      ...q,
      answer: answers[q.id] ?? q.answer ?? "",
    }));

    const mission = getLocalMission(id);
    if (mission) {
      updateLocalQuestions(id, updatedQuestions);
      updateLocalMission(id, { status: "planning" });
    }

    const answerMap: Record<string, string> = {};
    updatedQuestions.forEach((q) => {
      if (q.answer) answerMap[q.question] = q.answer;
    });

    sessionStorage.setItem(
      `mission-${id}-answers`,
      JSON.stringify(answerMap)
    );

    router.push(`/mission/${id}/plan`);
  };

  const allRequiredAnswered = questions
    .filter((q) => q.required)
    .every((q) => (answers[q.id] ?? q.answer ?? "").trim());

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
          <HelpCircle className="h-3.5 w-3.5" />
          Step 2 — Clarify the Mission
        </div>
        <h1 className="text-2xl font-bold text-white">Quick questions</h1>
        <p className="mt-2 text-zinc-400">
          A few details so the agent can build a precise plan for:
        </p>
        <p className="mt-1 text-white font-medium">&ldquo;{mission.outcome_text}&rdquo;</p>
      </div>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5"
          >
            <label className="block text-sm font-semibold text-white mb-3">
              <span className="text-cyan-500 font-mono mr-2">{i + 1}.</span>
              {q.question}
              {q.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={answers[q.id] ?? q.answer ?? ""}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              placeholder="Your answer..."
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !allRequiredAnswered}
        className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4 font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:from-cyan-500 hover:to-cyan-400"
      >
        {submitting ? "Generating Plan..." : "Generate Mission Plan"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-zinc-400">Mission not found.</p>
      <Link href="/" className="text-cyan-400 hover:underline text-sm">
        Start a new mission
      </Link>
    </div>
  );
}
