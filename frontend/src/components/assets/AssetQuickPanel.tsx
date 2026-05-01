import React, { useState } from 'react';
import { X, Info, AlertTriangle, Wrench, FileText } from 'lucide-react';
import { Asset } from '@/types';
import { useAssetContext } from '@/hooks/useAssetContext';
import HealthBadge from './HealthBadge';
import ComplianceTags from './ComplianceTags';
import DocumentUpload from './DocumentUpload';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checklistsApi } from '@/api/checklistsApi';
import { Link } from 'react-router-dom';
import api from '@/api/client';

interface AssetQuickPanelProps {
  assetId: string | null;
  onClose: () => void;
  mode?: 'view' | 'inspect' | 'maintain';
}

type Tab = 'overview' | 'issues' | 'maintenance' | 'documents';

const AssetQuickPanel: React.FC<AssetQuickPanelProps> = ({ assetId, onClose, mode = 'view' }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [isSubmittingWo, setIsSubmittingWo] = useState(false);
  const { data: context, isLoading, error } = useAssetContext(assetId || undefined);
  const queryClient = useQueryClient();
  
  const { data: templates } = useQuery({
    queryKey: ['checklist-templates', context?.asset?.type],
    queryFn: () => checklistsApi.getTemplates(context?.asset?.type),
    enabled: !!context?.asset?.type && (mode === 'inspect' || mode === 'maintain'),
  });

  if (!assetId) return null;

  const tabConfig: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
    { id: 'issues', label: 'Issues', icon: <AlertTriangle size={16} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-white">
            {isLoading ? 'Loading...' : context?.asset?.name || 'Asset'}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${
              mode === 'inspect' ? 'bg-red-500/20 text-red-400' :
              mode === 'maintain' ? 'bg-amber-500/20 text-amber-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {mode} mode
            </span>
            {context?.asset?.type && (
              <span className="text-[10px] text-gray-500">{context.asset.type}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {mode === 'view' && (
        <div className="flex border-b border-gray-800 bg-gray-900/50">
          {tabConfig.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-400 border-b-2 border-primary-400 bg-primary-400/5'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading asset details...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-2" size={24} />
            <p className="text-red-400 text-sm">Failed to load asset context</p>
          </div>
        )}

        {!isLoading && !error && context && (
          <>
            {mode === 'view' ? (
              <div className="space-y-6">
                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Health Analysis</span>
                        {context.asset.health_score !== undefined && (
                          <HealthBadge assetId={context.asset.id} score={context.asset.health_score} />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase">Status</span>
                          <p className="text-sm font-medium text-white capitalize">{context.asset.status}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase">Serial Number</span>
                          <p className="text-sm font-medium text-white">{context.asset.serial_number || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase">Brand</span>
                          <p className="text-sm font-medium text-white">{context.asset.brand || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 uppercase">Model</span>
                          <p className="text-sm font-medium text-white">{context.asset.model || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-800">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Compliance & Certifications</h3>
                      <ComplianceTags
                        assetId={context.asset.id}
                        compliance={context.asset.compliance || []}
                        onUpdate={() => {}}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {/* Issues Tab Content */}
                {activeTab === 'issues' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Issues</h3>
                      <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{context.issues.length}</span>
                    </div>
                    {context.issues.length === 0 ? (
                      <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-xl p-8 text-center">
                        <AlertTriangle className="mx-auto text-gray-600 mb-2" size={20} />
                        <p className="text-gray-500 text-sm">No linked issues found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {context.issues.map((issue: any) => (
                          <div key={issue.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-sm text-white font-semibold">{issue.title}</p>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                issue.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {issue.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Maintenance Tab Content */}
                {activeTab === 'maintenance' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Work Orders</h3>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{context.workOrders?.length || 0}</span>
                      </div>
                      {(!context.workOrders || context.workOrders.length === 0) ? (
                        <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-xl p-4 text-center">
                          <p className="text-gray-500 text-xs italic">No active maintenance tasks</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {context.workOrders.map((wo: any) => (
                            <div key={wo.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-3 hover:border-gray-700 transition-colors">
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm text-white font-medium">{wo.title}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  wo.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {wo.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate">{wo.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inspection History</h3>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">{context.inspections.length}</span>
                      </div>
                      {context.inspections.length === 0 ? (
                        <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-xl p-4 text-center">
                          <p className="text-gray-500 text-xs italic">No inspection records</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {context.inspections.map((insp: any) => (
                            <div key={insp.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm text-white font-medium">{insp.title || 'General Inspection'}</p>
                                <span className="text-[10px] text-gray-500">{new Date(insp.created_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${insp.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                <span className="text-[10px] text-gray-400 capitalize">{insp.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents Tab Content */}
                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Documentation</h3>
                    </div>
                    <DocumentUpload 
                      assetId={context.asset.id} 
                      documents={context.asset.documents || []} 
                      onUpdate={() => {
                        queryClient.invalidateQueries({ queryKey: ['asset-context', assetId] });
                        queryClient.invalidateQueries({ queryKey: ['assets'] });
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Inspection / Maintenance Mode Checklist Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <FileText className="text-primary-400" size={16} />
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Inspection Template</h3>
                  </div>
                  
                  {!templates || templates.length === 0 ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 text-center">
                      <p className="text-amber-400 text-sm">No templates found for {context.asset.type}</p>
                      <Link to="/assets" className="text-xs text-primary-400 mt-2 inline-block hover:underline">
                        Create templates in Asset Management
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {templates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left group ${
                            selectedTemplateId === template.id
                              ? 'bg-primary-500/10 border-primary-500 shadow-lg shadow-primary-500/10'
                              : 'bg-gray-800/40 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className={`text-sm font-semibold transition-colors ${
                              selectedTemplateId === template.id ? 'text-primary-400' : 'text-white'
                            }`}>
                              {template.name}
                            </span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedTemplateId === template.id ? 'border-primary-500 bg-primary-500' : 'border-gray-700'
                            }`}>
                              {selectedTemplateId === template.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">{template.description || 'Standard inspection checklist'}</p>
                          <div className="mt-3 flex items-center gap-2 opacity-60">
                            <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full">{template.items.length} points</span>
                            <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded-full">Reusable</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedTemplateId && (
                    <button
                      onClick={() => {
                        // This will be handled by the parent component (WalkthroughViewer)
                        // to show the ChecklistPerformer
                        (window as any).dispatchEvent(new CustomEvent('start-inspection', {
                          detail: { asset: context.asset, templateId: selectedTemplateId }
                        }));
                      }}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all transform active:scale-[0.98] mt-4 flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Start Inspection
                    </button>
                  )}
                </div>

                {mode === 'maintain' && (
                  <div className="pt-6 border-t border-gray-800 space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Wrench className="text-amber-400" size={16} />
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Maintenance & Work Orders</h3>
                      </div>
                      <button 
                        onClick={() => setIsCreatingWorkOrder(true)}
                        className="text-[10px] text-primary-400 hover:text-primary-300 font-bold bg-primary-400/10 px-2 py-1 rounded"
                      >
                        + NEW ORDER
                      </button>
                    </div>

                    {isCreatingWorkOrder ? (
                      <div className="bg-gray-800/40 border border-primary-500/30 rounded-xl p-3 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <input
                          type="text"
                          placeholder="Work Order Title"
                          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:border-primary-500 outline-none"
                          value={workOrderForm.title}
                          onChange={e => setWorkOrderForm(f => ({...f, title: e.target.value}))}
                        />
                        <textarea
                          placeholder="Description..."
                          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:border-primary-500 outline-none min-h-[60px]"
                          value={workOrderForm.description}
                          onChange={e => setWorkOrderForm(f => ({...f, description: e.target.value}))}
                        />
                        <div className="flex gap-2">
                          <select 
                            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-2 py-1.5 text-[10px] focus:border-primary-500 outline-none"
                            value={workOrderForm.priority}
                            onChange={e => setWorkOrderForm(f => ({...f, priority: e.target.value}))}
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="critical">Critical</option>
                          </select>
                          <input
                            type="date"
                            className="flex-1 bg-gray-900 border border-gray-700 text-white rounded-lg px-2 py-1.5 text-[10px] focus:border-primary-500 outline-none"
                            value={workOrderForm.due_date}
                            onChange={e => setWorkOrderForm(f => ({...f, due_date: e.target.value}))}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => setIsCreatingWorkOrder(false)}
                            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            disabled={!workOrderForm.title || isSubmittingWo}
                            onClick={async () => {
                              try {
                                setIsSubmittingWo(true);
                                await api.post('/api/work-orders', { ...workOrderForm, asset_id: context.asset.id, status: 'open' });
                                queryClient.invalidateQueries({ queryKey: ['assetContext', assetId] });
                                queryClient.invalidateQueries({ queryKey: ['assets'] });
                                setIsCreatingWorkOrder(false);
                                setWorkOrderForm({ title: '', description: '', priority: 'medium', due_date: '' });
                              } catch (err) {
                                console.error('Failed to create work order', err);
                              } finally {
                                setIsSubmittingWo(false);
                              }
                            }}
                            className="flex-1 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isSubmittingWo ? 'Saving...' : 'Save Order'}
                          </button>
                        </div>
                      </div>
                    ) : (!context.workOrders || context.workOrders.length === 0) ? (
                      <div className="bg-gray-800/20 border border-dashed border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-500 text-xs">No active work orders</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {context.workOrders.map((wo: any) => (
                          <div key={wo.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm text-white font-medium">{wo.title}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{wo.status}</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{wo.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AssetQuickPanel;
