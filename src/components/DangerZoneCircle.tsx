import { Circle, Tooltip } from 'react-leaflet'
import { milesToMeters } from '../lib/geo'
import {
  getDangerZoneRadiusMiles,
  getDangerZoneStyle,
} from '../lib/dangerZone'
import type { StormEvent } from '../types/storm'

interface DangerZoneCircleProps {
  storm: StormEvent
  isSelected: boolean
}

export function DangerZoneCircle({ storm, isSelected }: DangerZoneCircleProps) {
  const radiusMiles = getDangerZoneRadiusMiles(storm)
  const style = getDangerZoneStyle(storm, isSelected)

  return (
    <Circle
      center={[storm.latitude, storm.longitude]}
      radius={milesToMeters(radiusMiles)}
      pathOptions={style}
    >
      {isSelected && (
        <Tooltip permanent direction="top" offset={[0, -8]} className="danger-zone-tooltip">
          <span className="font-semibold">Danger Zone</span>
          <span className="mx-1">·</span>
          <span>{radiusMiles} mi</span>
        </Tooltip>
      )}
    </Circle>
  )
}
