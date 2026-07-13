"use client";

import { use, useEffect, useState } from "react";
import { useMission } from "@/hooks/useMission";
import { MissionSubNav } from "@/components/MissionSubNav";
import { generateDemoBriefing } from "@/lib/ai-planner";
import type { DailyBriefing } from "@/types/mission";
import { Sun, Target, Lightbulb } from "lucide-react";

export default function BriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { mission, loading } = useMission(id);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  useEffect(() => {
    if (!mission) return;

    const fetchBriefing = async () => {
      try {
        const res = await fetch("/api/briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            missionTitle: mission.mission_title,
            tasks: mission.tasks.map((t) => ({
              title: t.title,
              status: t.status,
            })),
            progress: mission.current_progress ?? 0,
            target: mission.target ?? 0,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setBriefing(data.briefing);
        } else {
          setBriefing(generateDemoBriefing());
        }
      } catch {
        setBriefing(generateDemoBriefing());
      } finally {
        setLoadingBriefing(false);
      }
    };

    fetchBriefing();
  }, [mission]);

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MissionSubNav missionId={id} />

      <div className="mt-6 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
          <Sun className="h-3.5 w-3.5" />
          Daily Agent Briefing
        </div>
        <h1 className="text-2xl font-black text-white">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <p className="mt-1 text-zinc-500">{mission.mission_title}</p>
      </div>

      {loadingBriefing ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        </div>
      ) : briefing ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
              <Target className="h-3.5 w-3.5" />
              Today&apos;s Mission
            </h2>
            <ul className="space-y-3">
              {briefing.todays_mission.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-[10px] font-bold text-cyan-400 border border-cyan-500/30 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
              Target for Today
            </h2>
            <p className="text-2xl font-black text-white">
              {briefing.target_for_today}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/10 p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
              <Lightbulb className="h-3.5 w-3.5" />
              Agent Recommendation
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              {briefing.agent_recommendation}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
