import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { Airport } from '../types/storm'

interface AirportMarkerProps {
  airport: Airport
}

const airportIcon = L.divIcon({
  className: '',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="
    width:20px;height:20px;
    background:#0ea5e9;
    border:2px solid #fff;
    border-radius:4px;
    display:flex;align-items:center;justify-content:center;
    font-size:7px;font-weight:700;color:#fff;
    box-shadow:0 2px 4px rgba(0,0,0,0.35);
    font-family:system-ui,sans-serif;
  ">✈</div>`,
})

export function AirportMarker({ airport }: AirportMarkerProps) {
  return (
    <Marker position={[airport.latitude, airport.longitude]} icon={airportIcon}>
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">{airport.name}</p>
          <p className="text-slate-600">{airport.code}</p>
        </div>
      </Popup>
    </Marker>
  )
}
