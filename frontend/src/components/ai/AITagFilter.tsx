import { useAITagStore, TagCategory } from '../../stores/aiTagStore';
import { AlertTriangle, Box, Wind, Hammer, Home, Armchair, Eye, EyeOff } from 'lucide-react';

const CATEGORIES: { key: TagCategory; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: Box },
  { key: 'structural', label: 'Structural', icon: Home },
  { key: 'furniture', label: 'Furniture', icon: Armchair },
  { key: 'safety', label: 'Safety', icon: AlertTriangle },
  { key: 'hvac', label: 'HVAC', icon: Wind },
  { key: 'damage', label: 'Damage', icon: Hammer },
];

interface AITagFilterProps {
  compact?: boolean;
}

export function AITagFilter({ compact = false }: AITagFilterProps) {
  const { filterCategory, setFilter, showTags, toggleVisibility, confidenceThreshold, setConfidenceThreshold, getTagCountsByCategory } = useAITagStore();
  const counts = getTagCountsByCategory();

  return (
    <div className="space-y-4">
      {/* Show/Hide Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">AI Tags</span>
        <button
          onClick={toggleVisibility}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showTags
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {showTags ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showTags ? 'Visible' : 'Hidden'}</span>
          </div>
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Filter by Category</label>
        <div className={`grid ${compact ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
          {CATEGORIES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterCategory === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <span className={`ml-auto text-[10px] ${filterCategory === key ? 'text-blue-200' : 'text-gray-500'}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Min Confidence</label>
          <span className="text-xs font-semibold text-gray-200">{Math.round(confidenceThreshold * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={confidenceThreshold}
          onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
