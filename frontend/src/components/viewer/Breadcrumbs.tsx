import { useState, useMemo } from 'react';
import { ChevronRight, ArrowLeft, Navigation2, Home } from 'lucide-react';
import { Scene } from '@/types';
import {
  buildBreadcrumbTrail,
  findNearestScene,
  getSuggestedScenes,
  areOnSameFloor
} from '@/utils/navigation';

interface BreadcrumbsProps {
  scenes: Scene[];
  currentScene: Scene;
  navigationEdges?: any[];
  startSceneId?: string;
  onSceneSelect: (scene: Scene) => void;
  onBack?: () => void;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

function Breadcrumbs({
  scenes,
  currentScene,
  navigationEdges = [],
  startSceneId,
  onSceneSelect,
  onBack,
  showSuggestions = true,
  maxSuggestions = 3,
}: BreadcrumbsProps) {
  const [showAllBreadcrumbs, setShowAllBreadcrumbs] = useState(false);

  // Build breadcrumb trail
  const breadcrumbTrail = useMemo(() => {
    if (!startSceneId) return [currentScene];
    return buildBreadcrumbTrail(startSceneId, currentScene.id, scenes, navigationEdges);
  }, [startSceneId, currentScene.id, scenes, navigationEdges]);

  // Get suggested scenes
  const suggestedScenes = useMemo(() => {
    if (!showSuggestions) return [];
    return getSuggestedScenes(currentScene, scenes, navigationEdges, maxSuggestions);
  }, [currentScene, scenes, navigationEdges, showSuggestions, maxSuggestions]);

  // Find nearest scene
  const nearestScene = useMemo(() => {
    return findNearestScene(currentScene, scenes);
  }, [currentScene, scenes]);

  // Display breadcrumbs (limit if not expanded)
  const displayBreadcrumbs = showAllBreadcrumbs
    ? breadcrumbTrail
    : breadcrumbTrail.slice(-3);

  const handleBreadcrumbClick = (scene: Scene) => {
    if (scene.id !== currentScene.id) {
      onSceneSelect(scene);
    }
  };

  const handleSuggestionClick = (scene: Scene) => {
    onSceneSelect(scene);
  };

  if (breadcrumbTrail.length <= 1 && !showSuggestions) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Breadcrumb Trail */}
      {breadcrumbTrail.length > 1 && (
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                title="Go back"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 flex-1 overflow-x-auto">
              {!showAllBreadcrumbs && breadcrumbTrail.length > 3 && (
                <span className="text-gray-500 text-xs">...</span>
              )}

              {displayBreadcrumbs.map((scene, index) => {
                const isLast = index === displayBreadcrumbs.length - 1;
                const isFirst = index === 0 && !showAllBreadcrumbs && breadcrumbTrail.length > 3;

                return (
                  <div key={scene.id} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight size={12} className="text-gray-600 flex-shrink-0" />
                    )}

                    <button
                      onClick={() => handleBreadcrumbClick(scene)}
                      disabled={isLast}
                      className={`px-2 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                        isLast
                          ? 'bg-primary-600/20 text-primary-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      title={scene.room_name || `Scene ${scene.id.slice(0, 8)}`}
                    >
                      {isFirst && !showAllBreadcrumbs && breadcrumbTrail.length > 3 ? (
                        <span>...</span>
                      ) : (
                        <span className="truncate max-w-[120px]">
                          {scene.room_name || `Scene ${scene.id.slice(0, 8)}`}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}

              {/* Expand/Collapse Button */}
              {breadcrumbTrail.length > 3 && (
                <button
                  onClick={() => setShowAllBreadcrumbs(!showAllBreadcrumbs)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-500 hover:text-white"
                  title={showAllBreadcrumbs ? 'Show less' : 'Show all'}
                >
                  <span className="text-xs">{showAllBreadcrumbs ? '−' : '+'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Suggestions */}
      {showSuggestions && suggestedScenes.length > 0 && (
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Navigation2 size={14} className="text-primary-500" />
            <span className="text-xs text-gray-400 font-medium">Quick Navigation</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestedScenes.map((scene) => {
              const isNearest = nearestScene?.id === scene.id;
              const isSameFloor = areOnSameFloor(currentScene, scene);

              return (
                <button
                  key={scene.id}
                  onClick={() => handleSuggestionClick(scene)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                    isNearest
                      ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                      : 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                  }`}
                  title={scene.room_name || `Scene ${scene.id.slice(0, 8)}`}
                >
                  {isNearest && <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                  <span className="truncate max-w-[100px]">
                    {scene.room_name || `Scene ${scene.id.slice(0, 8)}`}
                  </span>
                  {isSameFloor && (
                    <span className="text-[10px] text-gray-500">F{scene.floor}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Scene Info */}
      <div className="px-3 py-2 bg-gray-800/30 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400">
              {currentScene.room_name || `Scene ${currentScene.id.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Floor {currentScene.floor}</span>
            {nearestScene && nearestScene.id !== currentScene.id && (
              <span className="text-gray-600">•</span>
            )}
            {nearestScene && nearestScene.id !== currentScene.id && (
              <span className="text-gray-500">
                Nearest: {nearestScene.room_name || `Scene ${nearestScene.id.slice(0, 8)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Breadcrumbs;