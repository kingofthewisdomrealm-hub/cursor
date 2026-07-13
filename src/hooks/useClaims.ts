"use client";

import { useEffect, useState } from "react";
import { getClaims, DATA_CHANGE_EVENT } from "@/lib/claim-store";
import type { Claim } from "@/types/claim";

export function useClaims(): Claim[] {
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const refresh = () => {
      const data = getClaims();
      setClaims((prev) => {
        if (
          prev.length === data.length &&
          prev.every(
            (c, i) =>
              c.id === data[i]?.id && c.updatedAt === data[i]?.updatedAt
          )
        ) {
          return prev;
        }
        return data;
      });
    };

    refresh();
    window.addEventListener(DATA_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, refresh);
  }, []);

  return claims;
}
