import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi, ChecklistTemplate } from '@/api/checklistsApi';
import { Plus, Trash2, Pencil, CheckCircle2, X } from 'lucide-react';

const ChecklistEngineTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => checklistsApi.getTemplates(),
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    asset_type: '',
    items: [''],
  });

  const createMutation = useMutation({
    mutationFn: checklistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      setShowForm(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => checklistsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });

  const resetForm = () => {
    setForm({ name: '', description: '', asset_type: '', items: [''] });
    setEditingTemplate(null);
  };

  const handleAddItem = () => setForm({ ...form, items: [...form.items, ''] });
  const handleItemChange = (idx: number, value: string) => {
    const newItems = [...form.items];
    newItems[idx] = value;
    setForm({ ...form, items: newItems });
  };
  const handleRemoveItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = form.items.filter(item => item.trim() !== '').map(label => ({ label }));
    createMutation.mutate({
      name: form.name,
      description: form.description,
      asset_type: form.asset_type || undefined,
      items,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Checklist Templates</h2>
          <p className="text-sm text-gray-400">Create and manage reusable inspection checklists</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingTemplate ? 'Edit' : 'Create New'} Template</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                  placeholder="e.g. HVAC Monthly Inspection"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Asset Type</label>
                <select
                  value={form.asset_type}
                  onChange={e => setForm({ ...form, asset_type: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Elevator">Elevator</option>
                  <option value="Fire Extinguisher">Fire Extinguisher</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                rows={2}
                placeholder="Brief description of when to use this checklist"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Checklist Items</label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {form.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={item}
                      onChange={e => handleItemChange(idx, e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                      placeholder={`Item ${idx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="mt-2 text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? 'Saving...' : 'Save Template'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No templates found. Create one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Asset Type</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {templates.map((t: ChecklistTemplate) => (
                <tr key={t.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{t.name}</div>
                    {t.description && <div className="text-xs text-gray-500 line-clamp-1">{t.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400">
                      {t.asset_type || 'All Types'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-green-500/50" />
                      {t.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingTemplate(t); setForm({ name: t.name, description: t.description || '', asset_type: t.asset_type || '', items: t.items.map(i => i.label) }); setShowForm(true); }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => { if (confirm('Delete template?')) deleteMutation.mutate(t.id); }}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ChecklistEngineTab;
