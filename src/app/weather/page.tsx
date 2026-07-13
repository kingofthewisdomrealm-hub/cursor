"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SEED_WEATHER_EVENTS, SEED_CLAIMS } from "@/lib/seed-data";
import { formatDate } from "@/lib/utils";
import {
  CloudLightning,
  Wind,
  CloudHail,
  Tornado,
  AlertTriangle,
  MapPin,
  CheckCircle,
} from "lucide-react";

const EVENT_ICONS = {
  hail: CloudHail,
  wind: Wind,
  hurricane: CloudLightning,
  tornado: Tornado,
  severe: AlertTriangle,
};

const EVENT_COLORS = {
  hail: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  wind: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  hurricane: "text-red-400 bg-red-500/10 border-red-500/20",
  tornado: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  severe: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
};

export default function WeatherPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? SEED_WEATHER_EVENTS
      : SEED_WEATHER_EVENTS.filter((e) => e.type === filter);

  const selected = SEED_WEATHER_EVENTS.find((e) => e.id === selectedEvent);

  const claimsNearEvent = selected
    ? SEED_CLAIMS.filter(
        (c) =>
          Math.abs(c.lat - selected.lat) < 0.15 &&
          Math.abs(c.lng - selected.lng) < 0.15
      )
    : [];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Weather Intelligence
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Storm events, hail reports, and wind verification for claim addresses
        </p>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "hail", "wind", "tornado", "severe"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              filter === f
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                : "text-zinc-500 hover:text-white border border-transparent"
            }`}
          >
            {f === "all" ? "All Events" : f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Map visualization */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <div className="relative aspect-[16/10] bg-zinc-950">
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.1)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="800" height="500" fill="url(#grid)" />
              </svg>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-zinc-600 uppercase tracking-widest">Dallas-Fort Worth Metro</p>
            </div>

            {filtered.map((event) => {
              const x = ((event.lng + 97) / 0.5) * 100;
              const y = ((33.5 - event.lat) / 0.5) * 100;
              const Icon = EVENT_ICONS[event.type];
              const isSelected = selectedEvent === event.id;

              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(isSelected ? null : event.id)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2 border-2 transition-all ${
                    isSelected
                      ? "scale-125 border-white shadow-lg shadow-blue-500/30"
                      : "border-zinc-700 hover:border-blue-400"
                  } ${EVENT_COLORS[event.type]}`}
                  style={{ left: `${Math.min(Math.max(x, 5), 95)}%`, top: `${Math.min(Math.max(y, 5), 95)}%` }}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}

            {SEED_CLAIMS.map((claim) => {
              const x = ((claim.lng + 97) / 0.5) * 100;
              const y = ((33.5 - claim.lat) / 0.5) * 100;
              return (
                <div
                  key={claim.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-400/60 border border-blue-300"
                  style={{ left: `${Math.min(Math.max(x, 5), 95)}%`, top: `${Math.min(Math.max(y, 5), 95)}%` }}
                  title={claim.propertyAddress}
                />
              );
            })}
          </div>
        </div>

        {/* Event details panel */}
        <div className="space-y-3">
          {selected ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
              <div className="flex items-center gap-2 mb-3">
                {(() => {
                  const Icon = EVENT_ICONS[selected.type];
                  return <Icon className="h-5 w-5 text-blue-400" />;
                })()}
                <h3 className="text-sm font-bold text-white capitalize">{selected.type} Event</h3>
                {selected.verified && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-300 mb-3">{selected.description}</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Date</dt>
                  <dd className="text-zinc-200">{formatDate(selected.date)}</dd>
                </div>
                {selected.windSpeed && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Wind Speed</dt>
                    <dd className="text-zinc-200">{selected.windSpeed} mph</dd>
                  </div>
                )}
                {selected.hailSize && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Hail Size</dt>
                    <dd className="text-zinc-200">{selected.hailSize}&quot;</dd>
                  </div>
                )}
              </dl>

              {claimsNearEvent.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800/60">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Nearby Claims ({claimsNearEvent.length})
                  </p>
                  {claimsNearEvent.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                      <MapPin className="h-3 w-3" />
                      {c.homeowner.name} — {c.propertyAddress}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-center text-zinc-500">
              <CloudLightning className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select a storm event on the map</p>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((event) => {
              const Icon = EVENT_ICONS[event.type];
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-all ${
                    selectedEvent === event.id
                      ? "border-blue-500/30 bg-blue-500/5"
                      : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-200 capitalize">{event.type}</span>
                    <span className="text-xs text-zinc-500 ml-auto">{formatDate(event.date)}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{event.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="h-16 lg:hidden" />
    </AppShell>
  );
}
