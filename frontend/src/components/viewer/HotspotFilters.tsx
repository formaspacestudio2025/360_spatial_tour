import { useState, useMemo } from 'react';
import { Filter, X, Navigation2, Info, AlertTriangle, Image, FileText, Settings } from 'lucide-react';
import { Hotspot, HotspotCategory } from '@/api/hotspots';

interface HotspotFiltersProps {
  hotspots: Hotspot[];
  selectedCategories: HotspotCategory[];
  onCategoryToggle: (category: HotspotCategory) => void;
  onClearAll: () => void;
  className?: string;
}

const CATEGORY_CONFIG: Record<HotspotCategory, { label: string; icon: any; color: string }> = {
  navigation: { label: 'Navigation', icon: Navigation2, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  information: { label: 'Information', icon: Info, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  warning: { label: 'Warning', icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  issue: { label: 'Issue', icon: AlertTriangle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  media: { label: 'Media', icon: Image, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  document: { label: 'Document', icon: FileText, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  custom: { label: 'Custom', icon: Settings, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

function HotspotFilters({
  hotspots,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
  className = '',
}: HotspotFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count hotspots by category
  const categoryCounts = useMemo(() => {
    const counts: Record<HotspotCategory, number> = {
      navigation: 0,
      information: 0,
      warning: 0,
      issue: 0,
      media: 0,
      document: 0,
      custom: 0,
    };

    hotspots.forEach(hotspot => {
      const category = hotspot.category || 'navigation'; // Default to navigation
      if (counts[category] !== undefined) {
        counts[category]++;
      }
    });

    return counts;
  }, [hotspots]);

  // Get available categories (those with at least one hotspot)
  const availableCategories = useMemo(() => {
    return Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .map(([category]) => category as HotspotCategory);
  }, [categoryCounts]);

  // Get total filtered count
  const filteredCount = useMemo(() => {
    if (selectedCategories.length === 0) {
      return hotspots.length;
    }
    return hotspots.filter(h =>
      selectedCategories.includes(h.category || 'navigation')
    ).length;
  }, [hotspots, selectedCategories]);

  const handleCategoryClick = (category: HotspotCategory) => {
    onCategoryToggle(category);
  };

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-primary-500" />
          <span className="text-white font-medium text-sm">Hotspot Filters</span>
          {selectedCategories.length > 0 && (
            <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full">
              {selectedCategories.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedCategories.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
              title="Clear all filters"
            >
              <X size={14} />
            </button>
          )}
          <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-400">
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </button>

      {/* Filter Options */}
      {isExpanded && (
        <div className="p-3 space-y-2">
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
            <span>Showing {filteredCount} of {hotspots.length} hotspots</span>
            {selectedCategories.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {availableCategories.map((category) => {
              const config = CATEGORY_CONFIG[category];
              const count = categoryCounts[category];
              const isSelected = selectedCategories.includes(category);
              const Icon = config.icon;

              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`p-3 rounded-lg text-left transition-colors border ${
                    isSelected
                      ? config.color
                      : 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className={isSelected ? '' : 'text-gray-500'} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="text-xs opacity-70">
                    {count} hotspot{count !== 1 ? 's' : ''}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={() => {
                // Select all available categories
                availableCategories.forEach(cat => {
                  if (!selectedCategories.includes(cat)) {
                    onCategoryToggle(cat);
                  }
                });
              }}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => {
                // Deselect all
                selectedCategories.forEach(cat => {
                  onCategoryToggle(cat);
                });
              }}
              className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotspotFilters;