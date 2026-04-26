import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';
import Sphere360 from './Sphere360';
import HotspotMarker from './HotspotMarker';
import IssueMarker from './IssueMarker';
import AssetMarker from './AssetMarker';
import NadirPatch from './NadirPatch';
import { AITagMarker } from '../ai/AITagMarker';
import { useHotspotStore } from '@/stores/hotspotStore';
import { useAITagStore } from '@/stores/aiTagStore';
import { Hotspot } from '@/api/hotspots';
import { AITag } from '@/api/ai';
import { Issue } from '@/types/issue';
import { Asset } from '@/types';
import { Maximize2, Minimize2, ZoomIn, Loader2, Eye, EyeOff } from 'lucide-react';

interface Viewer360Props {
  imageUrl: string;
  hotspots?: Hotspot[];
  aiTags?: AITag[];
  issueMarkers?: Issue[];
  assetMarkers?: Asset[];
  onSceneChange?: (sceneId: string, orientation?: { yaw: number; pitch: number }) => void;
  onPlaceHotspot?: (yaw: number, pitch: number) => void;
  onPlaceIssue?: (yaw: number, pitch: number) => void;
  isPlacingIssue?: boolean;
  nadirImage?: string; // NEW: Nadir patch image URL
  nadirScale?: number; // NEW: Nadir patch scale (default 1.0)
  nadirRotation?: number; // NEW: Nadir image rotation in degrees (default 0)
  nadirOpacity?: number; // NEW: Nadir image opacity 0-1 (default 1.0)
  initialOrientation?: { yaw: number; pitch: number } | null;
  transitionStyle?: string;
      isPlacingAsset?: boolean;
      onPlaceAsset?: (yaw: number, pitch: number) => void;
}

