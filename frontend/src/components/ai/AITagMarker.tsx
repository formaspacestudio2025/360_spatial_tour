import { useRef, useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AITag } from '../../api/ai';
import { useAITagStore, TagCategory } from '../../stores/aiTagStore';
import { Eye, EyeOff, AlertTriangle, Box, Wind, Hammer, Home, Armchair } from 'lucide-react';

function yawPitchToPosition(yaw: number, pitch: number, radius: number = 10): THREE.Vector3 {
  const y = Math.sin(pitch) * radius;
  const rProj = Math.cos(pitch) * radius;
  const x = Math.sin(yaw) * rProj;
  const z = Math.cos(yaw) * rProj;
  return new THREE.Vector3(x, y, z);
}

function getConfidenceColor(confidence: number): string {
  if (confidence > 0.7) return '#22c55e';
  if (confidence > 0.4) return '#eab308';
  return '#ef4444';
}

function getCategoryIcon(category: TagCategory) {
  switch (category) {
    case 'structural': return Home;
    case 'furniture': return Armchair;
    case 'safety': return AlertTriangle;
    case 'hvac': return Wind;
    case 'damage': return Hammer;
    default: return Box;
  }
}

interface AITagMarkerProps {
  tag: AITag;
  radius?: number;
}

export function AITagMarker({ tag, radius = 10 }: AITagMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const { selectTag, selectedTag, getTagCategory } = useAITagStore();
  const category = getTagCategory(tag);
  const Icon = getCategoryIcon(category);
  
  const position = useMemo(() => {
    if (tag.bounding_box) {
      const bbox = tag.bounding_box;
      const yaw = ((bbox.x + bbox.width / 2) / 100) * Math.PI * 2 - Math.PI;
      const pitch = Math.PI / 2 - ((bbox.y + bbox.height / 2) / 100) * Math.PI;
      return yawPitchToPosition(yaw, pitch, radius);
    }
    return new THREE.Vector3(0, 0, -radius);
  }, [tag.bounding_box, radius]);

  const isSelected = selectedTag?.id === tag.id;
  const confidenceColor = getConfidenceColor(tag.confidence);

  return (
    <group position={position}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          selectTag(tag);
        }}
      >
        <sphereGeometry args={[isSelected ? 0.25 : 0.2, 16, 16]} />
        <meshStandardMaterial
          color={confidenceColor}
          emissive={confidenceColor}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
        />
      </mesh>

      {hovered && (
        <Html center distanceFactor={8}>
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: confidenceColor }} />
                <span className="font-semibold text-white text-sm capitalize">{tag.object_type}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectTag(tag);
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  {isSelected ? <EyeOff className="w-3 h-3 text-blue-400" /> : <Eye className="w-3 h-3 text-blue-400" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>Confidence:</span>
                <span style={{ color: confidenceColor }} className="font-semibold">
                  {Math.round(tag.confidence * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Category:</span>
                <span className="capitalize">{category}</span>
              </div>
              {tag.tags && tag.tags.length > 0 && (
                <div className="text-gray-300">
                  <span className="block mb-1">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {tag.tags.map((t, i) => (
                      <span key={i} className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
