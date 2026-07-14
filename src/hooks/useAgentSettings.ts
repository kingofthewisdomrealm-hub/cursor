"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_AGENT_SETTINGS } from "@/lib/agent-defaults";
import { loadAgentSettings, saveAgentSettings } from "@/lib/settings-storage";
import type { AgentSettings } from "@/types/agent";

export function useAgentSettings() {
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_AGENT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSettings(loadAgentSettings());
    setHydrated(true);
  }, []);

  const updateSettings = useCallback((next: AgentSettings) => {
    setSettings(next);
    saveAgentSettings(next);
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AGENT_SETTINGS);
    saveAgentSettings(DEFAULT_AGENT_SETTINGS);
  }, []);

  return {
    settings,
    hydrated,
    updateSettings,
    resetSettings,
  };
}
