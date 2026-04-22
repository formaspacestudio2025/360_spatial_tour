import { ZoomIn, ZoomOut, Maximize, LayoutGrid, LayoutList } from 'lucide-react';

interface GraphToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onAutoLayout: (direction: 'horizontal' | 'vertical') => void;
  layoutDirection: 'horizontal' | 'vertical';
}

export function GraphToolbar({
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutoLayout,
  layoutDirection,
}: GraphToolbarProps) {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-1.5 flex items-center gap-1">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onFitView}
          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
          title="Fit view"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-1.5 flex items-center gap-1">
        <button
          onClick={() => onAutoLayout('horizontal')}
          className={`p-2 rounded transition-colors ${
            layoutDirection === 'horizontal'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
          title="Horizontal layout"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAutoLayout('vertical')}
          className={`p-2 rounded transition-colors ${
            layoutDirection === 'vertical'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
          title="Vertical layout"
        >
          <LayoutList className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
