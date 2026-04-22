import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MapPin, Tag } from 'lucide-react';

interface SceneNodeData {
  label: string;
  floor: string;
  thumbnail?: string;
  aiTagCount: number;
  scene: any;
}

interface SceneNodeProps {
  data: SceneNodeData;
  onClick?: (sceneId: string) => void;
}

export const SceneNode = memo(({ data, onClick }: SceneNodeProps) => {
  const handleClick = () => {
    onClick?.(data.scene.id);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-800 border-2 border-gray-700 hover:border-blue-500 rounded-lg shadow-lg cursor-pointer transition-all hover:shadow-xl min-w-[200px]"
    >
      <Handle type="target" position={Position.Top} />
      
      {/* Thumbnail */}
      {data.thumbnail && (
        <div className="h-24 w-full bg-gray-700 rounded-t-md overflow-hidden">
          <img
            src={data.thumbnail.startsWith('http') ? data.thumbnail : `http://localhost:3000${data.thumbnail}`}
            alt={data.label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-white truncate">{data.label}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <MapPin className="w-3 h-3" />
            <span>Floor {data.floor}</span>
          </div>
        </div>

        {/* AI Tags Badge */}
        {data.aiTagCount > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-900/30 border border-purple-700/50 rounded text-xs">
            <Tag className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300">{data.aiTagCount} AI tags</span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

SceneNode.displayName = 'SceneNode';
