import { useState } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { AITag } from '@/types';

interface TagEditorProps {
  tag: AITag;
  onSave: (tagId: string, updates: Partial<AITag>) => void;
  onDelete: (tagId: string) => void;
  onClose: () => void;
}

function TagEditor({ tag, onSave, onDelete, onClose }: TagEditorProps) {
  const [objectType, setObjectType] = useState(tag.object_type);
  const [tags, setTags] = useState(tag.tags?.join(', ') || '');
  const [confidence, setConfidence] = useState(tag.confidence);

  const handleSave = () => {
    onSave(tag.id, {
      object_type: objectType,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      confidence,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Tag size={20} className="text-primary-500" />
            <h3 className="text-lg font-semibold text-white">Edit AI Tag</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Object Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Object Type
            </label>
            <input
              type="text"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Confidence */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confidence: {Math.round(confidence * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
              placeholder="e.g., furniture, wood, modern"
            />
          </div>

          {/* Original Bounding Box */}
          {tag.bounding_box && (
            <div className="text-xs text-gray-500">
              Location: ({tag.bounding_box.x}%, {tag.bounding_box.y}%)
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={() => onDelete(tag.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default TagEditor;
