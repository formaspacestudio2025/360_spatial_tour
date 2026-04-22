import { Hotspot } from '@/api/hotspots';
import { 
  Navigation2, Info, AlertTriangle, AlertCircle, Image, Video, FileText, Link, Music,
  Layers, MapPin, Tag, MessageSquare, ClipboardList,
  Ruler, Camera, Zap, Shield, AlertOctagon, Bookmark, Check
} from 'lucide-react';

interface AnimatedHotspotProps {
  hotspot: Hotspot;
  onNavigate: (sceneId: string, orientation?: { yaw: number; pitch: number }) => void;
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
}

// Helper to get icon based on hotspot type
function getHotspotIcon(iconType?: string, size: number = 16) {
  const iconProps = { size };
  
  switch (iconType) {
    case 'navigation': return <Navigation2 {...iconProps} />;
    case 'floor': return <Layers {...iconProps} />;
    case 'room': return <MapPin {...iconProps} />;
    case 'info': return <Info {...iconProps} />;
    case 'note': return <MessageSquare {...iconProps} />;
    case 'tag': return <Tag {...iconProps} />;
    case 'checklist': return <ClipboardList {...iconProps} />;
    case 'warning': return <AlertTriangle {...iconProps} />;
    case 'issue': return <AlertCircle {...iconProps} />;
    case 'critical': return <AlertOctagon {...iconProps} />;
    case 'safety': return <Shield {...iconProps} />;
    case 'image': return <Image {...iconProps} />;
    case 'video': return <Video {...iconProps} />;
    case 'audio': return <Music {...iconProps} />;
    case 'document':
    case 'pdf': return <FileText {...iconProps} />;
    case 'url': return <Link {...iconProps} />;
    case 'measurement': return <Ruler {...iconProps} />;
    case 'photo-point': return <Camera {...iconProps} />;
    case 'electrical': return <Zap {...iconProps} />;
    case 'bookmark': return <Bookmark {...iconProps} />;
    default: return <Navigation2 {...iconProps} />;
  }
}

