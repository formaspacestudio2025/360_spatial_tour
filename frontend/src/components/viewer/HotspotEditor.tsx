import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hotspotsApi, Hotspot } from '@/api/hotspots';
import { useHotspotStore } from '@/stores/hotspotStore';
import { canEdit } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { useAutosave, SaveStatusIndicator } from '@/hooks/useAutosave';
import { Scene } from '@/types';
import MediaManager from './MediaManager';
import {
  Plus,
  MapPin,
  Trash2,
  X,
  Navigation2,
  Crosshair,
  Check,
  Edit3,
  Info,
  AlertTriangle,
  AlertCircle,
  Lock,
  Unlock,
  Copy,
  Image,
  Video,
  FileText,
  Link,
  Upload,
  Maximize2,
  Minimize2,
  Layers,
  Tag,
  MessageSquare,
  ClipboardList,
  Ruler,
  Camera,
  Zap,
  Shield,
  AlertOctagon,
  Bookmark,
} from 'lucide-react';

interface HotspotEditorProps {
  scenes: Scene[];
  currentSceneId: string;
}

// Icon type options
// Enterprise-level hotspot types
const ICON_TYPES = [
  // Navigation & Structure
  { value: 'navigation', label: 'Navigation', icon: Navigation2, color: '#10b981' },
  { value: 'floor', label: 'Floor', icon: Layers, color: '#3b82f6' },
  { value: 'room', label: 'Room', icon: MapPin, color: '#06b6d4' },
  
  // Information & Annotation
  { value: 'info', label: 'Info', icon: Info, color: '#3b82f6' },
  { value: 'note', label: 'Note', icon: MessageSquare, color: '#f59e0b' },
  { value: 'tag', label: 'Tag', icon: Tag, color: '#8b5cf6' },
  { value: 'checklist', label: 'Checklist', icon: ClipboardList, color: '#10b981' },
  
  // Alerts & Issues
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: '#f59e0b' },
  { value: 'issue', label: 'Issue', icon: AlertCircle, color: '#ef4444' },
  { value: 'critical', label: 'Critical', icon: AlertOctagon, color: '#dc2626' },
  { value: 'safety', label: 'Safety', icon: Shield, color: '#f97316' },
  
  // Media & Content
  { value: 'image', label: 'Image', icon: Image, color: '#8b5cf6' },
  { value: 'video', label: 'Video', icon: Video, color: '#ec4899' },
  { value: 'audio', label: 'Audio', icon: Video, color: '#6366f1' },
  { value: 'document', label: 'Document', icon: FileText, color: '#6366f1' },
  { value: 'url', label: 'Link', icon: Link, color: '#14b8a6' },
  
  // Technical & Measurement
  { value: 'measurement', label: 'Measure', icon: Ruler, color: '#14b8a6' },
  { value: 'photo-point', label: 'Photo', icon: Camera, color: '#ec4899' },
  { value: 'electrical', label: 'Electrical', icon: Zap, color: '#f59e0b' },
  
  // Bookmark
  { value: 'bookmark', label: 'Bookmark', icon: Bookmark, color: '#f59e0b' },
];

// Color palette
const COLOR_PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4',
];

