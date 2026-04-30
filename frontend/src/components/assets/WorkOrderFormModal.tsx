import React, { useState } from 'react';
import { X, Wrench, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

interface WorkOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
}

export default function WorkOrderFormModal({ isOpen, onClose, assetId }: WorkOrderFormModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/work-orders', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-context', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      asset_id: assetId,
      status: 'open'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wrench className="text-primary-500" size={20} />
            Create Work Order
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
              placeholder="e.g. Replace HVAC Filter"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all min-h-[80px] text-sm"
              placeholder="Detailed instructions for the work order..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-5 mt-2 flex gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-[2] px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Work Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
