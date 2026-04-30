import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistsApi, ChecklistTemplate } from '@/api/checklistsApi';

import Header from '@/components/layout/Header';

const ChecklistBuilder: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => checklistsApi.getTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: checklistsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => checklistsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: any }) =>
      checklistsApi.assignToAsset(templateId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inspections'] }),
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    asset_type: '',
    items: [''], // list of label strings
  });

  const [assignData, setAssignData] = useState({
    templateId: '',
    asset_id: '',
    walkthrough_id: '',
    due_date: '',
  });

  const handleAddItem = () => setForm({ ...form, items: [...form.items, ''] });
  const handleItemChange = (idx: number, value: string) => {
    const newItems = [...form.items];
    newItems[idx] = value;
    setForm({ ...form, items: newItems });
  };
  const handleRemoveItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleCreate = () => {
    const items = form.items.filter(item => item.trim() !== '').map(label => ({ label }));
    createMutation.mutate({
      name: form.name,
      description: form.description,
      asset_type: form.asset_type || undefined,
      items,
    });
    setForm({ name: '', description: '', asset_type: '', items: [''] });
  };

  const handleAssign = () => {
    assignMutation.mutate({
      templateId: assignData.templateId,
      data: {
        asset_id: assignData.asset_id,
        walkthrough_id: assignData.walkthrough_id,
        due_date: assignData.due_date || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Checklist Templates</h2>

        {/* Create Template Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Template Name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
            />
            <select
              value={form.asset_type}
              onChange={e => setForm({ ...form, asset_type: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
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
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white mb-4 focus:border-primary-500 focus:outline-none"
            rows={2}
          />
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Checklist Items</label>
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`Item ${idx + 1}`}
                  value={item}
                  onChange={e => handleItemChange(idx, e.target.value)}
                  className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
                />
                <button onClick={() => handleRemoveItem(idx)} className="px-2 text-red-400 hover:text-red-300">
                  ✕
                </button>
              </div>
            ))}
            <button onClick={handleAddItem} className="text-sm text-primary-400 hover:text-primary-300">
              + Add Item
            </button>
          </div>
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Template'}
          </button>
        </div>

        {/* Assign Template */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Assign Template to Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Template ID"
              value={assignData.templateId}
              onChange={e => setAssignData({ ...assignData, templateId: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Asset ID"
              value={assignData.asset_id}
              onChange={e => setAssignData({ ...assignData, asset_id: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Walkthrough ID"
              value={assignData.walkthrough_id}
              onChange={e => setAssignData({ ...assignData, walkthrough_id: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
            />
            <input
              type="date"
              placeholder="Due Date"
              value={assignData.due_date}
              onChange={e => setAssignData({ ...assignData, due_date: e.target.value })}
              className="p-2 bg-gray-800 border border-gray-700 rounded text-white focus:border-primary-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleAssign}
            disabled={assignMutation.isPending}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg disabled:opacity-50"
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign to Asset'}
          </button>
        </div>

        {/* List Templates */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Existing Templates</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-xl">Loading...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-800">
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-center">Items</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t: ChecklistTemplate) => (
                    <tr key={t.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-2 font-medium">{t.name}</td>
                      <td className="p-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-800 border border-gray-700 rounded-full text-gray-400">
                          {t.asset_type || 'All Types'}
                        </span>
                      </td>
                      <td className="p-2 text-center">{t.items.length}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => { if (confirm('Delete template?')) deleteMutation.mutate(t.id); }}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">No templates yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChecklistBuilder;
