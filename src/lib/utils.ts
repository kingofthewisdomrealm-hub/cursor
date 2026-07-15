import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStormType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatConfidence(level: string): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function hoursAgo(isoDate: string, time: string): number {
  const dt = new Date(`${isoDate}T${time}:00`);
  return (Date.now() - dt.getTime()) / (1000 * 60 * 60);
}

export function openGoogleMapsRoute(
  points: { lat: number; lng: number; label?: string }[]
): string {
  if (points.length === 0) return "https://www.google.com/maps";
  if (points.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${points[0].lat},${points[0].lng}`;
  }
  const origin = `${points[0].lat},${points[0].lng}`;
  const destination = `${points[points.length - 1].lat},${points[points.length - 1].lng}`;
  const waypoints = points
    .slice(1, -1)
    .map((p) => `${p.lat},${p.lng}`)
    .join("|");
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    travelmode: "driving",
  });
  if (waypoints) params.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
