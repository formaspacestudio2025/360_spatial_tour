import { useState, useCallback, useMemo } from 'react';
import { Wrench, AlertCircle, Clock, Calendar, CheckCircle2, XCircle, Filter, Search, Plus } from 'lucide-react';
import { Asset } from '@/types';

interface WorkOrder {
  id: string;
  assetId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: string;
  assignedTo?: string;
  createdAt: string;
}

interface MaintenanceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  workOrders?: WorkOrder[];
  onCreateWorkOrder?: (assetId: string, data: Partial<WorkOrder>) => void;
  onUpdateWorkOrder?: (workOrderId: string, data: Partial<WorkOrder>) => void;
}

function MaintenanceOverlay({
  isOpen,
  onClose,
  assets,
  workOrders = [],
  onCreateWorkOrder,
  onUpdateWorkOrder,
}: MaintenanceOverlayProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWOTitle, setNewWOTitle] = useState('');
  const [newWODesc, setNewWODesc] = useState('');
  const [newWOPriority, setNewWOPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Get work orders for selected asset
  const selectedAssetWorkOrders = useMemo(() => {
    if (!selectedAssetId) return [];
    return workOrders.filter(wo => wo.assetId === selectedAssetId);
  }, [selectedAssetId, workOrders]);

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      if (filterStatus !== 'all' && wo.status !== filterStatus) return false;
      if (filterPriority !== 'all' && wo.priority !== filterPriority) return false;
      if (searchQuery && !wo.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [workOrders, filterStatus, filterPriority, searchQuery]);

  // Get assets with work orders
  const assetsWithWorkOrders = useMemo(() => {
    const assetWorkOrderMap = new Map<string, WorkOrder[]>();
    workOrders.forEach(wo => {
      if (!assetWorkOrderMap.has(wo.assetId)) {
        assetWorkOrderMap.set(wo.assetId, []);
      }
      assetWorkOrderMap.get(wo.assetId)!.push(wo);
    });

    return assets.map(asset => ({
      ...asset,
      workOrders: assetWorkOrderMap.get(asset.id) || [],
      hasOpenWorkOrders: assetWorkOrderMap.get(asset.id)?.some(wo =>
        wo.status === 'pending' || wo.status === 'in_progress'
      ) || false
    }));
  }, [assets, workOrders]);

  // Get selected asset
  const selectedAsset = useMemo(() => {
    return assetsWithWorkOrders.find(a => a.id === selectedAssetId);
  }, [selectedAssetId, assetsWithWorkOrders]);

  // Handle asset selection
  const handleAssetSelect = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setShowCreateForm(false);
  }, []);

  // Handle work order status update
  const handleStatusUpdate = useCallback((workOrderId: string, newStatus: WorkOrder['status']) => {
    if (onUpdateWorkOrder) {
      onUpdateWorkOrder(workOrderId, { status: newStatus });
    }
  }, [onUpdateWorkOrder]);

  // Handle create work order
  const handleCreateWorkOrder = useCallback((data: Partial<WorkOrder>) => {
    if (selectedAssetId && onCreateWorkOrder) {
      onCreateWorkOrder(selectedAssetId, data);
      setShowCreateForm(false);
    }
  }, [selectedAssetId, onCreateWorkOrder]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-amber-900/10 pointer-events-none z-40" />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-gray-900 border-l border-amber-500/30 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="bg-amber-900/20 border-b border-amber-500/30 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={20} className="text-amber-500" />
            <div>
              <h2 className="text-white font-semibold">Maintenance Mode</h2>
              <p className="text-xs text-gray-400">Manage work orders and assets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-900/30 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <XCircle size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Filters</span>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="mt-3 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search work orders..."
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Asset List */}
          <div className="w-1/2 border-r border-gray-800 overflow-y-auto">
            <div className="p-3">
              <h3 className="text-white text-sm font-medium mb-3">Assets ({assetsWithWorkOrders.length})</h3>
              <div className="space-y-2">
                {assetsWithWorkOrders.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => handleAssetSelect(asset.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${selectedAssetId === asset.id
                        ? 'bg-amber-600/20 border border-amber-500/30'
                        : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">{asset.name}</div>
                        <div className="text-xs text-gray-400">{asset.type}</div>
                      </div>
                      {asset.hasOpenWorkOrders && (
                        <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${asset.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          asset.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                        {asset.status}
                      </span>
                      {asset.workOrders.length > 0 && (
                        <span className="text-[10px] text-gray-500">
                          {asset.workOrders.length} WO{asset.workOrders.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Work Orders */}
          <div className="w-1/2 overflow-y-auto">
            {selectedAsset ? (
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white text-sm font-medium">
                    {selectedAsset.name}
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="p-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-white"
                    title="Create Work Order"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {showCreateForm && (
                  <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                      type="text"
                      value={newWOTitle}
                      onChange={(e) => setNewWOTitle(e.target.value)}
                      placeholder="Work order title..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm mb-2 focus:border-amber-500 focus:outline-none"
                    />
                    <textarea
                      value={newWODesc}
                      onChange={(e) => setNewWODesc(e.target.value)}
                      placeholder="Description..."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm mb-2 focus:border-amber-500 focus:outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <select
                        value={newWOPriority}
                        onChange={(e) => setNewWOPriority(e.target.value as any)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 focus:outline-none"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!newWOTitle) return;
                          handleCreateWorkOrder({
                            title: newWOTitle,
                            description: newWODesc,
                            priority: newWOPriority,
                            status: 'pending'
                          });
                          setNewWOTitle('');
                          setNewWODesc('');
                        }}
                        disabled={!newWOTitle}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}

                {selectedAssetWorkOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No work orders for this asset
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedAssetWorkOrders.map(wo => (
                      <div
                        key={wo.id}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{wo.title}</div>
                            <div className="text-xs text-gray-400 line-clamp-2">{wo.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(wo.priority)}`}>
                            {wo.priority}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(wo.status)}`}>
                            {wo.status.replace('_', ' ')}
                          </span>
                        </div>
                        {wo.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-2">
                            <Calendar size={10} />
                            <span>Due: {new Date(wo.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex gap-1">
                          {wo.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(wo.id, 'in_progress')}
                              className="flex-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {wo.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(wo.id, 'completed')}
                              className="flex-1 px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select an asset to view work orders
              </div>
            )}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-800/30">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">
                {workOrders.filter(wo => wo.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-400">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {workOrders.filter(wo => wo.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {workOrders.filter(wo => wo.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MaintenanceOverlay;