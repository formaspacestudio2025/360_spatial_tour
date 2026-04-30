import { useRef, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Hotspot } from '@/api/hotspots';
import { useHotspotStore } from '@/stores/hotspotStore';
import { useAuthStore } from '@/stores/authStore';
import AnimatedHotspot from './AnimatedHotspot';
import PinPrompt from './PinPrompt';
import {
  Navigation2, Info, AlertTriangle, AlertCircle, Image, Video, FileText, Link, Music, X, ExternalLink,
  Download, Eye, Copy, Check, Maximize2, Layers, MapPin, Tag, MessageSquare, ClipboardList,
  Ruler, Camera, Zap, Shield, AlertOctagon, Bookmark, Lock
} from 'lucide-react';

interface HotspotMarkerProps {
  hotspot: Hotspot;
  onNavigate: (sceneId: string, orientation?: { yaw: number; pitch: number }, transitionStyle?: string) => void;
}

function yawPitchToPosition(yaw: number, pitch: number, radius: number = 10): THREE.Vector3 {
  const y = Math.sin(pitch) * radius;
  const rProj = Math.cos(pitch) * radius;
  const x = Math.sin(yaw) * rProj;
  const z = Math.cos(yaw) * rProj;
  return new THREE.Vector3(x, y, z);
}

// Helper to get icon based on hotspot type - Enterprise Level
function getHotspotIcon(iconType?: string) {
  const iconProps = { size: 12 };
  
  switch (iconType) {
    // Navigation & Structure
    case 'navigation':
      return <Navigation2 {...iconProps} className="text-emerald-400" />;
    case 'floor':
      return <Layers {...iconProps} className="text-blue-400" />;
    case 'room':
      return <MapPin {...iconProps} className="text-cyan-400" />;
    
    // Information & Annotation
    case 'info':
      return <Info {...iconProps} className="text-blue-400" />;
    case 'note':
      return <MessageSquare {...iconProps} className="text-yellow-400" />;
    case 'tag':
      return <Tag {...iconProps} className="text-purple-400" />;
    case 'checklist':
      return <ClipboardList {...iconProps} className="text-green-400" />;
    
    // Alerts & Issues
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-yellow-400" />;
    case 'issue':
      return <AlertCircle {...iconProps} className="text-red-400" />;
    case 'critical':
      return <AlertOctagon {...iconProps} className="text-red-500" />;
    case 'safety':
      return <Shield {...iconProps} className="text-orange-400" />;
    
    // Media & Content
    case 'image':
      return <Image {...iconProps} className="text-purple-400" />;
    case 'video':
      return <Video {...iconProps} className="text-pink-400" />;
    case 'audio':
      return <Music {...iconProps} className="text-indigo-400" />;
    case 'document':
    case 'pdf':
      return <FileText {...iconProps} className="text-orange-400" />;
    case 'url':
      return <Link {...iconProps} className="text-cyan-400" />;
    
    // Measurement & Technical
    case 'measurement':
      return <Ruler {...iconProps} className="text-teal-400" />;
    case 'photo-point':
      return <Camera {...iconProps} className="text-pink-400" />;
    case 'electrical':
      return <Zap {...iconProps} className="text-yellow-400" />;
    
    // Bookmark & Favorite
    case 'bookmark':
      return <Bookmark {...iconProps} className="text-amber-400" />;
    
    // Default
    default:
      return <Navigation2 {...iconProps} className="text-emerald-400" />;
  }
}

