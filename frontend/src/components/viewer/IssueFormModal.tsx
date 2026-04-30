import { useState, useEffect } from 'react';
import { X, AlertCircle, Shield, Info, AlertTriangle, AlertOctagon, CheckCircle2, User, Clock, CheckSquare, History, MessageSquare, Download } from 'lucide-react';
import { Issue, CreateIssueData, IssueHistory } from '@/types/issue';
import IssueComments from './IssueComments';
import { issuesApi } from '@/api/issuesApi';

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
];

const severities = [
  { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400' },
];

const workflowStatuses = [
  { value: 'open', label: 'Open', color: 'bg-red-500/20 text-red-400' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'pending_approval', label: 'Pending Approval', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'verified', label: 'Verified', color: 'bg-green-500/20 text-green-400' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'reopened', label: 'Reopened', color: 'bg-orange-500/20 text-orange-400' },
];

import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { Box } from 'lucide-react';

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
        due_date: initialData.due_date ? initialData.due_date.split('T')[0] : '', // Extract YYYY-MM-DD
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
          value={formData.asset_id}
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
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
            onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
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
              onClick={() => setFormData({ ...formData, priority: p as any })}
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

  const renderAssignmentTab = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <User size={14} /> Assign To
        </label>
        <input
          type="text"
          value={formData.assigned_to || ''}
          onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
          placeholder="User email, ID, or Team name"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} /> Due Date
        </label>
        <input
          type="date"
          value={formData.due_date || ''}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
        />
      </div>

      {mode === 'edit' && (
        <div className="pt-2 border-t border-gray-800">
          <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare size={14} /> Workflow Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {workflowStatuses.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: s.value as any })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 border ${
                  formData.status === s.value
                    ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:bg-gray-800'
                }`}
              >
                {formData.status === s.value && <CheckCircle2 size={12} />}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {initialData?.history && initialData.history.length > 0 ? (
        <div className="relative border-l border-gray-700 ml-3 space-y-4 py-2">
          {initialData.history.map((entry: IssueHistory, idx: number) => (
            <div key={entry.id} className="relative pl-6">
              {/* Timeline dot */}
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gray-800 border-2 border-primary-500" />
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-white text-xs font-medium capitalize">{entry.action}</span>
                  <span className="text-gray-500 text-[10px]">
                    {entry.timestamp ? new Date(entry.timestamp).toLocaleString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : 'N/A'}
                  </span>
                </div>
                {entry.details && <p className="text-gray-400 text-xs">{entry.details}</p>}
                {entry.user_id && <p className="text-gray-500 text-[10px] mt-1">by {entry.user_id}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
          <History size={24} className="opacity-50" />
          <p className="text-sm">No history available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="text-primary-500" size={20} />
            {mode === 'create' ? 'Report New Issue' : `Issue #${initialData?.id?.substring(0,6).toUpperCase()}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 px-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'details' ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('assignment')}
            className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'assignment' ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Workflow
            {(formData.assigned_to || formData.status !== 'open') && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            )}
          </button>
          {mode === 'edit' && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'history' ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              History
              {initialData?.history && <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded-full">{initialData.history.length}</span>}
            </button>
          )}
          {mode === 'edit' && (
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === 'comments' ? 'border-primary-500 text-primary-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <MessageSquare size={12} />
              Comments
              {initialData?.comments && initialData.comments.length > 0 && (
                <span className="text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full">{initialData.comments.length}</span>
              )}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Tab Content Area */}
          <div className="min-h-[250px]">
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'assignment' && renderAssignmentTab()}
            {activeTab === 'history' && renderHistoryTab()}
            {activeTab === 'comments' && mode === 'edit' && initialData?.id && (
              <IssueComments issueId={initialData.id} comments={initialData.comments || []} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-5 mt-2 flex gap-3 border-t border-gray-800">
            {mode === 'edit' && initialData?.walkthrough_id && (
              <button
                type="button"
                onClick={() => issuesApi.exportCsv({ walkthrough_id: initialData.walkthrough_id })}
                className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm rounded-xl font-medium transition-all flex items-center gap-1.5"
                title="Export all issues for this property"
              >
                <Download size={14} />
                CSV
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-xl font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
            >
              {isPending ? 'Processing...' : mode === 'create' ? 'Create Issue' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
