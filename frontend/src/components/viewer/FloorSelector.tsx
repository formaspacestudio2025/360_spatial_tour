import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Scene } from '@/types';

interface FloorSelectorProps {
  scenes: Scene[];
  currentSceneId: string;
  onFloorSelect: (floor: number | null) => void;
  onSceneSelect: (scene: Scene) => void;
}

function FloorSelector({
  scenes,
  currentSceneId,
  onFloorSelect,
  onSceneSelect,
}: FloorSelectorProps) {
  const [expanded, setExpanded] = useState(true);

  // Get unique floors from scenes, sorted ascending
  const floors = useMemo(() => {
    const uniqueFloors = Array.from(new Set(scenes.map(s => s.floor)));
    return uniqueFloors.sort((a, b) => a - b);
  }, [scenes]);

  // Get current scene's floor
  const currentFloor = useMemo(() => {
    const currentScene = scenes.find(s => s.id === currentSceneId);
    return currentScene?.floor ?? null;
  }, [scenes, currentSceneId]);

  // Group scenes by floor
  const scenesByFloor = useMemo(() => {
    const grouped: Record<number, Scene[]> = {};
    scenes.forEach(scene => {
      if (!grouped[scene.floor]) {
        grouped[scene.floor] = [];
      }
      grouped[scene.floor].push(scene);
    });
    return grouped;
  }, [scenes]);

  const handleFloorClick = (floor: number) => {
    onFloorSelect(floor === currentFloor ? null : floor);
  };

  const handleSceneClick = (scene: Scene) => {
    onSceneSelect(scene);
  };

  if (floors.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-primary-500" />
          <span className="text-white font-medium text-sm">Floor Navigation</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {/* Floor List */}
      {expanded && (
        <div className="p-2 space-y-1">
          {floors.map((floor) => {
            const floorScenes = scenesByFloor[floor] || [];
            const isCurrentFloor = floor === currentFloor;
            const hasCurrentScene = floorScenes.some(s => s.id === currentSceneId);

            return (
              <div key={floor} className="space-y-1">
                {/* Floor Button */}
                <button
                  onClick={() => handleFloorClick(floor)}
                  className={`w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between ${
                    isCurrentFloor
                      ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Floor {floor}</span>
                    <span className="text-xs text-gray-500">({floorScenes.length} scenes)</span>
                  </div>
                  {hasCurrentScene && (
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                  )}
                </button>

                {/* Scene List (expanded when floor is selected) */}
                {isCurrentFloor && (
                  <div className="ml-4 space-y-1">
                    {floorScenes.map((scene) => (
                      <button
                        key={scene.id}
                        onClick={() => handleSceneClick(scene)}
                        className={`w-full px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${
                          scene.id === currentSceneId
                            ? 'bg-primary-600/30 text-primary-300'
                            : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{scene.room_name || `Scene ${scene.id.slice(0, 8)}`}</span>
                          {scene.id === currentSceneId && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* "All Floors" option */}
          <button
            onClick={() => onFloorSelect(null)}
            className={`w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center gap-2 ${
              currentFloor === null
                ? 'bg-gray-700/50 border border-gray-600/30 text-gray-300'
                : 'bg-gray-800/30 hover:bg-gray-700/30 text-gray-400'
            }`}
          >
            <span className="text-sm">All Floors</span>
            <span className="text-xs text-gray-500">({scenes.length} scenes)</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default FloorSelector;