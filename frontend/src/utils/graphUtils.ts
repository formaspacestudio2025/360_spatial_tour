import { Node, Edge } from '@xyflow/react';
import { Hotspot } from '../api/hotspots';

interface Scene {
  id: string;
  room_name?: string;
  floor?: string;
  thumbnail_url?: string;
  image_path: string;
  ai_tags_count?: number;
}

export function scenesToNodes(scenes: Scene[]): Node[] {
  const floorGroups: Record<string, Scene[]> = {};
  
  // Group scenes by floor
  scenes.forEach((scene) => {
    const floor = scene.floor || '1';
    if (!floorGroups[floor]) {
      floorGroups[floor] = [];
    }
    floorGroups[floor].push(scene);
  });

  const nodes: Node[] = [];
  const floorKeys = Object.keys(floorGroups).sort();
  const nodeSpacing = 300;
  const floorSpacing = 400;

  floorKeys.forEach((floorKey, floorIndex) => {
    const floorScenes = floorGroups[floorKey];
    
    floorScenes.forEach((scene, sceneIndex) => {
      nodes.push({
        id: scene.id,
        type: 'sceneNode',
        position: {
          x: sceneIndex * nodeSpacing,
          y: floorIndex * floorSpacing,
        },
        data: {
          label: scene.room_name || `Scene ${sceneIndex + 1}`,
          floor: floorKey,
          thumbnail: scene.thumbnail_url || scene.image_path,
          aiTagCount: scene.ai_tags_count || 0,
          scene,
        },
      });
    });
  });

  return nodes;
}

export function hotspotsToEdges(hotspots: Hotspot[]): Edge[] {
  return hotspots
    .filter((h) => h.to_scene_id)
    .map((hotspot, index) => ({
      id: `edge-${hotspot.id}`,
      source: hotspot.from_scene_id,
      target: hotspot.to_scene_id!,
      label: hotspot.label || undefined,
      type: 'smoothstep',
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      animated: true,
    }));
}

export function autoLayoutNodes(nodes: Node[], direction: 'horizontal' | 'vertical' = 'horizontal'): Node[] {
  const floorGroups: Record<string, Node[]> = {};
  
  nodes.forEach((node) => {
    const floor = (node.data as any).floor || '1';
    if (!floorGroups[floor]) {
      floorGroups[floor] = [];
    }
    floorGroups[floor].push(node);
  });

  const floorKeys = Object.keys(floorGroups).sort();
  const nodeSpacing = 300;
  const floorSpacing = 400;

  const updatedNodes = nodes.map((node) => {
    const floor = (node.data as any).floor || '1';
    const floorIndex = floorKeys.indexOf(floor);
    const floorNodes = floorGroups[floor];
    const nodeIndex = floorNodes.indexOf(node);

    if (direction === 'horizontal') {
      return {
        ...node,
        position: {
          x: nodeIndex * nodeSpacing,
          y: floorIndex * floorSpacing,
        },
      };
    } else {
      return {
        ...node,
        position: {
          x: floorIndex * floorSpacing,
          y: nodeIndex * nodeSpacing,
        },
      };
    }
  });

  return updatedNodes;
}
