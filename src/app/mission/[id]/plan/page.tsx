"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  applyLocalPlan,
  getLocalMission,
} from "@/lib/mission-store";
import type { MissionPlan } from "@/types/mission";
import { CheckCircle2, Loader2, Target } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plan, setPlan] = useState<MissionPlan | null>(null);
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const generate = async () => {
      const mission = getLocalMission(id);
      if (!mission) {
        setError("Mission not found");
        return;
      }

      let answers: Record<string, string> = {};
      try {
        const stored = sessionStorage.getItem(`mission-${id}-answers`);
        if (stored) answers = JSON.parse(stored);
      } catch {
        // ignore
      }

      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outcome: mission.outcome_text,
            answers,
          }),
        });

        if (!res.ok) throw new Error("Plan generation failed");

        const data = await res.json();
        setPlan(data.plan);
      } catch {
        setError("Failed to generate plan. Please try again.");
      }
    };

    generate();
  }, [id]);

  const handleActivate = () => {
    if (!plan) return;
    setActivating(true);
    applyLocalPlan(id, plan);
    router.push(`/mission/${id}/dashboard`);
  };

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Link href="/" className="text-cyan-400 hover:underline text-sm">
          Start over
        </Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-6">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            Building your mission plan...
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Breaking outcome into stages, tasks, and next actions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
          <Target className="h-3.5 w-3.5" />
          Step 3 — Mission Plan
        </div>
        <h1 className="text-3xl font-black text-white">{plan.mission_title}</h1>
        <p className="mt-2 text-zinc-400">{plan.mission_summary}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <StatCard label="Target" value={String(plan.target)} />
        <StatCard label="Deadline" value={formatDate(plan.deadline)} />
        <StatCard label="Tasks" value={String(plan.tasks.length)} />
      </div>

      <section className="mb-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
          Strategy
        </h2>
        <p className="text-white leading-relaxed">{plan.strategy}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Execution Stages
        </h2>
        <div className="space-y-2">
          {plan.stages.map((stage, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/20 px-4 py-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                {i + 1}
              </span>
              <div>
                <p className="font-semibold text-white">{stage.title}</p>
                <p className="text-sm text-zinc-500">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Mission Tasks
        </h2>
        <div className="space-y-3">
          {plan.tasks.map((task, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-zinc-600" />
                <h3 className="font-semibold text-white">{task.title}</h3>
              </div>
              <p className="text-sm text-zinc-500 ml-5">{task.expected_result}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
          Next Best Action
        </p>
        <p className="text-xl font-bold text-white">{plan.next_best_action}</p>
      </div>

      <button
        onClick={handleActivate}
        disabled={activating}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-4 font-bold text-white hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 transition-all"
      >
        {activating ? "Activating Mission..." : "Activate Mission →"}
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
