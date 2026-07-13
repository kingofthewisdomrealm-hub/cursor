"use client";

import { useEffect, useState, useCallback } from "react";
import { getClaims, DATA_CHANGE_EVENT } from "@/lib/claim-store";
import type { Claim } from "@/types/claim";

export function useClaims(filter?: (claims: Claim[]) => Claim[]): Claim[] {
  const [claims, setClaims] = useState<Claim[]>([]);

  const refresh = useCallback(() => {
    const data = getClaims();
    setClaims(filter ? filter(data) : data);
  }, [filter]);

  useEffect(() => {
    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, [refresh]);

  return claims;
}
