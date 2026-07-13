"use client";

import { useEffect, useState } from "react";
import type { MissionWithRelations } from "@/types/mission";
import { getLocalMission } from "@/lib/mission-store";

export function useMission(missionId: string) {
  const [mission, setMission] = useState<MissionWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const data = getLocalMission(missionId);
    setMission(data);
    setLoading(false);
  };

  useEffect(() => {
    const data = getLocalMission(missionId);
    setMission(data);
    setLoading(false);
  }, [missionId]);

  return { mission, loading, refresh };
}
