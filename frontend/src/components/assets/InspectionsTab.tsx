import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inspectionsApi, Inspection } from '@/api/inspectionsApi';
import { assetsApi } from '@/api/assetsApi';
import { walkthroughApi } from '@/api/walkthroughs';
import { checklistsApi } from '@/api/checklistsApi';
import { Plus, Calendar, Search, Filter, Trash2, Clock, CheckCircle2, ChevronRight, MapPin, ClipboardList, Pencil } from 'lucide-react';

const InspectionsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  
  // Queries
  const { data: inspections = [], isLoading: loadingInspections, error: inspectionsError } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => inspectionsApi.getAll(),
  });

  const { data: assetsResponse, error: assetsError } = useQuery({
    queryKey: ['assets-all'],
    queryFn: () => assetsApi.getAll({ limit: 100 }),
  });
  const assets = assetsResponse?.assets || [];

  const { data: walkthroughsResponse, error: walkthroughsError } = useQuery({
    queryKey: ['walkthroughs'],
    queryFn: () => walkthroughApi.getAll(),
  });
  const walkthroughs = walkthroughsResponse?.data || [];

  const { data: templates = [], error: templatesError } = useQuery({
    queryKey: ['checklists'],
    queryFn: () => checklistsApi.getTemplates(),
  });

  // Form State
  const [formData, setFormData] = useState({
    asset_id: '',
    walkthrough_id: '',
    checklist_template_id: '',
    due_date: '',
    title: '',
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: any) => 
      editingInspection 
        ? inspectionsApi.update(editingInspection.id, data)
        : inspectionsApi.scheduleForAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
      setShowScheduleForm(false);
      setEditingInspection(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inspectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    },
  });

  const resetForm = () => {
    setFormData({
      asset_id: '',
      walkthrough_id: '',
      checklist_template_id: '',
      due_date: '',
      title: '',
    });
    setEditingInspection(null);
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingInspection) {
      scheduleMutation.mutate({
        title: formData.title,
        due_date: formData.due_date,
      });
      return;
    }

    const template = templates.find(t => t.id === formData.checklist_template_id);
    const asset = assets.find(a => a.id === formData.asset_id);
    
    if (!template || !asset) return;

    scheduleMutation.mutate({
      asset_id: formData.asset_id,
      walkthrough_id: formData.walkthrough_id || asset.walkthrough_id,
      due_date: formData.due_date,
      title: formData.title || `Inspection: ${asset.name}`,
      checklist: template.items.map(i => i.label),
    });
  };

  const startEdit = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setFormData({
      asset_id: inspection.asset_id || '',
      walkthrough_id: inspection.walkthrough_id || '',
      checklist_template_id: '', // Templates can't be easily re-matched if items changed
      due_date: inspection.due_date ? new Date(inspection.due_date).toISOString().split('T')[0] : '',
      title: inspection.title,
    });
    setShowScheduleForm(true);
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    signed_off: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="space-y-6">
      {(inspectionsError || assetsError || walkthroughsError || templatesError) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">Error loading data</h3>
          {inspectionsError && <p className="text-sm text-red-400">Failed to load inspections.</p>}
          {assetsError && <p className="text-sm text-red-400">Failed to load assets.</p>}
          {walkthroughsError && <p className="text-sm text-red-400">Failed to load walkthroughs.</p>}
          {templatesError && <p className="text-sm text-red-400">Failed to load templates.</p>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Inspection Management</h2>
          <p className="text-sm text-gray-400">Schedule and track asset inspections across all properties</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Schedule Inspection
        </button>
      </div>

      {showScheduleForm && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4">{editingInspection ? 'Edit Scheduled Inspection' : 'New Scheduled Inspection'}</h3>
          <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingInspection && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Select Asset *</label>
                  <select
                    required
                    value={formData.asset_id}
                    onChange={e => {
                      const asset = assets.find(a => a.id === e.target.value);
                      setFormData({ ...formData, asset_id: e.target.value, walkthrough_id: asset?.walkthrough_id || '' });
                    }}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                  >
                    <option value="">Choose an asset...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Checklist Template *</label>
                  <select
                    required
                    value={formData.checklist_template_id}
                    onChange={e => setFormData({ ...formData, checklist_template_id: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {!editingInspection && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Walkthrough (Auto-filled)</label>
                <select
                  value={formData.walkthrough_id}
                  onChange={e => setFormData({ ...formData, walkthrough_id: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                >
                  <option value="">Choose property...</option>
                  {walkthroughs.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:border-primary-500 outline-none"
                placeholder="e.g. Q4 HVAC System Audit"
              />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={scheduleMutation.isPending}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Now'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: inspections.length, icon: ClipboardList, color: 'text-blue-400' },
          { label: 'Pending', value: inspections.filter(i => i.status === 'scheduled').length, icon: Clock, color: 'text-yellow-400' },
          { label: 'Completed', value: inspections.filter(i => ['completed', 'signed_off'].includes(i.status)).length, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'High Priority', value: 0, icon: Filter, color: 'text-red-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Inspections List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loadingInspections ? (
          <div className="p-12 text-center text-gray-500">Loading inspections...</div>
        ) : inspections.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No inspections scheduled.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Title / Asset</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 font-medium uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {inspections.map((insp: Inspection) => {
                const asset = assets.find(a => a.id === insp.asset_id);
                return (
                  <tr key={insp.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{insp.title}</div>
                      {asset && <div className="text-xs text-gray-500">Asset: {asset.name}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-primary-500" />
                        {asset?.room ? `${asset.room}, Floor ${asset.floor}` : 'Unknown Location'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[insp.status] || statusColors.scheduled}`}>
                        {insp.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {insp.due_date ? new Date(insp.due_date).toLocaleDateString() : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => startEdit(insp)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if (window.confirm('Delete this inspection?')) deleteMutation.mutate(insp.id); }}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors" title="View Details">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InspectionsTab;
