"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { ScoredStorm, StormType, Territory } from "@/types/storm";
import { formatStormType } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const TYPE_COLOR: Record<StormType, string> = {
  hail: "#d97706",
  wind: "#0284c7",
  tornado: "#e11d48",
  severe_thunderstorm: "#7c3aed",
  hurricane: "#0f766e",
};

function FitBounds({
  storms,
  selected,
}: {
  storms: ScoredStorm[];
  selected: ScoredStorm | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], 10, { duration: 0.6 });
      return;
    }
    if (storms.length === 0) {
      map.setView([27.8, -81.7], 6);
      return;
    }
    const lats = storms.map((s) => s.lat);
    const lngs = storms.map((s) => s.lng);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.3, Math.min(...lngs) - 0.3],
        [Math.max(...lats) + 0.3, Math.max(...lngs) + 0.3],
      ],
      { padding: [40, 40], maxZoom: 9 }
    );
  }, [storms, selected, map]);
  return null;
}

export function StormMap({
  storms,
  selectedId,
  onSelect,
  territories = [],
}: {
  storms: ScoredStorm[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  territories?: Territory[];
}) {
  const selected = storms.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="h-full min-h-[280px] w-full rounded-xl overflow-hidden border border-[var(--soa-border)] shadow-sm soa-map-enter">
      <MapContainer
        center={[27.8, -81.7]}
        zoom={6}
        className="h-full w-full z-0"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds storms={storms} selected={selected} />
        {storms.map((s) => {
          const active = s.id === selectedId;
          return (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng]}
              pathOptions={{
                color: active ? "#0d7377" : TYPE_COLOR[s.type],
                fillColor: TYPE_COLOR[s.type],
                fillOpacity: active ? 0.9 : 0.65,
                weight: active ? 3 : 1.5,
              }}
              radius={active ? 14 : 8 + s.opportunityScore / 25}
              eventHandlers={{ click: () => onSelect(s.id) }}
            >
              <Popup>
                <strong>{s.city}</strong>
                <br />
                {formatStormType(s.type)} · Score {s.opportunityScore}
                <br />
                {s.date} {s.time}
              </Popup>
            </CircleMarker>
          );
        })}
        {territories.map((t) => (
          <CircleMarker
            key={t.id}
            center={[t.lat, t.lng]}
            pathOptions={{
              color: "#0d7377",
              fillColor: "#14b8a6",
              fillOpacity: 0.5,
              weight: 1,
            }}
            radius={6}
          >
            <Popup>
              {t.neighborhood}
              <br />
              ZIP {t.zipCode} · {t.estimatedHomes} homes
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
