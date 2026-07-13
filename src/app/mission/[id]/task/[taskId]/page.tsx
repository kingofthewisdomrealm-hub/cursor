"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMission } from "@/hooks/useMission";
import {
  addLocalRecommendation,
  addLocalTaskResult,
  advanceAfterTask,
  canApproveTask,
  canCompleteTask,
  getNextTask,
  isTaskUnlocked,
  updateLocalMission,
  updateLocalTask,
} from "@/lib/mission-store";
import { MissionSubNav } from "@/components/MissionSubNav";
import { StatusBadge } from "@/components/StatusBadge";
import type { TaskStatus } from "@/types/mission";
import {
  Check,
  Edit3,
  Lock,
  SkipForward,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id, taskId } = use(params);
  const router = useRouter();
  const { mission, loading, refresh } = useMission(id);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    responses_count: 0,
    yes_count: 0,
    registrations_count: 0,
    top_objection: "",
  });

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

  const task = mission.tasks.find((t) => t.id === taskId);
  if (!task) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-zinc-400">
        Task not found.
      </div>
    );
  }

  const unlocked = isTaskUnlocked(mission, task);
  const showApprove = canApproveTask(task);
  const showComplete = canCompleteTask(mission, task);

  const updateStatus = (status: TaskStatus) => {
    updateLocalTask(id, taskId, { status });
    refresh();
  };

  const handleApprove = () => {
    updateStatus("in_progress");
  };

  const handleComplete = () => {
    if (!showComplete) return;
    updateStatus("completed");
    setShowResults(true);
  };

  const handleSkip = () => {
    updateStatus("skipped");
    advanceAfterTask(id, taskId);
    refresh();
    const updated = getNextTask({
      ...mission,
      tasks: mission.tasks.map((t) =>
        t.id === taskId ? { ...t, status: "skipped" as TaskStatus } : t
      ),
    });
    if (updated) router.push(`/mission/${id}/task/${updated.id}`);
    else router.push(`/mission/${id}/dashboard`);
  };

  const handleSaveEdit = () => {
    updateLocalTask(id, taskId, { suggested_content: editedContent });
    setEditing(false);
    refresh();
  };

  const handleSubmitResults = async () => {
    addLocalTaskResult(id, taskId, results);

    const newProgress =
      (mission.current_progress ?? 0) + results.registrations_count;
    updateLocalMission(id, { current_progress: newProgress });

    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: mission.outcome_text,
          results: [
            {
              channel: task.title,
              responses: results.responses_count,
              yes: results.yes_count,
              registrations: results.registrations_count,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addLocalRecommendation(id, {
          recommendation_type: "learning_update",
          title: "Strategy Updated",
          content: data.update,
          priority: 8,
          is_active: true,
        });
      }
    } catch {
      // non-blocking
    }

    advanceAfterTask(id, taskId);
    refresh();

    const updatedMission = {
      ...mission,
      tasks: mission.tasks.map((t) =>
        t.id === taskId ? { ...t, status: "completed" as TaskStatus } : t
      ),
    };
    const next = getNextTask(updatedMission);

    if (next) router.push(`/mission/${id}/task/${next.id}`);
    else router.push(`/mission/${id}/results`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <MissionSubNav missionId={id} />

      <div className="mt-6 mb-6">
        <StatusBadge status={task.status} className="mb-3" />
        <h1 className="text-2xl font-black text-white">{task.title}</h1>
        {task.description && (
          <p className="mt-2 text-zinc-400">{task.description}</p>
        )}
      </div>

      {!unlocked && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
          <Lock className="h-4 w-4 shrink-0" />
          Complete earlier tasks before starting this one.
        </div>
      )}

      {!showResults ? (
        <>
          <Section title="Why it matters">
            <p className="text-zinc-300 leading-relaxed">{task.reason}</p>
          </Section>

          <Section title="Exact instructions">
            <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {task.instructions}
            </p>
          </Section>

          {task.suggested_content && (
            <Section title="Suggested message or content">
              {editing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-white focus:border-cyan-500/50 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    Save changes
                  </button>
                </div>
              ) : (
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-zinc-950/40 rounded-lg p-4 border border-zinc-800">
                  {task.suggested_content}
                </p>
              )}
            </Section>
          )}

          <div className="grid gap-3 sm:grid-cols-2 mb-8">
            <InfoBox label="Expected result" value={task.expected_result ?? ""} />
            <InfoBox label="Estimated impact" value={task.estimated_impact ?? ""} />
          </div>

          {task.approval_required && showApprove && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-950/20 px-4 py-3 text-sm text-purple-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              This action affects the outside world and requires your approval.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {showApprove && (
              <ActionButton
                onClick={handleApprove}
                icon={<ThumbsUp className="h-4 w-4" />}
                label="Approve"
                variant="primary"
              />
            )}
            {task.suggested_content && (
              <ActionButton
                onClick={() => {
                  setEditedContent(task.suggested_content ?? "");
                  setEditing(true);
                }}
                icon={<Edit3 className="h-4 w-4" />}
                label="Edit"
                disabled={!unlocked}
              />
            )}
            <ActionButton
              onClick={handleComplete}
              icon={<Check className="h-4 w-4" />}
              label="Complete"
              variant="success"
              disabled={!showComplete}
            />
            <ActionButton
              onClick={handleSkip}
              icon={<SkipForward className="h-4 w-4" />}
              label="Skip"
              disabled={!unlocked}
            />
          </div>
        </>
      ) : (
        <div className="space-y-5">
          <Section title="Learning Loop — How did it go?">
            <p className="text-sm text-zinc-500 mb-4">
              Help the agent learn and adapt your strategy.
            </p>

            <div className="space-y-4">
              <ResultInput
                label="How many people responded?"
                value={results.responses_count}
                onChange={(v) =>
                  setResults((r) => ({ ...r, responses_count: v }))
                }
              />
              <ResultInput
                label="How many said yes?"
                value={results.yes_count}
                onChange={(v) => setResults((r) => ({ ...r, yes_count: v }))}
              />
              <ResultInput
                label="How many registered?"
                value={results.registrations_count}
                onChange={(v) =>
                  setResults((r) => ({ ...r, registrations_count: v }))
                }
              />
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  What objection appeared most often?
                </label>
                <input
                  type="text"
                  value={results.top_objection}
                  onChange={(e) =>
                    setResults((r) => ({
                      ...r,
                      top_objection: e.target.value,
                    }))
                  }
                  placeholder="e.g. Not enough time, too expensive..."
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
                />
              </div>
            </div>
          </Section>

          <button
            onClick={handleSubmitResults}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-4 font-bold text-white hover:from-cyan-500 hover:to-cyan-400 transition-all"
          >
            Submit Results & Continue
          </button>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-white">{value}</p>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  label,
  variant,
  disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "success";
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-cyan-600/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30",
    success: "bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30",
    default: "bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800",
  };

  const style =
    variant === "primary"
      ? styles.primary
      : variant === "success"
        ? styles.success
        : styles.default;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${style}`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResultInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-zinc-400 mb-2">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-white focus:border-cyan-500/50 focus:outline-none"
      />
    </div>
  );
}
