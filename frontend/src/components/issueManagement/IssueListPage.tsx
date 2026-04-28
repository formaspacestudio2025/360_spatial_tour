import React, { useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/api/issuesApi';
import { walkthroughApi } from '@/api/walkthroughs';
import { Issue, IssueAttachment } from '../../types/issue';
import { Link } from 'react-router-dom';
import { AlertCircle, Search, ArrowLeft, MapPin, Building2, Tag, Calendar, User, ExternalLink, Download, Paperclip, Image, FileText, Trash2, Upload, Edit } from 'lucide-react';
import EditIssueStatus from './EditIssueStatus';

// Status badge colors
const statusColors: Record<string, string> = {
  open: 'bg-red-500/20 text-red-400 border-red-500/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  pending_approval: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  verified: 'bg-green-500/20 text-green-400 border-green-500/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  reopened: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

const typeIcons: Record<string, string> = {
  damage: '🔧',
  safety: '⚠️',
  maintenance: '🔨',
  compliance: '📋',
  custom: '📌',
};

interface WalkthroughInfo {
  id: string;
  name: string;
}

const IssueListPage: React.FC = () => {
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Attachment expand state
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  // File selection for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Live clock for SLA countdown (updates every minute)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // SLA stats
  const { data: slaStatsRaw, refetch: refetchSla } = useQuery({
    queryKey: ['sla-stats'],
    queryFn: () => issuesApi.getSlaStats(),
    select: (data) => data,
  });
  const slaStats = slaStatsRaw?.data;

  // SLA check mutation (can be called periodically)
  const slaCheckMutation = useMutation({
    mutationFn: () => issuesApi.checkSla(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      refetchSla();
    },
  });

  // Mutations for bulk actions
  const queryClient = useQueryClient();
  const updateIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      clearSelection();
    },
  });
  const deleteIssueMutation = useMutation({
    mutationFn: (id: string) => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      clearSelection();
    },
  });

  // Attachment handling mutations
  const uploadAttachmentMutation = useMutation({
    mutationFn: ({ issueId, file }: { issueId: string; file: File }) => issuesApi.uploadAttachment(issueId, file),
    onSuccess: () => {
      if (expandedIssueId) {
        queryClient.invalidateQueries({ queryKey: ['attachments', expandedIssueId] });
      }
      setSelectedFile(null);
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: ({ issueId, attachmentId }: { issueId: string; attachmentId: string }) =>
      issuesApi.deleteAttachment(issueId, attachmentId),
    onSuccess: () => {
      if (expandedIssueId) {
        queryClient.invalidateQueries({ queryKey: ['attachments', expandedIssueId] });
      }
    },
  });

  // Query for attachments of expanded issue
  const { data: attachmentList, isLoading: attachmentsLoading } = useQuery({
    queryKey: ['attachments', expandedIssueId],
    queryFn: () => expandedIssueId ? issuesApi.getAttachments(expandedIssueId) : Promise.resolve(null),
    enabled: !!expandedIssueId,
  });

  const [issues, setIssues] = useState<Issue[]>([]);
  const [walkthroughs, setWalkthroughs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [selectedWalkthrough, setSelectedWalkthrough] = useState<string>('all');
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, walksRes] = await Promise.all([
          issuesApi.getAll(),
          walkthroughApi.getAll(),
        ]);
        setIssues(issuesRes.data || []);
        const map: Record<string, string> = {};
        (walksRes.data || []).forEach((w: WalkthroughInfo) => { map[w.id] = w.name; });
        setWalkthroughs(map);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        (issue.description || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
      const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
      const matchesWalkthrough = selectedWalkthrough === 'all' || issue.walkthrough_id === selectedWalkthrough;
      return matchesSearch && matchesStatus && matchesSeverity && matchesWalkthrough;
    });
  }, [issues, search, filterStatus, filterSeverity, selectedWalkthrough]);

  // SLA helper
  const getSlaInfo = (issue: Issue) => {
    if (!issue.due_date) return null;
    const now = new Date();
    const due = new Date(issue.due_date);
    const diffMs = due.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) return { text: `${Math.abs(daysRemaining)}d overdue`, color: 'text-red-400', bg: 'bg-red-500/20' };
    if (daysRemaining <= 2) return { text: `${daysRemaining}d left`, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { text: `${daysRemaining}d left`, color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'verified').length,
    critical: issues.filter(i => i.severity === 'critical').length,
  }), [issues]);

  const handleExportCsv = () => {
    const params: any = {};
    if (selectedWalkthrough !== 'all') params.walkthrough_id = selectedWalkthrough;
    if (filterStatus !== 'all') params.status = filterStatus;
    if (filterSeverity !== 'all') params.priority = filterSeverity;
    issuesApi.exportCsv(params);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg">Loading issues...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Issue Management</h1>
              <p className="text-sm text-gray-400">Track and manage issues across all walkthroughs</p>
            </div>
          </div>

          {/* SLA Stats */}
          {slaStats && (
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                SLA: <span className="text-white font-semibold">{slaStats.total_with_sla}</span> tracked
              </span>
              {slaStats.overdue > 0 && (
                <span className="text-red-400 font-semibold">
                  {slaStats.overdue} overdue
                </span>
              )}
              {slaStats.critical_overdue > 0 && (
                <span className="text-red-500 font-semibold">
                  {slaStats.critical_overdue} critical
                </span>
              )}
              <button
                onClick={() => slaCheckMutation.mutate()}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs"
              >
                Run SLA Check
              </button>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-gray-900' },
            { label: 'Open', value: stats.open, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { label: 'Resolved', value: stats.resolved, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Critical', value: stats.critical, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} border border-gray-800 rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedWalkthrough}
                onChange={(e) => setSelectedWalkthrough(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Walkthroughs</option>
                {Object.entries(walkthroughs).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                {Object.keys(statusColors).map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-gray-800/50 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{selectedIds.size} selected</span>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => {
                    updateIssueMutation.mutate({ id, data: { status: 'in_progress' } });
                  });
                  clearSelection();
                }}
                className="px-2 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded"
              >
                Set In-Progress
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => {
                    deleteIssueMutation.mutate(id);
                  });
                  clearSelection();
                }}
                className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
            <button onClick={clearSelection} className="text-gray-400 hover:text-white">✕ Clear</button>
          </div>
        )}

        {/* Issue List */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-16 bg-gray-900/50 border border-gray-800 rounded-xl">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No issues found</h3>
              <p className="text-gray-400">
                {search || filterStatus !== 'all' || filterSeverity !== 'all' || selectedWalkthrough !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Issues will appear here when created from walkthrough scenes'}
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-primary-500/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(issue.id)}
                      onChange={() => toggleSelect(issue.id)}
                      className="mt-1 accent-primary-500"
                    />
                    <span className="text-xl">{typeIcons[issue.type] || '📌'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {issue.title}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[issue.status] || statusColors.open}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${severityColors[issue.severity] || severityColors.medium}`}>
                          {issue.severity}
                        </span>
                        {getSlaInfo(issue) && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getSlaInfo(issue)!.bg} ${getSlaInfo(issue)!.color}`}>
                            {getSlaInfo(issue)!.text}
                          </span>
                        )}
                      </div>
                      {issue.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{issue.description}</p>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/walkthrough/${issue.walkthrough_id}`}
                    className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
                    title="Open walkthrough"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>

                {/* Attachment toggle button */}
                <button
                  onClick={() => setExpandedIssueId(expandedIssueId === issue.id ? null : issue.id)}
                  className="mt-2 text-sm text-primary-400 hover:underline flex items-center gap-1"
                >
                  <Paperclip size={14} />
                  {expandedIssueId === issue.id ? 'Hide Attachments' : 'Show Attachments'}
                </button>

                {/* Edit Status button */}
                {editingIssueId !== issue.id && issue.status !== 'resolved' && (
                  <button
                    onClick={() => setEditingIssueId(issue.id)}
                    className="mt-2 text-sm text-blue-400 hover:underline flex items-center gap-1 ml-4"
                  >
                    <Edit size={14} />
                    Edit Status
                  </button>
                )}

                {/* Attachment panel */}
                {expandedIssueId === issue.id && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    {/* Upload */}
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="text-gray-400 text-sm"
                      />
                      <button
                        disabled={!selectedFile || uploadAttachmentMutation.isPending}
                        onClick={() => {
                          if (selectedFile && expandedIssueId) {
                            uploadAttachmentMutation.mutate({ issueId: expandedIssueId, file: selectedFile });
                          }
                        }}
                        className="px-3 py-1 bg-primary-600 text-white rounded text-sm disabled:opacity-50 flex items-center gap-1"
                      >
                        <Upload size={14} />
                        {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Upload'}
                      </button>
                    </div>
                    {/* List */}
                    {attachmentsLoading ? (
                      <p className="text-gray-400 text-sm">Loading attachments...</p>
                    ) : (
                      <ul className="space-y-1">
                        {(attachmentList?.data || []).map((att: IssueAttachment) => (
                          <li key={att.id} className="flex items-center justify-between text-sm text-gray-300 bg-gray-800/50 rounded-lg px-3 py-2">
                            <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-400 truncate">
                              {att.file_type?.startsWith('image/') ? <Image size={14} /> : <FileText size={14} />}
                              <span className="truncate">{att.file_url.split('/').pop()}</span>
                            </a>
                            <button
                              onClick={() => deleteAttachmentMutation.mutate({ issueId: issue.id, attachmentId: att.id })}
                              className="text-red-500 hover:text-red-400 ml-2"
                              title="Delete attachment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </li>
                        ))}
                        {(attachmentList?.data || []).length === 0 && (
                          <li className="text-gray-500 text-sm">No attachments yet.</li>
                        )}
                      </ul>
                    )}
                  </div>
                )}

                {/* Edit Status Component */}
                {editingIssueId === issue.id && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <EditIssueStatus
                      issueId={issue.id}
                      currentStatus={issue.status}
                      resolutionImageUrl={issue.resolution_image_url}
                      resolvedAt={issue.resolved_at}
                      onStatusChange={() => {
                        setEditingIssueId(null);
                        queryClient.invalidateQueries({ queryKey: ['issues'] });
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap mt-3">
                  {walkthroughs[issue.walkthrough_id] && (
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {walkthroughs[issue.walkthrough_id]}
                    </span>
                  )}
                  {issue.scene_id && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      Scene: {issue.scene_id.substring(0, 8)}...
                    </span>
                  )}
                  {issue.assigned_to && (
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {issue.assigned_to}
                    </span>
                  )}
                  {issue.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(issue.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    {issue.type}
                  </span>
                  <span>
                    Created: {new Date(issue.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Resolution proof for resolved issues */}
                {issue.status === 'resolved' && issue.resolution_image_url && (
                  <div className="mt-3 border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-400 mb-1">Resolution Proof:</p>
                    <img
                      src={issue.resolution_image_url}
                      alt="Resolution proof"
                      className="max-w-[200px] rounded-lg border border-gray-700"
                    />
                    {issue.resolved_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resolved at: {new Date(issue.resolved_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {filteredIssues.length} of {issues.length} issues
        </div>
      </main>
    </div>
  );
};

export default IssueListPage;