function HotspotMarker({ hotspot, onNavigate }: HotspotMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quickViewUrl, setQuickViewUrl] = useState<string | null>(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinError, setPinError] = useState('');
  const selectedHotspot = useHotspotStore((s) => s.selectedHotspot);
  const { user } = useAuthStore();
  const isSelected = selectedHotspot?.id === hotspot.id;

  const position = yawPitchToPosition(hotspot.yaw, hotspot.pitch, 10);

  // Check if user has permission to access this hotspot
  const hasPermission = () => {
    if (!hotspot.required_role) return true; // No restriction

    const roleHierarchy: Record<string, number> = {
      viewer: 1,
      editor: 2,
      manager: 3,
      admin: 4
    };

    const userLevel = user ? roleHierarchy[user.role] || 0 : 0;
    const requiredLevel = roleHierarchy[hotspot.required_role] || 0;

    return userLevel >= requiredLevel;
  };

  // Verify PIN (placeholder - in real app, this would verify against backend)
  const verifyPin = (pin: string) => {
    // For demo purposes, accept any 4-digit PIN
    // In production, this should call an API endpoint
    if (pin.length === 4) {
      setShowPinPrompt(false);
      setPinError('');
      return true;
    }
    setPinError('Invalid PIN');
    return false;
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Pulse animation
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      meshRef.current.scale.setScalar(scale);
      // Billboard - always face camera
      meshRef.current.lookAt(0, 0, 0);
      meshRef.current.rotateY(Math.PI);
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (useHotspotStore.getState().isPlacingHotspot) return;

    // Check permissions first
    if (!hasPermission()) {
      setShowPinPrompt(true);
      return;
    }

    // If hotspot has media, show media overlay
    if (hotspot.media_type && hotspot.media_url) {
      setShowMedia(true);
      return;
    }

    // Otherwise navigate
    const orientation = (hotspot.target_yaw !== undefined && hotspot.target_pitch !== undefined)
      ? { yaw: hotspot.target_yaw, pitch: hotspot.target_pitch }
      : undefined;

    const transitionStyle = hotspot.metadata?.transitionStyle || 'zoom-fade';

    onNavigate(hotspot.to_scene_id, orientation, transitionStyle);
  };

  return (
    <group position={position}>
      {/* Click target - larger invisible sphere for easier clicking */}
      <mesh
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = hotspot.is_locked ? 'not-allowed' : 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Animated Hotspot */}
      <Html center distanceFactor={10}>
        <div className="pointer-events-auto">
          <AnimatedHotspot
            hotspot={hotspot}
            onNavigate={onNavigate}
            isHovered={hovered}
            isSelected={isSelected}
            onClick={() => setShowMedia(true)}
            isRestricted={!hasPermission()}
          />
        </div>
      </Html>

      {/* Media Overlay */}
      {showMedia && (
        <Html center distanceFactor={5}>
          <div className="pointer-events-auto">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  {getHotspotIcon(hotspot.icon_type)}
                  <span className="text-white text-sm font-semibold">{hotspot.title || 'Media'}</span>
                </div>
                <button
                  onClick={() => setShowMedia(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {hotspot.description && (
                  <p className="text-gray-300 text-xs mb-3">{hotspot.description}</p>
                )}

                {/* Image */}
                {hotspot.media_type === 'image' && hotspot.media_url && (
                  <div className="space-y-2">
                    <img
                      src={hotspot.media_url}
                      alt={hotspot.title || 'Image'}
                      className="w-full rounded-lg max-h-64 object-cover"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setQuickViewUrl(hotspot.media_url!)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        Quick View
                      </button>
                      <a
                        href={hotspot.media_url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </div>
                  </div>
                )}

                {/* Video */}
                {hotspot.media_type === 'video' && hotspot.media_url && (() => {
                  const isEmbed = hotspot.media_url!.includes('youtube.com') || hotspot.media_url!.includes('vimeo.com');
                  return (
                    <div className="space-y-2">
                      {isEmbed ? (
                        <div className="aspect-video">
                          <iframe
                            src={hotspot.media_url!.replace('watch?v=', 'embed/')}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          src={hotspot.media_url}
                          controls
                          className="w-full rounded-lg max-h-64"
                        />
                      )}
                      <div className="flex gap-2">
                        {!isEmbed && (
                          <a
                            href={hotspot.media_url}
                            download
                            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        )}
                        <button
                          onClick={() => copyToClipboard(hotspot.media_url!)}
                          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Audio */}
                {hotspot.media_type === 'audio' && hotspot.media_url && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
                      <Music size={20} className="text-purple-400" />
                      <audio src={hotspot.media_url} controls className="flex-1" />
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={hotspot.media_url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </a>
                      <button
                        onClick={() => copyToClipboard(hotspot.media_url!)}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}

                {/* PDF/Document */}
                {(hotspot.media_type === 'pdf' || hotspot.media_type === 'document') && hotspot.media_url && (
                  <div className="space-y-2">
                    <a
                      href={hotspot.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FileText size={20} className="text-orange-400" />
                      <span className="text-white text-sm">Open Document</span>
                      <ExternalLink size={14} className="text-gray-400" />
                    </a>
                    <div className="flex gap-2">
                      <a
                        href={hotspot.media_url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <Download size={14} />
                        Download
                      </a>
                      <button
                        onClick={() => copyToClipboard(hotspot.media_url!)}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}

                {/* URL/Link */}
                {hotspot.media_type === 'url' && hotspot.media_url && (
                  <div className="space-y-2">
                    <a
                      href={hotspot.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 p-3 rounded-lg hover:bg-blue-600/30 transition-colors"
                    >
                      <Link size={20} className="text-blue-400" />
                      <span className="text-blue-300 text-sm truncate">{hotspot.media_url}</span>
                      <ExternalLink size={14} className="text-blue-400 flex-shrink-0" />
                    </a>
                    <div className="flex gap-2">
                      <a
                        href={hotspot.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        <ExternalLink size={14} />
                        Follow Link
                      </a>
                      <button
                        onClick={() => copyToClipboard(hotspot.media_url!)}
                        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Text */}
                {hotspot.media_type === 'text' && hotspot.media_url && (
                  <div className="space-y-2">
                    <div className="bg-gray-800 p-3 rounded-lg">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{hotspot.media_url}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(hotspot.media_url!)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Quick View Modal */}
      {quickViewUrl && (
        <Html center distanceFactor={3}>
          <div className="pointer-events-auto">
            <div className="bg-black/95 border border-gray-700 rounded-xl shadow-2xl p-4 max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-sm font-semibold">Quick View</span>
                <button
                  onClick={() => setQuickViewUrl(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <img
                src={quickViewUrl}
                alt="Quick view"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
              <div className="flex gap-2 mt-3">
                <a
                  href={quickViewUrl}
                  download
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  Download Full Size
                </a>
                <a
                  href={quickViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* PIN Prompt for restricted hotspots */}
      {showPinPrompt && (
        <Html center distanceFactor={2}>
          <div className="pointer-events-auto">
            <PinPrompt
              isOpen={showPinPrompt}
              onClose={() => {
                setShowPinPrompt(false);
                setPinError('');
              }}
              onVerify={verifyPin}
              title="Restricted Hotspot"
              description={`This hotspot requires ${hotspot.required_role} access or PIN verification`}
              error={pinError}
            />
          </div>
        </Html>
      )}
    </group>
  );
}

export { yawPitchToPosition };
export default HotspotMarker;
