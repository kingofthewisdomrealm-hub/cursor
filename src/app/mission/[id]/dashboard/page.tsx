"use client";

import { use } from "react";
import Link from "next/link";
import { useMission } from "@/hooks/useMission";
import {
  getCurrentStage,
  getNextBestAction,
  getNextTask,
} from "@/lib/mission-store";
import { MissionSubNav } from "@/components/MissionSubNav";
import { MissionCard } from "@/components/MissionCard";
import { NextActionCard } from "@/components/NextActionCard";
import { ProgressBar } from "@/components/ProgressBar";
import { TaskCard } from "@/components/TaskCard";
import { formatDate } from "@/lib/utils";
import { getAllIntegrations } from "@/lib/integration-store";
import { Calendar, Layers, Plug } from "lucide-react";

export default function DashboardPage({
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

  if (!mission || mission.status !== "active") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">
          {!mission ? "Mission not found." : "Mission not yet activated."}
        </p>
        <Link href="/" className="text-cyan-400 hover:underline text-sm">
          Start a new mission
        </Link>
      </div>
    );
  }

  const currentStage = getCurrentStage(mission);
  const nextAction = getNextBestAction(mission);
  const nextTask = getNextTask(mission);
  const activeTasks = mission.tasks.filter(
    (t) => !["completed", "skipped"].includes(t.status)
  );
  const connectedApps = getAllIntegrations().filter((i) => i.enabled);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <MissionSubNav missionId={id} />

      <div className="mt-6 mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
          Active Mission
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {mission.mission_title}
        </h1>
      </div>

      <NextActionCard action={nextAction} className="mb-6" />

      {nextTask && (
        <Link
          href={`/mission/${id}/task/${nextTask.id}`}
          className="mb-6 block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Go to task: {nextTask.title} →
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <MissionCard title="Progress">
          <ProgressBar
            current={mission.current_progress ?? 0}
            target={mission.target ?? 0}
          />
        </MissionCard>

        <MissionCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Deadline
                </p>
                <p className="font-semibold text-white">
                  {formatDate(mission.deadline)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Layers className="h-4 w-4 text-zinc-500 shrink-0" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Current Stage
                </p>
                <p className="font-semibold text-white">
                  {currentStage?.title ?? "Getting started"}
                </p>
              </div>
            </div>
          </div>
        </MissionCard>
      </div>

      {connectedApps.length > 0 && (
        <MissionCard title="Connected AI Apps" className="mb-6">
          <div className="flex flex-wrap gap-2">
            {connectedApps.map((app) => (
              <span
                key={app.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/20 px-3 py-1.5 text-xs font-medium text-purple-300"
              >
                <Plug className="h-3 w-3" />
                {app.name}
              </span>
            ))}
          </div>
          <Link
            href="/integrations"
            className="mt-3 inline-block text-xs text-cyan-400 hover:text-cyan-300"
          >
            Manage AI apps →
          </Link>
        </MissionCard>
      )}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            Active Tasks
          </h2>
          <span className="text-xs text-zinc-600">
            {activeTasks.length} remaining
          </span>
        </div>
        <div className="space-y-2">
          {activeTasks.slice(0, 5).map((task) => (
            <TaskCard key={task.id} task={task} missionId={id} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
          Mission Stages
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mission.stages.map((stage, i) => (
            <div
              key={stage.id}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs ${
                stage.status === "active"
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                  : stage.status === "completed"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : "border-zinc-800 text-zinc-500"
              }`}
            >
              <span className="font-mono mr-1">{i + 1}.</span>
              {stage.title}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
