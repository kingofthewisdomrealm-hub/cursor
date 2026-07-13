"use client";

import { useSyncExternalStore } from "react";
import { stayStore } from "@/lib/store";
import type { StayFlowState } from "@/types";

const empty: StayFlowState = {
  user: null,
  users: [],
  properties: [],
  rooms: [],
  reservations: [],
  housekeeping_tasks: [],
  notifications: [],
};

export function useStayFlow(): StayFlowState {
  return useSyncExternalStore(
    stayStore.subscribe,
    stayStore.getState,
    () => empty
  );
}
