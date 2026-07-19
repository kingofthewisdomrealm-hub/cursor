import Link from "next/link";
import { GameArena } from "@/components/game/GameArena";
import type { EnvironmentId } from "@/game/types";

interface Props {
  searchParams: Promise<{ env?: string }>;
}

export default async function PlayPage({ searchParams }: Props) {
  const params = await searchParams;
  const env = params.env as EnvironmentId | undefined;

  return (
    <div className="play-shell">
      <header className="play-top">
        <Link href="/" className="play-brand">
          Communication <em>Survival</em>
        </Link>
        <Link href="/progress" className="btn btn-ghost" style={{ padding: "0.45rem 0.85rem" }}>
          Progress
        </Link>
      </header>
      <GameArena environmentId={env} />
    </div>
  );
}
