import { Scene, NavigationEdge } from '@/types';

/**
 * Calculate distance between two scenes based on their 3D positions
 */
export function calculateSceneDistance(scene1: Scene, scene2: Scene): number {
  const dx = scene1.position_x - scene2.position_x;
  const dy = scene1.position_y - scene2.position_y;
  const dz = scene1.position_z - scene2.position_z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Find the nearest scene to the current scene
 */
export function findNearestScene(
  currentScene: Scene,
  allScenes: Scene[],
  excludeSceneId?: string
): Scene | null {
  const filteredScenes = excludeSceneId
    ? allScenes.filter(s => s.id !== excludeSceneId)
    : allScenes;

  if (filteredScenes.length === 0) return null;

  let nearestScene = filteredScenes[0];
  let minDistance = calculateSceneDistance(currentScene, filteredScenes[0]);

  for (let i = 1; i < filteredScenes.length; i++) {
    const distance = calculateSceneDistance(currentScene, filteredScenes[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearestScene = filteredScenes[i];
    }
  }

  return nearestScene;
}

/**
 * Find all scenes connected to the current scene via hotspots
 */
export function findConnectedScenes(
  currentSceneId: string,
  navigationEdges: NavigationEdge[],
  scenes: Scene[]
): Scene[] {
  const connectedSceneIds = new Set<string>();

  navigationEdges.forEach(edge => {
    if (edge.from_scene_id === currentSceneId) {
      connectedSceneIds.add(edge.to_scene_id);
    } else if (edge.to_scene_id === currentSceneId) {
      connectedSceneIds.add(edge.from_scene_id);
    }
  });

  return Array.from(connectedSceneIds)
    .map(id => scenes.find(s => s.id === id))
    .filter((s): s is Scene => s !== undefined);
}

/**
 * Build a breadcrumb trail from start scene to current scene
 * Uses BFS to find the shortest path
 */
export function buildBreadcrumbTrail(
  startSceneId: string,
  currentSceneId: string,
  scenes: Scene[],
  navigationEdges: NavigationEdge[]
): Scene[] {
  if (startSceneId === currentSceneId) {
    const startScene = scenes.find(s => s.id === startSceneId);
    return startScene ? [startScene] : [];
  }

  // Build adjacency list
  const adjacency = new Map<string, string[]>();
  scenes.forEach(scene => {
    adjacency.set(scene.id, []);
  });

  navigationEdges.forEach(edge => {
    const fromList = adjacency.get(edge.from_scene_id) || [];
    const toList = adjacency.get(edge.to_scene_id) || [];
    fromList.push(edge.to_scene_id);
    toList.push(edge.from_scene_id);
    adjacency.set(edge.from_scene_id, fromList);
    adjacency.set(edge.to_scene_id, toList);
  });

  // BFS to find shortest path
  const queue: { sceneId: string; path: Scene[] }[] = [
    { sceneId: startSceneId, path: [scenes.find(s => s.id === startSceneId)!] }
  ];
  const visited = new Set<string>([startSceneId]);

  while (queue.length > 0) {
    const { sceneId, path } = queue.shift()!;

    if (sceneId === currentSceneId) {
      return path;
    }

    const neighbors = adjacency.get(sceneId) || [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const neighborScene = scenes.find(s => s.id === neighborId);
        if (neighborScene) {
          queue.push({
            sceneId: neighborId,
            path: [...path, neighborScene]
          });
        }
      }
    }
  }

  // No path found, return just the current scene
  const currentScene = scenes.find(s => s.id === currentSceneId);
  return currentScene ? [currentScene] : [];
}

/**
 * Get suggested scenes for navigation (nearest and connected)
 */
export function getSuggestedScenes(
  currentScene: Scene,
  allScenes: Scene[],
  navigationEdges: NavigationEdge[],
  maxSuggestions: number = 3
): Scene[] {
  const suggestions: Scene[] = [];

  // Add connected scenes first
  const connectedScenes = findConnectedScenes(currentScene.id, navigationEdges, allScenes);

  suggestions.push(...connectedScenes);

  // Add nearest scenes if we need more suggestions
  if (suggestions.length < maxSuggestions) {
    const remainingScenes = allScenes.filter(
      s => !suggestions.find(sug => sug.id === s.id) && s.id !== currentScene.id
    );

    // Sort by distance and add the closest ones
    remainingScenes.sort((a, b) =>
      calculateSceneDistance(currentScene, a) - calculateSceneDistance(currentScene, b)
    );

    const needed = maxSuggestions - suggestions.length;
    suggestions.push(...remainingScenes.slice(0, needed));
  }

  return suggestions.slice(0, maxSuggestions);
}

/**
 * Check if two scenes are on the same floor
 */
export function areOnSameFloor(scene1: Scene, scene2: Scene): boolean {
  return scene1.floor === scene2.floor;
}

/**
 * Find scenes on the same floor
 */
export function findScenesOnSameFloor(
  currentScene: Scene,
  allScenes: Scene[]
): Scene[] {
  return allScenes.filter(s => s.floor === currentScene.floor && s.id !== currentScene.id);
}