import { getTile, COLLECTION_SECTIONS, ALL_TILE_IDS } from '../config/tiles'
import { TraitTile } from './TraitTile'
import type { TileId } from '../types/game'

interface CollectionScreenProps {
  discoveredTiles: TileId[]
  onSelectTile: (tileId: TileId) => void
  onBack: () => void
}

export function CollectionScreen({ discoveredTiles, onSelectTile, onBack }: CollectionScreenProps) {
  const discoveredCount = ALL_TILE_IDS.filter((id) => discoveredTiles.includes(id)).length

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-24">
      <div className="flex items-center justify-between py-3">
        <button type="button" onClick={onBack} className="text-indigo-600 font-medium text-sm">
          ← Back
        </button>
        <h2 className="text-lg font-bold text-slate-800">Collection</h2>
        <div className="w-12" />
      </div>
      <p className="text-center text-sm text-slate-500 mb-4">
        {discoveredCount} of {ALL_TILE_IDS.length} Archetypes Discovered
      </p>
      {COLLECTION_SECTIONS.map((section) => (
        <div key={section.id} className="mb-6">
          <h3 className="text-sm font-bold text-slate-600 mb-2">{section.title}</h3>
          <div className="grid grid-cols-4 gap-2">
            {section.tiles.map((tileId) => {
              const discovered = discoveredTiles.includes(tileId)
              const tile = getTile(tileId)
              return (
                <button
                  key={tileId}
                  type="button"
                  disabled={!discovered}
                  onClick={() => discovered && onSelectTile(tileId)}
                  className="aspect-square"
                >
                  {discovered ? (
                    <TraitTile tileId={tileId} compact />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 text-xl font-bold border-2 border-slate-700">
                      ?
                    </div>
                  )}
                  <p className="text-[8px] text-center mt-0.5 text-slate-500 truncate">
                    {discovered ? tile.name : '???'}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
