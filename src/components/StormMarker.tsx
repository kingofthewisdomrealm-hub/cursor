import L from 'leaflet'
import { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import { SEVERITY_COLORS } from '../types/storm'
import type { StormEvent } from '../types/storm'

interface StormMarkerProps {
  storm: StormEvent
  isSelected: boolean
  onSelect: (storm: StormEvent) => void
}

function createStormIcon(color: string, isSelected: boolean) {
  const size = isSelected ? 28 : 22
  const ring = isSelected ? 'box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px rgba(56,189,248,0.6);' : ''
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid #fff;
      border-radius:50%;
      ${ring}
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
  })
}

export function StormMarker({ storm, isSelected, onSelect }: StormMarkerProps) {
  const icon = useMemo(
    () => createStormIcon(SEVERITY_COLORS[storm.severity], isSelected),
    [storm.severity, isSelected],
  )

  return (
    <Marker
      position={[storm.latitude, storm.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(storm),
      }}
    />
  )
}
