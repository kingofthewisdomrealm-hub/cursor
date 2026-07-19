"use client";

import { useSearchParams } from "next/navigation";
import { GameArena } from "@/components/game/GameArena";
import type { EnvironmentId } from "@/game/types";

export function PlayClient() {
  const params = useSearchParams();
  const env = params.get("env") as EnvironmentId | null;
  return <GameArena environmentId={env ?? undefined} />;
}
