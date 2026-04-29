import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, Box, Map, QrCode, Calendar, X, Navigation2 } from 'lucide-react';
import { Asset, AssetType } from '@/types';
import QRModal from '@/components/assets/QRModal';
import HealthBadge from '@/components/assets/HealthBadge';
import LifecycleTab from '@/components/assets/LifecycleTab';

const AssetManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'HVAC' as AssetType,
    brand: '',
    model: '',
    serial_number: '',
    status: 'active' as Asset['status'],
    walkthrough_id: '',
    purchase_date: '',
    warranty_date: '',
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Mapping modal state
  const [showMapModal, setShowMapModal] = useState(false);
  const [mappingAsset, setMappingAsset] = useState<Asset | null>(null);
  const [mapData, setMapData] = useState({
    scene_id: '',
    yaw: '',
    pitch: '',
    floor: '',
    room: '',
  });

  // QR modal state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  // Lifecycle modal state
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [lifecycleAsset, setLifecycleAsset] = useState<Asset | null>(null);

  const { data: assetsResponse, isLoading, error } = useQuery({
    queryKey: ['assets', page, limit],
    queryFn: () => assetsApi.getAll(undefined, page, limit),
  });

  const assets = assetsResponse?.assets || [];
  const total = assetsResponse?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const createMutation = useMutation({
    mutationFn: (data: any) => assetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      assetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setEditingAsset(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const mapMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      assetsApi.mapToScene(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setShowMapModal(false);
      setMappingAsset(null);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'HVAC' as AssetType,
      brand: '',
      model: '',
      serial_number: '',
      status: 'active',
      walkthrough_id: '',
      purchase_date: '',
      warranty_date: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAsset) {
      updateMutation.mutate({ id: editingAsset.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const startEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type as AssetType,
      brand: asset.brand || '',
      model: asset.model || '',
      serial_number: asset.serial_number || '',
      status: asset.status,
      walkthrough_id: asset.walkthrough_id || '',
      purchase_date: asset.purchase_date || '',
      warranty_date: asset.warranty_date || '',
    });
    setShowForm(true);
  };

  const startMap = (asset: Asset) => {
    setMappingAsset(asset);
    setMapData({
      scene_id: asset.scene_id || '',
      yaw: asset.yaw?.toString() || '',
      pitch: asset.pitch?.toString() || '',
      floor: asset.floor?.toString() || '',
      room: asset.room || '',
    });
    setShowMapModal(true);
  };

  const handleMapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mappingAsset) return;

    const yawNum = mapData.yaw ? parseFloat(mapData.yaw) : undefined;
    const pitchNum = mapData.pitch ? parseFloat(mapData.pitch) : undefined;
    const floorNum = mapData.floor ? parseInt(mapData.floor) : undefined;

    // Validate yaw/pitch ranges
    if (yawNum !== undefined && (yawNum < 0 || yawNum > 360)) {
      alert('Yaw must be between 0 and 360 degrees');
      return;
    }
    if (pitchNum !== undefined && (pitchNum < -90 || pitchNum > 90)) {
      alert('Pitch must be between -90 and 90 degrees');
      return;
    }

    mapMutation.mutate({
      id: mappingAsset.id,
      data: {
        scene_id: mapData.scene_id || undefined,
        yaw: yawNum,
        pitch: pitchNum,
        floor: floorNum,
        room: mapData.room || undefined,
      },
    });
  };

  const typeColors: Record<string, string> = {
    HVAC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Elevator: 'bg-green-500/20 text-green-400 border-green-500/30',
    'Fire Extinguisher': 'bg-red-500/20 text-red-400 border-red-500/30',
    Lighting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Plumbing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    maintenance: 'bg-yellow-500/20 text-yellow-400',
    retired: 'bg-gray-500/20 text-gray-400',
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg">Loading assets...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-500">Failed to load assets.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Asset Management</h1>
              <p className="text-sm text-gray-400">Manage assets and their locations</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); setEditingAsset(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Add Asset
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assets.map((asset: Asset) => (
                <tr key={asset.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        <Box size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        {asset.brand && (
                          <div className="text-xs text-gray-500">{asset.brand} {asset.model}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[asset.type] || typeColors.Other}`}>
                      {asset.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[asset.status]}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {asset.health_score !== undefined ? (
                      <HealthBadge assetId={asset.id} score={asset.health_score} size="sm" />
                    ) : (
                      <span className="text-xs text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {asset.room ? `${asset.room}, Floor ${asset.floor || '?'}` : (asset.floor ? `Floor ${asset.floor}` : '-')}
                    {asset.scene_id && <span className="ml-2 text-xs text-blue-400">(mapped)</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setLifecycleAsset(asset); setShowLifecycleModal(true); }}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Lifecycle"
                      >
                        <Calendar size={14} />
                      </button>
                      <button
                        onClick={() => { setQrAsset(asset); setShowQRModal(true); }}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="QR Code"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => startMap(asset)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Map to Scene"
                      >
                        <Map size={14} />
                      </button>
                      <button
                        onClick={() => { if (asset.scene_id && asset.walkthrough_id) { navigate(`/walkthrough/${asset.walkthrough_id}?scene=${asset.scene_id}`); } else { alert('Asset not mapped to a scene'); } }}
                        className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="Jump to Scene"
                      >
                        <Navigation2 size={14} />
                      </button>
                      <button
                        onClick={() => startEdit(asset)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete this asset?')) deleteMutation.mutate(asset.id); }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No assets found. Add a new asset to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetType })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="HVAC">HVAC</option>
                  <option value="Elevator">Elevator</option>
                  <option value="Fire Extinguisher">Fire Extinguisher</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Warranty Date</label>
                  <input
                    type="date"
                    value={formData.warranty_date}
                    onChange={(e) => setFormData({ ...formData, warranty_date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 text-sm"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingAsset ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingAsset(null); resetForm(); }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map to Scene Modal */}
      {showMapModal && mappingAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Map "{mappingAsset.name}" to Scene</h2>
            <form onSubmit={handleMapSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Scene ID</label>
                <input
                  type="text"
                  value={mapData.scene_id}
                  onChange={(e) => setMapData({ ...mapData, scene_id: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  placeholder="e.g., scene_001"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Yaw (0-360)</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={mapData.yaw}
                    onChange={(e) => setMapData({ ...mapData, yaw: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Pitch (-90 to 90)</label>
                  <input
                    type="number"
                    min="-90"
                    max="90"
                    value={mapData.pitch}
                    onChange={(e) => setMapData({ ...mapData, pitch: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Floor</label>
                  <input
                    type="number"
                    value={mapData.floor}
                    onChange={(e) => setMapData({ ...mapData, floor: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Room</label>
                  <input
                    type="text"
                    value={mapData.room}
                    onChange={(e) => setMapData({ ...mapData, room: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={mapMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 text-sm"
                >
                  {mapMutation.isPending ? 'Saving...' : 'Save Mapping'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowMapModal(false); setMappingAsset(null); }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrAsset && (
        <QRModal
          assetId={qrAsset.id}
          assetName={qrAsset.name}
          onClose={() => { setShowQRModal(false); setQrAsset(null); }}
        />
      )}

      {/* Lifecycle Modal */}
      {showLifecycleModal && lifecycleAsset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Asset Lifecycle</h2>
              <button
                onClick={() => { setShowLifecycleModal(false); setLifecycleAsset(null); }}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <LifecycleTab asset={lifecycleAsset} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
