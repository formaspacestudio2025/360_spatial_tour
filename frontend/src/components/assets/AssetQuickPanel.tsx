import { useState } from 'react';
import { X, Info, AlertCircle, Wrench, FileText, MapPin } from 'lucide-react';
import { Asset } from '@/types';
import { useAssetContext } from '@/hooks/useAssetContext';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';

interface AssetQuickPanelProps {
  assetId: string | null;
  mode?: 'view' | 'inspect' | 'maintain';
  onClose: () => void;
  onJumpToScene?: (walkthroughId: string, sceneId: string) => void;
}

type TabType = 'overview' | 'issues' | 'maintenance' | 'documents';

export default function AssetQuickPanel({ assetId, mode, onClose, onJumpToScene }: AssetQuickPanelProps) {
  const getInitialTab = (): TabType => {
    if (mode === 'inspect') return 'issues';
    if (mode === 'maintain') return 'maintenance';
    return 'overview';
  };
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());

  const { data: context, isLoading, error } = useQuery({
    queryKey: ['asset-quick-panel', assetId],
    queryFn: () => assetsApi.getContext(assetId!),
    enabled: !!assetId,
  });

  const asset = context?.asset;

  if (!assetId) return null;

  const statusColors: Record<string, string> = {
    commissioning: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    maintenance: 'bg-yellow-500/20 text-yellow-400',
    repair: 'bg-red-500/20 text-red-400',
    decommissioned: 'bg-gray-400/20 text-gray-400',
    disposed: 'bg-gray-600/20 text-gray-500',
  };

  const typeColors: Record<string, string> = {
    HVAC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Elevator: 'bg-green-500/20 text-green-400 border-green-500/30',
    'Fire Extinguisher': 'bg-red-500/20 text-red-400 border-red-500/30',
    Lighting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Plumbing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Asset Details</h2>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">Failed to load asset</div>
        </div>
      )}

      {asset && !isLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* Asset Info Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-gray-800 rounded-lg">
                <Info size={20} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{asset.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[asset.type] || typeColors.Other}`}>
                  {asset.type}
                </span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${statusColors[asset.status]}`}>
                {asset.status}
              </span>
            </div>

            {asset.health_score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Health:</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-full rounded-full ${
                      asset.health_score >= 80 ? 'bg-green-500' :
                      asset.health_score >= 60 ? 'bg-yellow-500' :
                      asset.health_score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${asset.health_score}%` }}
                  />
                </div>
                <span className="text-xs text-white">{asset.health_score}</span>
              </div>
            )}

            {asset.scene_id && asset.walkthrough_id && onJumpToScene && (
              <button
                onClick={() => onJumpToScene(asset.walkthrough_id!, asset.scene_id!)}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <MapPin size={12} />
                Jump to Scene
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {(['overview', 'issues', 'maintenance', 'documents'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    {asset.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Brand</span>
                        <span className="text-white">{asset.brand}</span>
                      </div>
                    )}
                    {asset.model && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Model</span>
                        <span className="text-white">{asset.model}</span>
                      </div>
                    )}
                    {asset.serial_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Serial</span>
                        <span className="text-white font-mono text-xs">{asset.serial_number}</span>
                      </div>
                    )}
                    {asset.floor !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Floor</span>
                        <span className="text-white">Floor {asset.floor}</span>
                      </div>
                    )}
                    {asset.room && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Room</span>
                        <span className="text-white">{asset.room}</span>
                      </div>
                    )}
                  </div>
                </div>

                {asset.purchase_date && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Purchase Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span className="text-white">{new Date(asset.purchase_date).toLocaleDateString()}</span>
                      </div>
                      {asset.purchase_price && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Price</span>
                          <span className="text-white">${asset.purchase_price.toFixed(2)}</span>
                        </div>
                      )}
                      {asset.warranty_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Warranty</span>
                          <span className="text-white">{new Date(asset.warranty_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'issues' && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <AlertCircle size={14} />
                  Issues ({context?.issues?.length || 0})
                </h4>
                {!context?.issues || context.issues.length === 0 ? (
                  <p className="text-gray-500 text-sm">No issues linked to this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {context.issues.map((issue: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-800/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                            issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {issue.severity}
                          </span>
                          <span className="text-white flex-1">{issue.title}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{issue.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'maintenance' && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Wrench size={14} />
                  Work Orders ({context?.workOrders?.length || 0})
                </h4>
                {!context?.workOrders || context.workOrders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No work orders for this asset.</p>
                ) : (
                  <div className="space-y-2">
                    {context.workOrders.map((wo: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-800/50 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            wo.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            wo.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            wo.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {wo.status}
                          </span>
                          <span className="text-white flex-1">{wo.title}</span>
                        </div>
                        {wo.priority && (
                          <p className="text-gray-400 text-xs mt-1">Priority: {wo.priority}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <FileText size={14} />
                  Documents ({asset.documents?.length || 0})
                </h4>
                {!asset.documents || asset.documents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No documents attached.</p>
                ) : (
                  <div className="space-y-2">
                    {asset.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-800/50 rounded text-sm flex items-center gap-2">
                        <FileText size={14} className="text-gray-400" />
                        <span className="text-white flex-1">{doc.originalname || doc.filename}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