function HotspotEditor({ scenes, currentSceneId }: HotspotEditorProps) {
  const { user } = useAuthStore();
  const {
    hotspots,
    isPlacingHotspot,
    selectedHotspot,
    pendingHotspot,
    setPlacingMode,
    setSelectedHotspot,
    addHotspot,
    removeHotspot,
    updateHotspot,
  } = useHotspotStore();

  // Form state
  const [label, setLabel] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSceneId, setTargetSceneId] = useState('');
  const [iconType, setIconType] = useState('navigation');
  const [iconColor, setIconColor] = useState('#10b981');
  const [iconSize, setIconSize] = useState(1.0);
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [mediaType, setMediaType] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [expandedHotspot, setExpandedHotspot] = useState<string | null>(null);
  
  // NEW: Animation & Style state
  const [animationType, setAnimationType] = useState('pulse-ring');
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [animationIntensity, setAnimationIntensity] = useState(0.5);
  const [opacity, setOpacity] = useState(1.0);
  const [labelPosition, setLabelPosition] = useState('top');
  const [hoverScale, setHoverScale] = useState(1.2);
  const [visibleDistance, setVisibleDistance] = useState(0);
  const [alwaysVisible, setAlwaysVisible] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const canManage = user ? canEdit(user.role) : false;

  const createMutation = useMutation({
    mutationFn: (data: any) => hotspotsApi.create(data.sceneId, data),
    onSuccess: (result) => {
      if (result.data) {
        addHotspot(result.data);
        queryClient.invalidateQueries({ queryKey: ['hotspots', currentSceneId] });
      }
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) =>
      hotspotsApi.update(data.id, data.updates),
    onSuccess: (result) => {
      if (result.data) {
        updateHotspot(result.data);
        queryClient.invalidateQueries({ queryKey: ['hotspots', currentSceneId] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hotspotsApi.delete(id),
    onSuccess: (_, id) => {
      removeHotspot(id);
      queryClient.invalidateQueries({ queryKey: ['hotspots', currentSceneId] });
    },
  });

  // Autosave for editing hotspots
  const { saveStatus, lastSaved, error: saveError, retry: retrySave } = useAutosave({
    data: {
      label,
      title,
      description,
      to_scene_id: targetSceneId,
      icon_type: iconType,
      icon_color: iconColor,
      metadata: { iconSize, customIconUrl, mediaType, mediaUrl },
      is_locked: isLocked,
      // NEW: Animation & Style fields
      animation_type: animationType,
      animation_speed: animationSpeed,
      animation_intensity: animationIntensity,
      icon_size: iconSize,
      opacity: opacity,
      label_position: labelPosition,
      hover_scale: hoverScale,
      visible_distance: visibleDistance,
      always_visible: alwaysVisible,
      background_color: backgroundColor || undefined,
    },
    onSave: async (data) => {
      if (!selectedHotspot) return;
      console.log('[HotspotEditor] Autosaving with data:', data);
      const response = await hotspotsApi.update(selectedHotspot.id, data);
      console.log('[HotspotEditor] Autosave response:', response);
      if (response.data) {
        updateHotspot(response.data);
        queryClient.invalidateQueries({ queryKey: ['hotspots', currentSceneId] });
      }
    },
    delay: 1500,
    enabled: !!selectedHotspot && !isPlacingHotspot,
  });

  const resetForm = () => {
    setLabel('');
    setTitle('');
    setDescription('');
    setTargetSceneId('');
    setIconType('navigation');
    setIconColor('#10b981');
    setIconSize(1.0);
    setCustomIconUrl('');
    setIsLocked(false);
    setMediaType('');
    setMediaUrl('');
    setSelectedHotspot(null);
    setShowMediaPanel(false);
    
    // NEW: Reset animation & style fields
    setAnimationType('pulse-ring');
    setAnimationSpeed(1.0);
    setAnimationIntensity(0.5);
    setOpacity(1.0);
    setLabelPosition('top');
    setHoverScale(1.2);
    setVisibleDistance(0);
    setAlwaysVisible(true);
    setBackgroundColor('');
  };

  // Reset selection when scene changes
  useEffect(() => {
    resetForm();
  }, [currentSceneId]);

  const handleStartPlacing = () => {
    setPlacingMode(true);
    resetForm();
  };

  const handleEditHotspot = (hotspot: Hotspot) => {
    console.log('[HotspotEditor] handleEditHotspot called with:', {
      id: hotspot.id,
      label: hotspot.label,
      animation_type: hotspot.animation_type,
      animation_speed: hotspot.animation_speed,
      animation_intensity: hotspot.animation_intensity,
    });
    
    setSelectedHotspot(hotspot);
    setLabel(hotspot.label || '');
    setTitle(hotspot.title || '');
    setDescription(hotspot.description || '');
    setTargetSceneId(hotspot.to_scene_id || '');
    setIconType(hotspot.icon_type || 'navigation');
    setIconColor(hotspot.icon_color || '#10b981');
    setIconSize(hotspot.metadata?.iconSize || 1.0);
    setCustomIconUrl(hotspot.custom_icon_url || '');
    setIsLocked(hotspot.is_locked || false);
    setMediaType(hotspot.media_type || '');
    setMediaUrl(hotspot.media_url || '');
    
    // NEW: Load animation & style fields
    const animType = hotspot.animation_type || 'pulse-ring';
    const animSpeed = hotspot.animation_speed || 1.0;
    const animIntensity = hotspot.animation_intensity || 0.5;
    
    console.log('[HotspotEditor] Setting animation state:', {
      animation_type: animType,
      animation_speed: animSpeed,
      animation_intensity: animIntensity,
    });
    
    setAnimationType(animType);
    setAnimationSpeed(animSpeed);
    setAnimationIntensity(animIntensity);
    setOpacity(hotspot.opacity || 1.0);
    setLabelPosition(hotspot.label_position || 'top');
    setHoverScale(hotspot.hover_scale || 1.2);
    setVisibleDistance(hotspot.visible_distance || 0);
    setAlwaysVisible(hotspot.always_visible !== undefined ? hotspot.always_visible : true);
    setBackgroundColor(hotspot.background_color || '');
  };

  const handleSaveHotspot = () => {
    if (!pendingHotspot) return;

    createMutation.mutate({
      sceneId: currentSceneId,
      yaw: pendingHotspot.yaw,
      pitch: pendingHotspot.pitch,
      label: label || undefined,
      to_scene_id: targetSceneId,
      icon_type: iconType,
      icon_color: iconColor,
      title: title || undefined,
      description: description || undefined,
      media_type: mediaType || undefined,
      media_url: mediaUrl || undefined,
      custom_icon_url: customIconUrl || undefined,
      is_locked: isLocked,
      metadata: { iconSize },
      // NEW: Animation & Style fields
      animation_type: animationType,
      animation_speed: animationSpeed,
      animation_intensity: animationIntensity,
      icon_size: iconSize,
      opacity: opacity,
      label_position: labelPosition,
      hover_scale: hoverScale,
      visible_distance: visibleDistance,
      always_visible: alwaysVisible,
      background_color: backgroundColor || undefined,
    });
  };

  const handleDuplicateHotspot = (hotspot: Hotspot) => {
    createMutation.mutate({
      sceneId: currentSceneId,
      yaw: hotspot.yaw + 0.1,
      pitch: hotspot.pitch,
      label: `${hotspot.label || 'Hotspot'} (Copy)`,
      to_scene_id: hotspot.to_scene_id,
      icon_type: hotspot.icon_type,
      icon_color: hotspot.icon_color,
      title: hotspot.title,
      description: hotspot.description,
      media_type: hotspot.media_type,
      media_url: hotspot.media_url,
      custom_icon_url: hotspot.custom_icon_url,
      is_locked: false,
      metadata: hotspot.metadata,
      // NEW: Copy animation & style fields
      animation_type: hotspot.animation_type,
      animation_speed: hotspot.animation_speed,
      animation_intensity: hotspot.animation_intensity,
      icon_size: hotspot.icon_size,
      opacity: hotspot.opacity,
      label_position: hotspot.label_position,
      hover_scale: hotspot.hover_scale,
      visible_distance: hotspot.visible_distance,
      always_visible: hotspot.always_visible,
      background_color: hotspot.background_color,
    });
  };

  const handleToggleLock = (hotspot: Hotspot) => {
    updateMutation.mutate({
      id: hotspot.id,
      updates: { is_locked: !hotspot.is_locked },
    });
  };

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement file upload to server
    // For now, create object URL
    const url = URL.createObjectURL(file);
    setCustomIconUrl(url);
  };

  const handleCancelPlacing = () => {
    setPlacingMode(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this hotspot?')) return;
    deleteMutation.mutate(id);
  };

  const currentHotspots = hotspots.filter((h) => h.from_scene_id === currentSceneId);
  const otherScenes = scenes.filter((s) => s.id !== currentSceneId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Navigation2 size={14} className="text-primary-400" />
          Hotspots ({currentHotspots.length})
        </h3>
        {canManage && !isPlacingHotspot && (
          <button
            onClick={handleStartPlacing}
            className="text-xs px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center gap-1"
          >
            <Plus size={12} />
            Add
          </button>
        )}
      </div>

      {/* Placing mode form */}
      {isPlacingHotspot && (
        <div className="bg-gray-800/50 border border-primary-500/30 rounded-lg p-3 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs">
            <Crosshair size={12} />
            <span>Click on the panorama to set position</span>
          </div>

          {pendingHotspot && (
            <>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <MapPin size={10} />
                Position set: yaw {(pendingHotspot.yaw * (180 / Math.PI)).toFixed(1)}°, pitch{' '}
                {(pendingHotspot.pitch * (180 / Math.PI)).toFixed(1)}°
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Hotspot title"
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Entrance, Living Room"
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description..."
                  rows={2}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Icon Type */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Icon Type</label>
                <div className="grid grid-cols-4 gap-1">
                  {ICON_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setIconType(type.value)}
                        className={`p-2 rounded-md border text-xs flex flex-col items-center gap-1 transition-all ${
                          iconType === type.value
                            ? 'border-primary-500 bg-primary-500/10 text-white'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600'
                        }`}
                        title={type.label}
                      >
                        <Icon size={14} style={{ color: type.color }} />
                        <span className="text-[10px]">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon Color */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Icon Color</label>
                <div className="flex gap-1 flex-wrap">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => setIconColor(color)}
                      className={`w-6 h-6 rounded-md border-2 transition-all ${
                        iconColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Size */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Icon Size: {iconSize.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={iconSize}
                  onChange={(e) => setIconSize(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Custom Icon Upload */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Custom Icon (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomIconUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-gray-400 text-xs hover:border-primary-500 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={12} />
                  {customIconUrl ? 'Change Icon' : 'Upload Icon'}
                </button>
              </div>

              {/* Target Scene */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Target Scene *</label>
                <select
                  value={targetSceneId}
                  onChange={(e) => setTargetSceneId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select a scene...</option>
                  {otherScenes.map((scene) => (
                    <option key={scene.id} value={scene.id}>
                      {scene.room_name || `Scene ${scene.id.slice(0, 6)}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lock Hotspot */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLocked(!isLocked)}
                  className={`px-2.5 py-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
                    isLocked
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      : 'bg-gray-900 text-gray-400 border border-gray-700'
                  }`}
                >
                  {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  {isLocked ? 'Locked' : 'Lock Hotspot'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancelPlacing}
                  className="flex-1 px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <X size={12} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveHotspot}
                  disabled={createMutation.isPending || !targetSceneId}
                  className="flex-1 px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white text-xs rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <Check size={12} />
                  {createMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hotspot list */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {currentHotspots.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-xs">
            No hotspots in this scene
          </div>
        ) : (
          currentHotspots.map((hotspot) => {
            const targetScene = scenes.find((s) => s.id === hotspot.to_scene_id);
            const isSelected = selectedHotspot?.id === hotspot.id;
            const isExpanded = expandedHotspot === hotspot.id;

            return (
              <div key={hotspot.id} className="space-y-2">
                {/* Hotspot item */}
                <div
                  onClick={() => {
                    setSelectedHotspot(isSelected ? null : hotspot);
                    if (!isSelected) handleEditHotspot(hotspot);
                  }}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary-500/10 border-primary-500/30'
                      : 'bg-gray-800/30 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-white truncate">
                        {hotspot.title || hotspot.label || 'Unnamed hotspot'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        To: {targetScene?.room_name || 'Unknown scene'}
                      </div>
                      {hotspot.is_locked && (
                        <div className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(hotspot);
                          }}
                          className="p-1 text-gray-500 hover:text-amber-400 transition-colors"
                          title={hotspot.is_locked ? 'Unlock' : 'Lock'}
                        >
                          {hotspot.is_locked ? <Lock size={12} /> : <Unlock size={12} />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateHotspot(hotspot);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={12} />
                        </button>
                        {!hotspot.is_locked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(hotspot.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedHotspot(isExpanded ? null : hotspot.id);
                          }}
                          className="p-1 text-gray-500 hover:text-white transition-colors"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded edit form */}
                {isSelected && isExpanded && (
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-3 ml-4">
                    {/* Media Manager Button */}
                    <button
                      onClick={() => setShowMediaManager(true)}
                      className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Image size={14} />
                      Manage Media Files
                    </button>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs resize-none"
                      />
                    </div>

                    {/* Icon Type */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Icon Type</label>
                      <div className="grid grid-cols-4 gap-1">
                        {ICON_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.value}
                              onClick={() => setIconType(type.value)}
                              className={`p-2 rounded-md border text-xs flex flex-col items-center gap-1 ${
                                iconType === type.value
                                  ? 'border-primary-500 bg-primary-500/10'
                                  : 'border-gray-700 text-gray-400'
                              }`}
                            >
                              <Icon size={14} style={{ color: type.color }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Icon Color */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Color</label>
                      <div className="flex gap-1 flex-wrap">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => setIconColor(color)}
                            className={`w-6 h-6 rounded-md border-2 ${
                              iconColor === color ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Icon Size */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Size: {iconSize.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={iconSize}
                        onChange={(e) => setIconSize(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Animation Type */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Animation</label>
                      <select
                        value={animationType}
                        onChange={(e) => {
                          console.log('[HotspotEditor] Animation type changed to:', e.target.value);
                          setAnimationType(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs"
                      >
                        <option value="pulse-ring">Pulse Ring</option>
                        <option value="bounce">Bounce Marker</option>
                        <option value="glow">Glow Beacon</option>
                        <option value="ripple">Ripple Target</option>
                        <option value="floating">Floating Label</option>
                        <option value="arrow-sweep">Arrow Sweep</option>
                        <option value="breathing">Breathing Dot</option>
                        <option value="orbit-halo">Orbit Halo</option>
                        <option value="ping">Ping Locator</option>
                        <option value="spotlight">Spotlight Cone</option>
                        <option value="tooltip">Tooltip Reveal</option>
                        <option value="progress">Progress Marker</option>
                        <option value="warning-flash">Warning Flash</option>
                        <option value="checkmark">Checkmark Success</option>
                      </select>
                    </div>

                    {/* Animation Speed */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Animation Speed: {animationSpeed.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={animationSpeed}
                        onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Animation Intensity */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Animation Intensity: {(animationIntensity * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={animationIntensity}
                        onChange={(e) => setAnimationIntensity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Background Color */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Background Color</label>
                      <div className="flex gap-1 flex-wrap">
                        {COLOR_PALETTE.map((color) => (
                          <button
                            key={color}
                            onClick={() => setBackgroundColor(color)}
                            className={`w-6 h-6 rounded-md border-2 ${
                              backgroundColor === color ? 'border-white' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <button
                          onClick={() => setBackgroundColor('')}
                          className={`w-6 h-6 rounded-md border-2 ${
                            backgroundColor === '' ? 'border-white' : 'border-transparent'
                          } bg-gray-700`}
                          title="Default"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Label Position */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-2">Label Position</label>
                      <div className="grid grid-cols-4 gap-1">
                        {['top', 'bottom', 'left', 'right'].map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setLabelPosition(pos)}
                            className={`px-2 py-1 rounded-md border text-xs ${
                              labelPosition === pos
                                ? 'border-primary-500 bg-primary-500/10 text-white'
                                : 'border-gray-700 text-gray-400'
                            }`}
                          >
                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hover Scale */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Hover Scale: {hoverScale.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="1.0"
                        max="2.0"
                        step="0.1"
                        value={hoverScale}
                        onChange={(e) => setHoverScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Opacity: {(opacity * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Visible Distance */}
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Visible Distance: {visibleDistance === 0 ? 'Always' : `${visibleDistance}m`}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={visibleDistance}
                        onChange={(e) => setVisibleDistance(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    {/* Always Visible Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-400">Always Visible</label>
                      <button
                        onClick={() => setAlwaysVisible(!alwaysVisible)}
                        className={`w-10 h-5 rounded-full transition-colors ${
                          alwaysVisible ? 'bg-primary-600' : 'bg-gray-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform ${
                            alwaysVisible ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Autosave Status */}
                    <SaveStatusIndicator
                      status={saveStatus}
                      lastSaved={lastSaved}
                      error={saveError}
                      onRetry={retrySave}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Media Manager Modal */}
      {showMediaManager && selectedHotspot && (
        <div className="fixed inset-0 z-[9999]">
          <MediaManager
            hotspotId={selectedHotspot!.id}
            onClose={() => setShowMediaManager(false)}
          />
        </div>
      )}
    </div>
  );
}

export default HotspotEditor;