function SceneContent({
  imageUrl,
  hotspots,
  aiTags,
  issueMarkers,
  assetMarkers,
  onSceneChange,
  onPlaceHotspot,
  onPlaceIssue,
  onPlaceAsset,
  isPlacingIssue,
  isPlacingAsset,
  nadirImage,
  nadirScale,
  nadirRotation,
  nadirOpacity,
  targetFov,
}: {
  imageUrl: string;
  hotspots?: Hotspot[];
  aiTags?: AITag[];
  issueMarkers?: Issue[];
  assetMarkers?: Asset[];
  onSceneChange?: (sceneId: string, orientation?: { yaw: number; pitch: number }) => void;
  onPlaceHotspot?: (yaw: number, pitch: number) => void;
  onPlaceIssue?: (yaw: number, pitch: number) => void;
  onPlaceAsset?: (yaw: number, pitch: number) => void;
  isPlacingIssue?: boolean;
  isPlacingAsset?: boolean;
  nadirImage?: string;
  nadirScale?: number;
  nadirRotation?: number;
  nadirOpacity?: number;
  targetFov: number;
}) {
  const { camera, raycaster, scene } = useThree();
  const isPlacing = useHotspotStore((s) => s.isPlacingHotspot);
  const { showTags, getFilteredTags } = useAITagStore();
  const sphereRef = useRef<THREE.Mesh>(null);

  const filteredTags = aiTags ? getFilteredTags() : [];
  const persCamera = camera as unknown as PerspectiveCamera;

  console.log('SceneContent rendering with hotspots:', hotspots);

  // Handle zoom via scroll - changes camera FOV for 360 viewer
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const fovDelta = e.deltaY * 0.05;
      const newFov = Math.max(30, Math.min(100, persCamera.fov + fovDelta));
      persCamera.fov = newFov;
      persCamera.updateProjectionMatrix();
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [persCamera]);

  // Enterprise Transition: Smooth FOV animation
  useFrame((_, delta) => {
    if (Math.abs(persCamera.fov - targetFov) > 0.1) {
      persCamera.fov = THREE.MathUtils.lerp(persCamera.fov, targetFov, delta * 8);
      persCamera.updateProjectionMatrix();
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      const placingHotspot = isPlacing && onPlaceHotspot;
      const placingIssue = (isPlacingIssue ?? false) && onPlaceIssue;
    const placingAsset = (isPlacingAsset ?? false) && onPlaceAsset;
      if (!placingHotspot && !placingIssue && !placingAsset) return;
      e.stopPropagation();

      // Raycast against the sphere
      raycaster.setFromCamera(e.pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const intersect of intersects) {
        // Check if we hit the sphere (large radius ~500)
        const dist = intersect.point.length();
        if (dist > 400) {
          const p = intersect.point.clone().normalize();
          // Convert to yaw/pitch
          const yaw = Math.atan2(p.x, p.z);
          const pitch = Math.asin(Math.max(-1, Math.min(1, p.y)));
          if (placingHotspot && onPlaceHotspot) {
            onPlaceHotspot(yaw, pitch);
          } else if (placingIssue && onPlaceIssue) {
            onPlaceIssue(yaw, pitch);
          } else if (placingAsset && onPlaceAsset) {
            onPlaceAsset(yaw, pitch);
          }
          break;
        }
      }
    },
    [isPlacing, isPlacingIssue, isPlacingAsset, onPlaceHotspot, onPlaceIssue, onPlaceAsset, camera, raycaster, scene]
  );

  return (
    <group onClick={handleClick}>
      <Sphere360 imageUrl={imageUrl} />
      {hotspots?.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          onNavigate={(id, orientation) => onSceneChange && onSceneChange(id, orientation)}
        />
      ))}
      {showTags && filteredTags.map((tag) => (
        <AITagMarker key={tag.id} tag={tag} />
      ))}
      {issueMarkers?.map((issue) => (
        <IssueMarker key={issue.id} issue={issue} />
      ))}
      {assetMarkers?.map((asset) => (
        <AssetMarker key={asset.id} asset={asset} />
      ))}
      {/* NEW: Nadir Patch */}
      {nadirImage && (
        <NadirPatch
          imageUrl={nadirImage}
          scale={nadirScale || 1.0}
          rotation={nadirRotation || 0}
          opacity={nadirOpacity || 1.0}
        />
      )}
    </group>
  );
}

