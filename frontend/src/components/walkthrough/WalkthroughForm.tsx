import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walkthroughApi } from '@/api/walkthroughs';
import { useAuthStore } from '@/stores/authStore';

interface WalkthroughFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    name: string;
    client?: string;
    address?: string;
    status?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  };
  mode?: 'create' | 'edit';
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

function WalkthroughForm({ isOpen, onClose, initialData, mode = 'create' }: WalkthroughFormProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    client: initialData?.client || '',
    address: initialData?.address || '',
    status: initialData?.status || 'draft',
    description: initialData?.description || '',
    latitude: initialData?.latitude?.toString() || '',
    longitude: initialData?.longitude?.toString() || '',
  });
  const queryClient = useQueryClient();

  // Sync form data when initialData changes (for edit mode)
  useEffect(() => {
    setFormData({
      name: initialData?.name || '',
      client: initialData?.client || '',
      address: initialData?.address || '',
      status: initialData?.status || 'draft',
      description: initialData?.description || '',
      latitude: initialData?.latitude?.toString() || '',
      longitude: initialData?.longitude?.toString() || '',
    });
  }, [initialData]);

  const createMutation = useMutation({
    mutationFn: walkthroughApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkthroughs'] });
      resetForm();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => walkthroughApi.update(initialData!.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkthroughs'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      client: '',
      address: '',
      status: 'draft',
      description: '',
      latitude: '',
      longitude: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload: any = {
      name: formData.name.trim(),
      client: formData.client.trim() || undefined,
      address: formData.address.trim() || undefined,
      status: formData.status as 'draft' | 'active' | 'archived',
      description: formData.description.trim() || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    };

    if (mode === 'create') {
      payload.created_by = user?.id;
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isError = createMutation.isError || updateMutation.isError;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Create Walkthrough' : 'Edit Walkthrough'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="e.g., Office Building Tour"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Client
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="Project address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="e.g., 40.7128"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="e.g., -74.0060"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
              rows={3}
              placeholder="Describe this walkthrough..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </button>
          </div>

          {isError && (
            <div className="text-red-500 text-sm text-center">
              Failed to {mode === 'create' ? 'create' : 'update'} walkthrough. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default WalkthroughForm;
