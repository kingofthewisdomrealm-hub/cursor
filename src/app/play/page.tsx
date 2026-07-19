import Link from "next/link";
import { Suspense } from "react";
import { PlayClient } from "@/components/game/PlayClient";

export default function PlayPage() {
  return (
    <div className="play-shell">
      <header className="play-top">
        <Link href="/" className="play-brand">
          Communication <em>Survival</em>
        </Link>
        <Link
          href="/progress"
          className="btn btn-ghost"
          style={{ padding: "0.45rem 0.85rem" }}
        >
          Progress
        </Link>
      </header>
      <Suspense
        fallback={
          <div className="arena" style={{ display: "grid", placeItems: "center" }}>
            <p>Entering the room…</p>
          </div>
        }
      >
        <PlayClient />
      </Suspense>
    </div>
  );
}
