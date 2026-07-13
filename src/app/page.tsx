"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Sparkles } from "lucide-react";
import { createLocalMission, setLocalQuestions } from "@/lib/mission-store";

const EXAMPLES = [
  "Fill my seminar with 30 people.",
  "Book 10 podcast guests.",
  "Find 50 qualified roofing leads.",
  "Get 500 petition signatures this week.",
  "Find five organizations where I could speak.",
];

export default function HomePage() {
  const router = useRouter();
  const [outcome, setOutcome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLaunch = async () => {
    if (!outcome.trim()) {
      setError("Enter an outcome to launch your mission.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: outcome.trim() }),
      });

      if (!res.ok) throw new Error("Failed to launch mission");

      const data = await res.json();
      const mission = createLocalMission(data.outcome);

      setLocalQuestions(
        mission.id,
        data.questions.map(
          (q: { question: string; sort_order: number; required: boolean }) => ({
            question: q.question,
            sort_order: q.sort_order,
            required: q.required,
          })
        )
      );

      router.push(`/mission/${mission.id}/clarify`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-2xl flex-col items-center justify-center px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-medium text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" />
          AI Mission Control
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white glow-text">
          Outcome Agent
        </h1>
        <p className="mt-4 text-lg text-zinc-400 max-w-md mx-auto">
          Assign a mission to your intelligent project manager. Turn vague goals
          into executable action plans.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 glow-border">
        <label
          htmlFor="outcome"
          className="block text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4"
        >
          What outcome do you want the agent to achieve?
        </label>

        <textarea
          id="outcome"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          placeholder='e.g. "Help me fill The Sifting Method seminar with 30 people."'
          rows={4}
          className="w-full resize-none rounded-xl border border-zinc-700/80 bg-zinc-950/60 px-4 py-3.5 text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleLaunch();
          }}
        />

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleLaunch}
          disabled={loading || !outcome.trim()}
          className="mt-6 w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Initializing Mission...
            </>
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              Launch Mission
            </>
          )}
        </button>
      </div>

      <div className="mt-8 w-full">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3 text-center">
          Example missions
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setOutcome(ex)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 text-xs text-zinc-400 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
