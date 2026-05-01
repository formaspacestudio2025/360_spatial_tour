import { useState, useEffect } from 'react';
import { X, AlertCircle, Shield, Info, AlertTriangle, AlertOctagon, CheckCircle2, User, Clock, CheckSquare, History, MessageSquare, Download } from 'lucide-react';
import { Issue, CreateIssueData } from '@/types/issue';
import { IssueHistory, IssueComment } from '@/types/issue';
import IssueComments from './IssueComments';
import { issuesApi } from '@/api/issuesApi';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { Box } from 'lucide-react';

interface IssueFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIssueData | Partial<Issue>) => void;
  initialData?: Partial<Issue>;
  mode: 'create' | 'edit';
  isPending?: boolean;
  walkthroughId?: string;
}

type TabType = 'details' | 'assignment' | 'history' | 'comments';

const issueTypes = [
  { value: 'damage', label: 'Damage', icon: AlertOctagon, color: 'text-red-400' },
  { value: 'safety', label: 'Safety', icon: Shield, color: 'text-orange-400' },
  { value: 'maintenance', label: 'Maintenance', icon: Info, color: 'text-blue-400' },
  { value: 'compliance', label: 'Compliance', icon: AlertTriangle, color: 'text-yellow-400' },
  { value: 'custom', label: 'Other', icon: AlertCircle, color: 'text-gray-400' },
] as const;

const severities = [
  { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' },
] as const;

const workflowStatuses = [
  { value: 'open', label: 'Open', color: 'bg-red-500/20 text-red-400' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'verified', label: 'Verified', color: 'bg-green-500/20 text-green-400' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'reopened', label: 'Reopened', color: 'bg-orange-500/20 text-orange-400' },
] as const;

export default function IssueFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
  isPending,
  walkthroughId
}: IssueFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [formData, setFormData] = useState<Partial<Issue>>({
    title: '',
    description: '',
    type: 'maintenance',
    severity: 'medium',
    priority: 'medium',
    status: 'open',
    assigned_to: '',
    due_date: '',
    asset_id: '',
  });

  const { data: assetsResponse } = useQuery({
    queryKey: ['assets-linkable', walkthroughId],
    queryFn: () => assetsApi.getAll({ walkthrough_id: walkthroughId, limit: 100 }),
    enabled: isOpen && !!walkthroughId,
  });
  const assets = assetsResponse?.assets || [];

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        type: initialData.type || 'maintenance',
        severity: initialData.severity || 'medium',
        priority: initialData.priority || initialData.severity || 'medium',
        status: initialData.status || 'open',
        assigned_to: initialData.assigned_to || '',
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : '',
        asset_id: (initialData as any).asset_id || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'maintenance',
        severity: 'medium',
        priority: 'medium',
        status: 'open',
        assigned_to: '',
        due_date: '',
        asset_id: '',
      });
    }
    setActiveTab('details');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderDetailsTab = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
          placeholder="e.g. Cracked floor tile"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Box size={14} /> Link to Asset (Optional)
        </label>
        <select
          value={formData.asset_id || ''}
          onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
        >
          <option value="">No Asset Linked</option>
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.brand} {a.model})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all min-h-[80px] text-sm"
          placeholder="Describe the issue in detail..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Issue['type'] })}
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
          >
            {issueTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Severity</label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as Issue['severity'] })}
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
          >
            {severities.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Priority (SLA)</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFormData({ ...formData, priority: p as Issue['priority'] })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                formData.priority === p
                  ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as Issue['status'] })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
        >
          {workflowStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Assign To</label>
          <input
            type="text"
            value={formData.assigned_to || ''}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
            placeholder="User ID or name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Due Date</label>
          <input
            type="date"
            value={formData.due_date || ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
          />
        </div>
      </div>
    </div>
  );

  const renderAssignmentTab = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Assign To</label>
        <input
          type="text"
          value={formData.assigned_to || ''}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
          placeholder="User ID or name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Due Date</label>
        <input
          type="date"
          value={formData.due_date || ''}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Priority</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high', 'critical'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFormData({ ...formData, priority: p as Issue['priority'] })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                formData.priority === p
                  ? 'bg-primary-600/20 border-primary-500 text-primary-400'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => {
    const history = initialData?.history || [];
    return (
      <div className="space-y-3 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No history yet.</div>
        ) : (
          history.map((h: IssueHistory) => (
            <div key={h.id} className="bg-gray-800/30 p-3 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <History size={14} className="text-gray-400" />
                <span className="text-white">{h.action}</span>
                <span className="text-xs text-gray-500 ml-auto">{new Date(h.timestamp || h.created_at).toLocaleString()}</span>
              </div>
              {h.field && (
                <p className="text-xs text-gray-400 mt-1">
                  {h.field}: {h.old_value} → {h.new_value}
                </p>
              )}
              {h.details && <p className="text-xs text-gray-400 mt-1">{h.details}</p>}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderCommentsTab = () => {
    if (!initialData?.id) {
      return <div className="text-center text-gray-500 py-4 animate-in fade-in">Save the issue first to enable comments.</div>;
    }
    return <IssueComments issueId={initialData.id} comments={initialData.comments || []} />;
  };

  const tabs = [
    { key: 'details' as TabType, label: 'Details', icon: Info },
    { key: 'assignment' as TabType, label: 'Assignment', icon: User },
    ...(mode === 'edit' ? [
      { key: 'history' as TabType, label: 'History', icon: History },
      { key: 'comments' as TabType, label: 'Comments', icon: MessageSquare },
    ] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {mode === 'create' ? 'Create New Issue' : 'Edit Issue'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {mode === 'create' ? 'Report a new issue in this scene' : 'Update issue details and workflow'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'assignment' && renderAssignmentTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'comments' && renderCommentsTab()}

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : mode === 'create' ? 'Create Issue' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
