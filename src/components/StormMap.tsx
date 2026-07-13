import { Circle, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import { FLORIDA_AIRPORTS } from '../data/airports'
import { milesToMeters } from '../lib/geo'
import { AirportMarker } from './AirportMarker'
import { StormMarker } from './StormMarker'
import type { ImpactRadiusMiles, StormEvent } from '../types/storm'

const FLORIDA_CENTER: [number, number] = [27.5, -82.5]
const FLORIDA_ZOOM = 7

interface StormMapProps {
  storms: StormEvent[]
  selectedStorm: StormEvent | null
  impactRadius: ImpactRadiusMiles | null
  onSelectStorm: (storm: StormEvent) => void
}

function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function FlyToSelected({ storm }: { storm: StormEvent | null }) {
  const map = useMap()
  useEffect(() => {
    if (storm) {
      map.flyTo([storm.latitude, storm.longitude], Math.max(map.getZoom(), 9), {
        duration: 0.6,
      })
    }
  }, [storm, map])
  return null
}

export function StormMap({ storms, selectedStorm, impactRadius, onSelectStorm }: StormMapProps) {
  return (
    <MapContainer
      center={FLORIDA_CENTER}
      zoom={FLORIDA_ZOOM}
      className="h-full w-full"
      zoomControl={false}
      maxBounds={[
        [24.3, -88.0],
        [31.2, -79.5],
      ]}
      minZoom={6}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizer />
      <FlyToSelected storm={selectedStorm} />

      {FLORIDA_AIRPORTS.map((airport) => (
        <AirportMarker key={airport.code} airport={airport} />
      ))}

      {storms.map((storm) => (
        <StormMarker
          key={storm.id}
          storm={storm}
          isSelected={selectedStorm?.id === storm.id}
          onSelect={onSelectStorm}
        />
      ))}

      {selectedStorm && impactRadius && (
        <Circle
          center={[selectedStorm.latitude, selectedStorm.longitude]}
          radius={milesToMeters(impactRadius)}
          pathOptions={{
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.12,
            weight: 2,
            dashArray: '6 4',
          }}
        />
      )}
    </MapContainer>
  )
}
