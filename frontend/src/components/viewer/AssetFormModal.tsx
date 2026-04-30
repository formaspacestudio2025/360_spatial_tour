import { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/types';
import { X } from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Asset | null;
  isPending?: boolean;
  sceneId?: string;
  pendingCoord?: { yaw: number; pitch: number } | null;
}

function AssetFormModal({ isOpen, onClose, onSubmit, initialData, isPending, sceneId, pendingCoord }: AssetFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'HVAC' as AssetType,
    brand: '',
    model: '',
    serial_number: '',
    status: 'active' as Asset['status'],
    purchase_date: '',
    warranty_date: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        brand: initialData.brand || '',
        model: initialData.model || '',
        serial_number: initialData.serial_number || '',
        status: initialData.status,
        purchase_date: initialData.purchase_date || '',
        warranty_date: initialData.warranty_date || '',
      });
    } else {
      setFormData({
        name: '',
        type: 'HVAC' as AssetType,
        brand: '',
        model: '',
        serial_number: '',
        status: 'active' as Asset['status'],
        purchase_date: '',
        warranty_date: '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      scene_id: sceneId,
      yaw: pendingCoord?.yaw,
      pitch: pendingCoord?.pitch,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Asset' : 'Place Asset Pin'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {pendingCoord && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-400">
            Pinning asset at yaw={pendingCoord.yaw.toFixed(2)}, pitch={pendingCoord.pitch.toFixed(2)}
          </div>
        )}

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
              <label className="block text-sm text-gray-400 mb-1">Warranty Expiry</label>
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
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 text-sm"
            >
              {isPending ? 'Saving...' : (initialData ? 'Update' : 'Create & Pin')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetFormModal;