function Viewer360({
  imageUrl,
  hotspots,
  aiTags,
  issueMarkers,
  assetMarkers,
  onSceneChange,
  onPlaceHotspot,
  onPlaceIssue,
  onPlaceAsset,
  isPlacingIssue,
  isPlacingAsset,
  nadirImage,
  nadirScale,
  nadirRotation,
  nadirOpacity,
  initialOrientation,
  transitionStyle = 'zoom-fade'
}: Viewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [targetFov, setTargetFov] = useState(75);
  const isPlacing = useHotspotStore((s) => s.isPlacingHotspot);
  const { showTags, toggleVisibility } = useAITagStore();

  console.log('Viewer360 received imageUrl:', imageUrl);

  // Handle image transitions
  useEffect(() => {
    if (imageUrl !== currentImage) {
      console.log('Loading new scene:', imageUrl, 'with transition:', transitionStyle);
      
      const isInstant = transitionStyle === 'instant';
      const isZoom = transitionStyle === 'zoom-fade';
      const isPan = transitionStyle === 'pan-slide';
      
      if (!isInstant) {
        setOpacity(0);
      }
      
      if (isZoom) {
        setTargetFov(40);
      } else if (isPan) {
        // Pan slightly by moving the controls later, for now just fade
      }
      
      setIsLoading(true);
      
      const delay = isInstant ? 0 : 150;
      
      const timer = setTimeout(() => {
        setCurrentImage(imageUrl);
        // Fade in after image loads
        const img = new Image();
        img.onload = () => {
          console.log('Scene loaded successfully');
          // Apply orientation before fading in
          if (initialOrientation && controlsRef.current) {
            // Apply pan offset if pan-slide
            const panOffset = isPan ? 0.5 : 0;
            controlsRef.current.setAzimuthalAngle(-initialOrientation.yaw + panOffset);
            controlsRef.current.setPolarAngle(Math.PI / 2 - initialOrientation.pitch);
            controlsRef.current.update();
            
            // If pan-slide, smoothly animate the pan after loading
            if (isPan) {
              setTimeout(() => {
                if (controlsRef.current) {
                  // Smoothly animate to correct yaw
                  // This is a quick hack: since enableDamping is true, setting it will animate if we do it right?
                  // Actually, just setting it will jump. For a real pan, we'd need useFrame. 
                  // But just returning it to the exact yaw works if we let damping handle it or just set it.
                  controlsRef.current.setAzimuthalAngle(-initialOrientation.yaw);
                  controlsRef.current.update();
                }
              }, 50);
            }
          }
          setIsLoading(false);
          setOpacity(1);
          setTargetFov(75);
        };
        img.onerror = () => {
          console.error('Failed to load scene image:', imageUrl);
          setIsLoading(false);
          setOpacity(1);
          setTargetFov(75);
        };
        img.src = imageUrl;
      }, delay);

      return () => clearTimeout(timer);
    } else {
      const img = new Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => setIsLoading(false);
      img.src = imageUrl;
    }
  }, [imageUrl, currentImage]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative bg-black ${isPlacing || isPlacingIssue || isPlacingAsset ? 'cursor-crosshair' : 'cursor-grab'}`}
    >
      {/* Loading overlay */}
      {(isLoading || opacity < 1) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <span className="text-white text-sm">Loading scene...</span>
            <div className="w-48 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${opacity * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Placing mode indicator */}
      {isPlacing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-lg text-sm font-medium">
          Click on the scene to place hotspot
        </div>
      )}
      {isPlacingIssue && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-2 rounded-lg text-sm font-medium">
          Click on the scene to place issue pin
        </div>
      )}

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-1.5 flex items-center gap-1">
          <ZoomIn size={16} className="text-gray-400" />
          <span className="text-xs text-gray-400">Scroll to zoom</span>
        </div>
        {aiTags && aiTags.length > 0 && (
          <button
            onClick={toggleVisibility}
            className={`p-2 backdrop-blur-sm rounded-lg transition-colors ${
              showTags ? 'bg-blue-600/50 text-white hover:bg-blue-600/70' : 'bg-black/50 text-gray-400 hover:bg-black/70'
            }`}
            title={showTags ? 'Hide AI tags' : 'Show AI tags'}
          >
            {showTags ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <Canvas
        camera={{
          fov: 75,
          position: [0, 0, 0.1],
          near: 0.1,
          far: 2000,
        }}
        style={{ background: '#000' }}
      >
        <Suspense fallback={null}>
          <group>
            <SceneContent
              imageUrl={currentImage}
              hotspots={hotspots}
              aiTags={aiTags}
              issueMarkers={issueMarkers}
              assetMarkers={assetMarkers}
              onSceneChange={onSceneChange}
              onPlaceHotspot={onPlaceHotspot}
              onPlaceIssue={onPlaceIssue}
              onPlaceAsset={onPlaceAsset}
              isPlacingIssue={isPlacingIssue}
              isPlacingAsset={isPlacingAsset}
              nadirImage={nadirImage}
              nadirScale={nadirScale}
              nadirRotation={nadirRotation}
              nadirOpacity={nadirOpacity}
              targetFov={targetFov}
            />
          </group>
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.5}
          minPolarAngle={0.01}
          maxPolarAngle={Math.PI - 0.01}
          // For 360 viewer, zoom changes FOV, not camera distance
          minDistance={1}
          maxDistance={1}
          zoomSpeed={1.0}
          enableDamping={true}
          dampingFactor={0.1}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}

export default Viewer360;
