"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Sparkles } from "lucide-react";
import type { MissionWithRelations, Task } from "@/types/mission";
import {
  getAllIntegrations,
  saveDelegation,
} from "@/lib/integration-store";
import { matchIntegrationForTask } from "@/lib/integrations/matcher";
import { updateLocalTask } from "@/lib/mission-store";
import { CAPABILITY_LABELS } from "@/lib/integrations/registry";
import { v4 as uuidv4 } from "uuid";

interface DelegateToAppProps {
  mission: MissionWithRelations;
  task: Task;
  onComplete: () => void;
}

export function DelegateToApp({ mission, task, onComplete }: DelegateToAppProps) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState(task.work_output ?? "");

  const integrations = getAllIntegrations().filter((i) => i.enabled);
  const match = matchIntegrationForTask(task, integrations);

  if (integrations.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 text-sm text-zinc-500">
        <Link href="/integrations" className="text-cyan-400 hover:underline">
          Connect AI apps
        </Link>{" "}
        to delegate mission work.
      </div>
    );
  }

  const handleRun = async () => {
    if (!match) {
      setError("No matching app for this task.");
      return;
    }

    setRunning(true);
    setError("");

    updateLocalTask(mission.id, task.id, {
      delegation_status: "running",
      assigned_integration_id: match.integration.id,
    });

    try {
      const res = await fetch("/api/integrations/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission_id: mission.id,
          task_id: task.id,
          integration_id: match.integration.id,
          capability: match.capability,
          mission_title: mission.mission_title,
          outcome_text: mission.outcome_text,
          task,
          integrations: getAllIntegrations(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Execution failed");

      const result = data.result;
      setOutput(result.output);

      const delegation = {
        id: uuidv4(),
        mission_id: mission.id,
        task_id: task.id,
        integration_id: match.integration.id,
        app_id: match.integration.app_id,
        app_name: match.integration.name,
        capability: match.capability,
        status: result.requires_approval
          ? ("awaiting_approval" as const)
          : ("completed" as const),
        request: {
          mission_id: mission.id,
          task_id: task.id,
          integration_id: match.integration.id,
          app_id: match.integration.app_id,
          capability: match.capability,
          mission_title: mission.mission_title ?? "",
          outcome_text: mission.outcome_text,
          task: {
            title: task.title,
            description: task.description,
            instructions: task.instructions,
          },
        },
        result,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      saveDelegation(delegation);

      updateLocalTask(mission.id, task.id, {
        work_output: result.output,
        suggested_content: result.output,
        delegation_status: result.requires_approval
          ? "awaiting_approval"
          : "completed",
        assigned_integration_id: match.integration.id,
        status: result.requires_approval ? "waiting_for_approval" : "in_progress",
      });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run AI app");
      updateLocalTask(mission.id, task.id, { delegation_status: "failed" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="mb-6 rounded-xl border border-purple-500/20 bg-purple-950/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-purple-400" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400">
          AI App Execution
        </h2>
      </div>

      {match && (
        <p className="text-sm text-zinc-400 mb-4">
          Recommended:{" "}
          <span className="text-white font-medium">{match.integration.name}</span>
          <span className="text-zinc-600 mx-2">·</span>
          <span className="text-zinc-500">
            {CAPABILITY_LABELS[match.capability]}
          </span>
        </p>
      )}

      <button
        onClick={handleRun}
        disabled={running || !match}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 font-bold text-white disabled:opacity-50 transition-all hover:from-purple-500 hover:to-purple-400"
      >
        {running ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Running {match?.integration.name}...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Run with AI App
          </>
        )}
      </button>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {output && (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            AI Output — review before completing
          </p>
          <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans">
            {output}
          </pre>
        </div>
      )}
    </section>
  );
}
