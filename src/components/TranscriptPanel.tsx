"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/types/agent";

export function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [entries]);

  return (
    <section className="transcript-panel" aria-label="Live transcript">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">
            Live transcript
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Both sides of the conversation appear here as speech is recognized.
          </p>
        </div>
      </div>

      <div className="transcript-scroll">
        {entries.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--muted)]">
            Transcript will appear after you start talking.
          </p>
        ) : (
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className={`transcript-item transcript-item--${entry.role}`}>
                <p className="transcript-role">
                  {entry.role === "user" ? "User" : "Agent"}
                  {entry.status === "in_progress" ? " · …" : ""}
                </p>
                <p className="transcript-text">{entry.text}</p>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
