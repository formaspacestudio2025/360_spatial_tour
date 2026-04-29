import { useViewerStore } from '@/stores/viewerStore';
import { Maximize, Grid, Eye, EyeOff } from 'lucide-react';

function NavigationControls() {
  const showHotspots = useViewerStore((s) => s.showHotspots);
  const showGrid = useViewerStore((s) => s.showGrid);
  const toggleHotspots = useViewerStore((s) => s.toggleHotspots);
  const toggleGrid = useViewerStore((s) => s.toggleGrid);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2">
      <button
        onClick={toggleHotspots}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        title={showHotspots ? 'Hide hotspots' : 'Show hotspots'}
      >
        {showHotspots ? <Eye size={20} /> : <EyeOff size={20} />}
      </button>
      
      <button
        onClick={toggleGrid}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        title={showGrid ? 'Hide grid' : 'Show grid'}
      >
        <Grid size={20} />
      </button>
      
      <button
        onClick={() => document.documentElement.requestFullscreen?.()}
        className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        title="Fullscreen"
      >
        <Maximize size={20} />
      </button>
    </div>
  );
}

export default NavigationControls;
