"use client";

import { use } from "react";
import Link from "next/link";
import { useMission } from "@/hooks/useMission";
import { MissionSubNav } from "@/components/MissionSubNav";
import { ProgressBar } from "@/components/ProgressBar";
import { TrendingUp, Brain, ArrowRight } from "lucide-react";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { mission, loading } = useMission(id);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        Mission not found.
      </div>
    );
  }

  const learningUpdates = mission.recommendations.filter(
    (r) => r.recommendation_type === "learning_update"
  );
  const completedTasks = mission.tasks.filter((t) => t.status === "completed");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MissionSubNav missionId={id} />

      <div className="mt-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Results & Learning
        </div>
        <h1 className="text-2xl font-black text-white">Mission Intelligence</h1>
        <p className="mt-1 text-zinc-500">
          The agent learns from your results to improve strategy.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 mb-6">
        <ProgressBar
          current={mission.current_progress ?? 0}
          target={mission.target ?? 0}
        />
        <p className="mt-3 text-sm text-zinc-500">
          {completedTasks.length} of {mission.tasks.length} tasks completed
        </p>
      </div>

      {learningUpdates.length > 0 ? (
        <section className="mb-8">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            <Brain className="h-3.5 w-3.5" />
            Strategy Updates
          </h2>
          <div className="space-y-3">
            {learningUpdates.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-5"
              >
                <p className="text-sm font-semibold text-cyan-400 mb-1">
                  {rec.title}
                </p>
                <p className="text-zinc-300 leading-relaxed">{rec.content}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6 mb-8 text-center">
          <p className="text-zinc-500 text-sm">
            Complete tasks and submit results to unlock strategy insights.
          </p>
        </div>
      )}

      {mission.task_results.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
            Task Results Log
          </h2>
          <div className="space-y-3">
            {mission.task_results.map((result) => {
              const task = mission.tasks.find((t) => t.id === result.task_id);
              return (
                <div
                  key={result.id}
                  className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4"
                >
                  <p className="font-semibold text-white mb-2">
                    {task?.title ?? "Task"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <Metric label="Responses" value={result.responses_count} />
                    <Metric label="Yes" value={result.yes_count} />
                    <Metric label="Registered" value={result.registrations_count} />
                  </div>
                  {result.top_objection && (
                    <p className="mt-3 text-xs text-zinc-500">
                      Top objection:{" "}
                      <span className="text-zinc-400">{result.top_objection}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <Link
        href={`/mission/${id}/dashboard`}
        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
      >
        Back to Dashboard
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}
