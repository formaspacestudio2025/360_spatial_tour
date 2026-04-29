import { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Navigation2, Maximize2, Minimize2 } from 'lucide-react';
import { Scene } from '@/types';
import { useViewerStore } from '@/stores/viewerStore';

interface MinimapProps {
  scenes: Scene[];
  currentScene: Scene;
  currentFloor?: number;
  onSceneSelect?: (scene: Scene) => void;
  showAllFloors?: boolean;
  className?: string;
}

function Minimap({
  scenes,
  currentScene,
  currentFloor,
  onSceneSelect,
  showAllFloors = false,
  className = '',
}: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredScene, setHoveredScene] = useState<Scene | null>(null);
  const cameraRotation = useViewerStore((s) => s.cameraRotation);

  // Filter scenes by floor if not showing all floors
  const filteredScenes = showAllFloors
    ? scenes
    : scenes.filter(s => s.floor === (currentFloor ?? currentScene.floor));

  // Calculate scene positions for minimap
  const scenePositions = useCallback((): Array<{ scene: Scene; x: number; z: number }> => {
    if (filteredScenes.length === 0) return [];

    // Find min/max positions for normalization
    const xPositions = filteredScenes.map(s => s.position_x);
    const zPositions = filteredScenes.map(s => s.position_z);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const minZ = Math.min(...zPositions);
    const maxZ = Math.max(...zPositions);

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;

    return filteredScenes.map(scene => ({
      scene,
      x: ((scene.position_x - minX) / rangeX) * 0.8 + 0.1, // Normalize to 0.1-0.9 range
      z: ((scene.position_z - minZ) / rangeZ) * 0.8 + 0.1,
    }));
  }, [filteredScenes]);

  // Draw minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const positions = scenePositions();
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw scene connections (simple lines between nearby scenes)
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    positions.forEach((pos1, i) => {
      positions.forEach((pos2, j) => {
        if (i >= j) return;
        const distance = Math.sqrt(
          Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.z - pos2.z, 2)
        );
        if (distance < 0.3) { // Connect nearby scenes
          ctx.beginPath();
          ctx.moveTo(pos1.x * width, pos1.z * height);
          ctx.lineTo(pos2.x * width, pos2.z * height);
          ctx.stroke();
        }
      });
    });

    // Draw scenes
    positions.forEach(({ scene, x, z }) => {
      const isCurrent = scene.id === currentScene.id;
      const isHovered = hoveredScene?.id === scene.id;

      // Scene dot
      ctx.beginPath();
      ctx.arc(x * width, z * height, isCurrent ? 8 : 5, 0, Math.PI * 2);

      if (isCurrent) {
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        // Add glow effect for current scene
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (isHovered) {
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
      }

      // Scene label
      if (isCurrent || isHovered || isExpanded) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          scene.room_name || `Scene ${scene.id.slice(0, 4)}`,
          x * width,
          z * height - 12
        );
      }
    });

    // Draw user position and direction
    if (cameraRotation) {
      const currentPos = positions.find(p => p.scene.id === currentScene.id);
      if (currentPos) {
        const userX = currentPos.x * width;
        const userZ = currentPos.z * height;

        // Direction indicator
        const dirX = userX + Math.sin(-cameraRotation.yaw) * 15;
        const dirZ = userZ + Math.cos(-cameraRotation.yaw) * 15;

        ctx.beginPath();
        ctx.moveTo(userX, userZ);
        ctx.lineTo(dirX, dirZ);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // User position dot
        ctx.beginPath();
        ctx.arc(userX, userZ, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      }
    }
  }, [scenePositions, currentScene, cameraRotation, hoveredScene, isExpanded]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onSceneSelect) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const z = (e.clientY - rect.top) / rect.height;

    // Find closest scene
    const positions = scenePositions();
    let closestScene: Scene | null = null;
    let minDistance = Infinity;

    for (const { scene, x: sceneX, z: sceneZ } of positions) {
      const distance = Math.sqrt(Math.pow(x - sceneX, 2) + Math.pow(z - sceneZ, 2));
      if (distance < minDistance && distance < 0.15) { // Click threshold
        minDistance = distance;
        closestScene = scene;
      }
    }

    if (closestScene && closestScene.id && closestScene.id !== currentScene.id) {
      onSceneSelect(closestScene);
    }
  }, [scenePositions, currentScene, onSceneSelect]);

  // Handle canvas hover
  const handleCanvasHover = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const z = (e.clientY - rect.top) / rect.height;

    // Find closest scene
    const positions = scenePositions();
    let closestScene: Scene | null = null;
    let minDistance = Infinity;

    for (const { scene, x: sceneX, z: sceneZ } of positions) {
      const distance = Math.sqrt(Math.pow(x - sceneX, 2) + Math.pow(z - sceneZ, 2));
      if (distance < minDistance && distance < 0.15) {
        minDistance = distance;
        closestScene = scene;
      }
    }

    setHoveredScene(closestScene);
  }, [scenePositions]);

  const handleMouseLeave = useCallback(() => {
    setHoveredScene(null);
  }, []);

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-3 py-2 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary-500" />
          <span className="text-white text-xs font-medium">Minimap</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Canvas */}
      <div
        className={`relative ${isExpanded ? 'h-64' : 'h-32'}`}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={isExpanded ? 256 : 128}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasHover}
          onMouseLeave={handleMouseLeave}
        />

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span>Other</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>You</span>
            </div>
          </div>
        </div>

        {/* Floor indicator */}
        {!showAllFloors && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-gray-400">
            Floor {currentFloor ?? currentScene.floor}
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredScene && hoveredScene.id !== currentScene.id && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm rounded px-3 py-1.5 text-xs text-white whitespace-nowrap pointer-events-none">
            {hoveredScene.room_name || `Scene ${hoveredScene.id.slice(0, 8)}`}
            <div className="text-[10px] text-gray-400 mt-0.5">Click to navigate</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Minimap;