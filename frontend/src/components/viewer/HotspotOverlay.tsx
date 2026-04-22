interface HotspotOverlayProps {
  onSceneChange?: (sceneId: string) => void;
}

function HotspotOverlay({ onSceneChange }: HotspotOverlayProps) {
  // TODO: Implement hotspot rendering based on navigation edges
  // Will be fully implemented in Module 5
  
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
        Hotspots will appear here
      </div>
    </div>
  );
}

export default HotspotOverlay;
