import { useEffect, useState } from 'react';
import { useAIStore } from '@/stores/aiStore';
import { AITag } from '@/types';

interface AITagOverlayProps {
  tags: AITag[];
  visible?: boolean;
  onTagClick?: (tag: AITag) => void;
}

function AITagOverlay({ tags, visible = true, onTagClick }: AITagOverlayProps) {
  if (!visible || tags.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            left: tag.bounding_box ? `${tag.bounding_box.x}%` : '50%',
            top: tag.bounding_box ? `${tag.bounding_box.y}%` : '50%',
          }}
          onClick={() => onTagClick?.(tag)}
        >
          {/* Tag marker */}
          <div className="relative">
            <div className="w-8 h-8 bg-primary-600/80 rounded-full flex items-center justify-center border-2 border-white/50 hover:bg-primary-500 transition-colors">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
              <div className="bg-black/90 text-white px-3 py-2 rounded-lg whitespace-nowrap text-sm">
                <div className="font-semibold">{tag.object_type}</div>
                <div className="text-xs text-gray-300">
                  Confidence: {Math.round(tag.confidence * 100)}%
                </div>
                {tag.tags && tag.tags.length > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {tag.tags.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AITagOverlay;
