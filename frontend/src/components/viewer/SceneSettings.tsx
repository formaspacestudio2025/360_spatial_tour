import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scenesApi } from '@/api/scenes';
import { Scene } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import {
  X,
  Save,
  Image,
  MapPin,
  Building2,
  Upload,
  Trash2,
} from 'lucide-react';

interface SceneSettingsProps {
  scene: Scene;
  onClose: () => void;
  walkthroughId: string;
}

function SceneSettings({ scene, onClose, walkthroughId }: SceneSettingsProps) {
  const token = useAuthStore((s) => s.token);
  const [roomName, setRoomName] = useState(scene.room_name || '');
  const [floor, setFloor] = useState(scene.floor || 0);
  
  // Auto-extract XYZ from metadata if available, otherwise use scene values
  const metadata = scene.metadata ? (typeof scene.metadata === 'string' ? JSON.parse(scene.metadata) : scene.metadata) : {};
  
  // Debug: Log what we're working with
  console.log('[SceneSettings] Scene:', scene.id);
  console.log('[SceneSettings] Metadata:', metadata);
  console.log('[SceneSettings] Scene positions:', { x: scene.position_x, y: scene.position_y, z: scene.position_z });
  
  // Use metadata XYZ if available, otherwise use scene position_x/y/z
  const [positionX, setPositionX] = useState(metadata?.x ?? scene.position_x ?? 0);
  const [positionY, setPositionY] = useState(metadata?.y ?? scene.position_y ?? 0);
  const [positionZ, setPositionZ] = useState(metadata?.z ?? scene.position_z ?? 0);
  
  // Nadir settings
  const [nadirScale, setNadirScale] = useState(scene.nadir_scale || 1.0);
  const [nadirRotation, setNadirRotation] = useState(scene.nadir_rotation || 0);
  const [nadirOpacity, setNadirOpacity] = useState(scene.nadir_opacity || 1.0);
  const [nadirFile, setNadirFile] = useState<File | null>(null);
  const [nadirPreview, setNadirPreview] = useState<string | null>(scene.nadir_image_path || null);
  
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => scenesApi.update(scene.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes', walkthroughId] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => scenesApi.delete(scene.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenes', walkthroughId] });
      queryClient.invalidateQueries({ queryKey: ['walkthroughs'] });
      onClose();
    },
  });

  const handleSave = async () => {
    let nadirImagePath = scene.nadir_image_path;

    // Upload nadir image if a new file was selected
    if (nadirFile) {
      try {
        const formData = new FormData();
        formData.append('nadir', nadirFile);

        const response = await fetch(`/api/scenes/${scene.id}/upload-nadir`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error:', errorText);
          throw new Error(`Failed to upload nadir image: ${response.status}`);
        }

        const result = await response.json();
        nadirImagePath = result.data.nadir_image_path;
      } catch (error) {
        console.error('Nadir upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to upload nadir image: ${errorMessage}`);
        return;
      }
    }

    // Update scene with all fields
    updateMutation.mutate({
      room_name: roomName || undefined,
      floor,
      position_x: positionX,
      position_y: positionY,
      position_z: positionZ,
      nadir_image_path: nadirImagePath,
      nadir_scale: nadirScale,
      nadir_rotation: nadirRotation,
      nadir_opacity: nadirOpacity,
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete scene "${roomName || 'Unnamed'}"? This cannot be undone.`)) return;
    deleteMutation.mutate();
  };

  const handleNadirUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file and create preview
    setNadirFile(file);
    const previewUrl = URL.createObjectURL(file);
    setNadirPreview(previewUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Image size={20} className="text-primary-400" />
            Scene Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin size={14} />
              Basic Information
            </h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Living Room, Kitchen"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Floor Number</label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position X</label>
                <input
                  type="number"
                  step="0.1"
                  value={positionX}
                  onChange={(e) => setPositionX(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={positionY}
                  onChange={(e) => setPositionY(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Position Z</label>
                <input
                  type="number"
                  step="0.1"
                  value={positionZ}
                  onChange={(e) => setPositionZ(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Nadir Patch Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building2 size={14} />
              Nadir Patch (Bottom Overlay)
            </h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Nadir Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleNadirUpload}
                className="hidden"
                id="nadir-upload"
              />
              <label
                htmlFor="nadir-upload"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm hover:border-primary-500 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                {nadirPreview ? 'Change Nadir Image' : 'Upload Nadir Image'}
              </label>
              
              {/* Preview */}
              {nadirPreview && (
                <div className="mt-2">
                  <img
                    src={nadirPreview}
                    alt="Nadir preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-700"
                  />
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    ✓ {nadirFile ? 'New image selected (will upload on save)' : 'Current nadir image'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Scale: {nadirScale.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={nadirScale}
                onChange={(e) => setNadirScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Rotation: {nadirRotation.toFixed(0)}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={nadirRotation}
                onChange={(e) => setNadirRotation(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Opacity: {(nadirOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={nadirOpacity}
                onChange={(e) => setNadirOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Scene Info */}
          <div className="p-3 bg-gray-800/50 rounded-lg space-y-1">
            <div className="text-xs text-gray-500">Scene ID</div>
            <div className="text-xs text-gray-400 font-mono">{scene.id}</div>
            <div className="text-xs text-gray-500 mt-2">Created</div>
            <div className="text-xs text-gray-400">
              {new Date(scene.created_at).toLocaleString()}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-red-500/30 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            <p className="text-xs text-gray-400">
              Deleting a scene will also remove all its hotspots and AI tags.
            </p>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Scene'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <Save size={14} />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SceneSettings;
