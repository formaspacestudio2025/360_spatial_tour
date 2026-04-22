import { useState } from 'react';
import { Scene } from '@/types';
import { Settings } from 'lucide-react';
import SceneSettings from './SceneSettings';

interface SceneListProps {
  scenes: Scene[];
  currentSceneId?: string;
  onSceneSelect: (scene: Scene) => void;
  walkthroughId: string;
}

function SceneList({ scenes, currentSceneId, onSceneSelect, walkthroughId }: SceneListProps) {
  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Scenes</h3>
        <p className="text-sm text-gray-400">{scenes.length} scenes</p>
      </div>
      
      <div className="space-y-2 p-4">
        {scenes.map((scene) => {
          const isCurrent = scene.id === currentSceneId;
          
          return (
            <div key={scene.id} className="relative group">
              <button
                onClick={() => onSceneSelect(scene)}
                className={`w-full p-3 rounded-lg transition-all text-left ${
                  isCurrent
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                }`}
              >
                <div className="font-medium">{scene.room_name || 'Unnamed Scene'}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Floor {scene.floor}
                </div>
                {scene.thumbnail_url && (
                  <img
                    src={scene.thumbnail_url}
                    alt={scene.room_name}
                    className="mt-2 w-full h-20 object-cover rounded"
                  />
                )}
              </button>
              
              {/* Settings button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingScene(scene);
                }}
                className="absolute top-2 right-2 p-1.5 bg-gray-900/80 hover:bg-gray-900 text-gray-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Scene Settings"
              >
                <Settings size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Scene Settings Modal */}
      {editingScene && (
        <SceneSettings
          scene={editingScene}
          walkthroughId={walkthroughId}
          onClose={() => setEditingScene(null)}
        />
      )}
    </div>
  );
}

export default SceneList;
