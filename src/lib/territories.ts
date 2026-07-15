import type { ScoredStorm, Territory } from "@/types/storm";

interface NeighborhoodSeed {
  name: string;
  zipCode: string;
  city: string;
  latOffset: number;
  lngOffset: number;
  homes: number;
}

const NEIGHBORHOODS: NeighborhoodSeed[] = [
  { name: "Oak Ridge Estates", zipCode: "", city: "", latOffset: 0.018, lngOffset: 0.012, homes: 420 },
  { name: "Lakeview Manor", zipCode: "", city: "", latOffset: -0.015, lngOffset: 0.02, homes: 380 },
  { name: "Pinecrest Heights", zipCode: "", city: "", latOffset: 0.025, lngOffset: -0.014, homes: 510 },
  { name: "Bayshore Crossing", zipCode: "", city: "", latOffset: -0.022, lngOffset: -0.018, homes: 290 },
  { name: "Cypress Park", zipCode: "", city: "", latOffset: 0.01, lngOffset: -0.028, homes: 350 },
  { name: "Sunset Village", zipCode: "", city: "", latOffset: -0.008, lngOffset: 0.03, homes: 460 },
];

function zipVariant(base: string, index: number): string {
  const n = parseInt(base, 10);
  if (Number.isNaN(n)) return base;
  return String(n + index).padStart(5, "0");
}

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Recommend nearby neighborhoods / ZIP codes to canvass around a storm.
 */
export function generateTerritories(
  storm: ScoredStorm,
  count = 5
): Territory[] {
  const selected = NEIGHBORHOODS.slice(0, count);

  return selected
    .map((n, i) => {
      const lat = storm.lat + n.latOffset;
      const lng = storm.lng + n.lngOffset;
      const distanceMiles = haversineMiles(storm.lat, storm.lng, lat, lng);
      const densityBoost = storm.residentialDensity / 100;
      const scoreBoost = storm.opportunityScore / 100;
      const priority = Math.round(
        100 -
          distanceMiles * 8 +
          densityBoost * 15 +
          scoreBoost * 20 +
          (n.homes / 50)
      );

      return {
        id: `${storm.id}-terr-${i + 1}`,
        name: `${n.name} — ${storm.city}`,
        zipCode: zipVariant(storm.zipCode, i),
        city: storm.city,
        neighborhood: n.name,
        lat,
        lng,
        estimatedHomes: n.homes,
        distanceMiles: Math.round(distanceMiles * 10) / 10,
        priority: Math.min(100, Math.max(1, priority)),
        stormId: storm.id,
      };
    })
    .sort((a, b) => b.priority - a.priority);
}