export default function AnimatedHotspot({ 
  hotspot, 
  onNavigate,
  isHovered, 
  isSelected,
  onClick 
}: AnimatedHotspotProps) {
  const {
    animation_type = 'pulse-ring',
    animation_speed = 1.0,
    animation_intensity = 0.5,
    icon_size = 1.0,
    opacity = 1.0,
    label_position = 'top',
    hover_scale = 1.2,
    icon_color = '#10b981',
    background_color,
    title,
    icon_type,
    is_locked,
  } = hotspot;

  const baseDuration = 2 / animation_speed;
  const intensityScale = animation_intensity;

  // Position label based on label_position
  const labelPositionClass = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }[label_position] || 'bottom-full mb-2';

  // Handle click
  const handleClick = () => {
    if (is_locked) return;
    
    if (hotspot.media_type && hotspot.media_url) {
      // Show media overlay (handled by parent)
      onClick();
    } else {
      // Navigate to scene
      const orientation = (hotspot.target_yaw !== undefined && hotspot.target_pitch !== undefined)
        ? { yaw: hotspot.target_yaw, pitch: hotspot.target_pitch }
        : undefined;
      onNavigate(hotspot.to_scene_id, orientation);
    }
  };

  // Render animation based on type
  const renderAnimation = () => {
    const color = isSelected ? '#f59e0b' : isHovered ? (icon_color || '#3b82f6') : (icon_color || '#10b981');
    const bgColor = background_color || color;

    switch (animation_type) {
      case 'pulse-ring':
        return (
          <div className="relative flex items-center justify-center">
            {/* Pulse rings */}
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${40 * icon_size}px`,
                height: `${40 * icon_size}px`,
                borderColor: bgColor,
                animation: `pulse-ring ${baseDuration}s ease-out infinite`,
              }}
            />
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${40 * icon_size}px`,
                height: `${40 * icon_size}px`,
                borderColor: bgColor,
                animation: `pulse-ring ${baseDuration}s ease-out infinite`,
                animationDelay: `${baseDuration / 2}s`,
              }}
            />
            {/* Core icon */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'bounce':
        return (
          <div 
            className="relative flex items-center justify-center"
            style={{
              animation: `bounce-marker ${baseDuration}s ease-in-out infinite`,
            }}
          >
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${color}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'glow':
        return (
          <div className="relative flex items-center justify-center">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${color}20`,
                color: color,
                animation: `glow-beacon ${baseDuration}s ease-in-out infinite`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'ripple':
        return (
          <div className="relative flex items-center justify-center">
            {/* Ripple rings */}
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${30 * icon_size}px`,
                height: `${30 * icon_size}px`,
                borderColor: bgColor,
                animation: `ripple-target ${baseDuration}s ease-out infinite`,
              }}
            />
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${30 * icon_size}px`,
                height: `${30 * icon_size}px`,
                borderColor: bgColor,
                animation: `ripple-target ${baseDuration}s ease-out infinite`,
                animationDelay: `${baseDuration / 3}s`,
              }}
            />
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${30 * icon_size}px`,
                height: `${30 * icon_size}px`,
                borderColor: bgColor,
                animation: `ripple-target ${baseDuration}s ease-out infinite`,
                animationDelay: `${(baseDuration / 3) * 2}s`,
              }}
            />
            {/* Core */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}30`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'floating':
        return (
          <div className="relative flex flex-col items-center">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{
                animation: `floating-label ${baseDuration}s ease-in-out infinite`,
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${color}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
            {title && (
              <div 
                className="mt-1 text-xs font-medium text-white px-2 py-0.5 rounded bg-gray-900/80 whitespace-nowrap"
                style={{
                  animation: `floating-label ${baseDuration}s ease-in-out infinite`,
                  animationDelay: '0.1s',
                }}
              >
                {title}
              </div>
            )}
          </div>
        );

      case 'arrow-sweep':
        return (
          <div className="relative flex items-center justify-center">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${color}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
            {/* Animated arrows */}
            <div 
              className="absolute text-2xl font-bold"
              style={{
                color: color,
                animation: `arrow-sweep ${baseDuration}s ease-in-out infinite`,
                opacity: intensityScale,
              }}
            >
              →
            </div>
          </div>
        );

      case 'breathing':
        return (
          <div 
            className="relative flex items-center justify-center"
            style={{
              animation: `breathing-dot ${baseDuration}s ease-in-out infinite`,
            }}
          >
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${color}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'orbit-halo':
        return (
          <div className="relative flex items-center justify-center">
            {/* Orbiting ring */}
            <div 
              className="absolute rounded-full border-2 border-dashed"
              style={{
                width: `${50 * icon_size}px`,
                height: `${50 * icon_size}px`,
                borderColor: bgColor,
                animation: `orbit-halo ${baseDuration * 2}s linear infinite`,
              }}
            />
            {/* Core */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'ping':
        return (
          <div className="relative flex items-center justify-center">
            {/* Ping effect */}
            <div 
              className="absolute rounded-full"
              style={{
                width: `${40 * icon_size}px`,
                height: `${40 * icon_size}px`,
                backgroundColor: bgColor,
                animation: `ping-locator ${baseDuration * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              }}
            />
            {/* Core */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}30`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'spotlight':
        return (
          <div className="relative flex items-center justify-center">
            {/* Spotlight effect */}
            <div 
              className="absolute rounded-full"
              style={{
                width: `${60 * icon_size}px`,
                height: `${60 * icon_size}px`,
                background: `radial-gradient(circle, ${bgColor}40 0%, transparent 70%)`,
                animation: `spotlight-cone ${baseDuration}s ease-in-out infinite`,
              }}
            />
            {/* Core */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'tooltip':
        return (
          <div className="relative flex items-center justify-center">
            <div 
              className="flex items-center justify-center rounded-full transition-all duration-200"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: isHovered ? `${color}40` : `${color}20`,
                transform: isHovered ? `scale(${hover_scale})` : 'scale(1)',
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
            {/* Tooltip on hover */}
            {isHovered && title && (
              <div 
                className={`absolute ${labelPositionClass} px-2 py-1 bg-gray-900/90 border border-gray-700 rounded text-xs text-white whitespace-nowrap z-20`}
              >
                {title}
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div className="relative flex items-center justify-center">
            {/* Progress ring */}
            <svg 
              className="absolute"
              width={44 * icon_size} 
              height={44 * icon_size}
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx={22 * icon_size}
                cy={22 * icon_size}
                r={18 * icon_size}
                fill="none"
                stroke={bgColor}
                strokeWidth="2"
                strokeDasharray="100"
                style={{
                  animation: `progress-marker ${baseDuration * 3}s linear infinite`,
                }}
              />
            </svg>
            {/* Core */}
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );

      case 'warning-flash':
        return (
          <div 
            className="relative flex items-center justify-center"
            style={{
              animation: `warning-flash ${baseDuration * 0.5}s ease-in-out infinite`,
            }}
          >
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: '#ef444420',
                color: '#ef4444',
              }}
            >
              {getHotspotIcon(icon_type || 'warning', 16 * icon_size)}
            </div>
          </div>
        );

      case 'checkmark':
        return (
          <div className="relative flex items-center justify-center">
            <div 
              className="flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: '#10b98120',
                color: '#10b981',
              }}
            >
              <Check size={16 * icon_size} style={{ animation: `checkmark-success ${baseDuration}s ease-in-out infinite` }} />
            </div>
          </div>
        );

      default:
        // Default pulse-ring animation
        return (
          <div className="relative flex items-center justify-center">
            <div 
              className="absolute rounded-full border-2"
              style={{
                width: `${40 * icon_size}px`,
                height: `${40 * icon_size}px`,
                borderColor: bgColor,
                animation: `pulse-ring ${baseDuration}s ease-out infinite`,
              }}
            />
            <div 
              className="relative z-10 flex items-center justify-center rounded-full"
              style={{ 
                width: `${32 * icon_size}px`,
                height: `${32 * icon_size}px`,
                backgroundColor: `${bgColor}20`,
              }}
            >
              {getHotspotIcon(icon_type, 16 * icon_size)}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="cursor-pointer transition-transform duration-200"
      style={{ 
        opacity,
        transform: isHovered ? `scale(${hover_scale})` : 'scale(1)',
      }}
      onClick={handleClick}
    >
      {renderAnimation()}
    </div>
  );
}
