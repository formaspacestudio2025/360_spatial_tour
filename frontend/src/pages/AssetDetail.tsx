import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { Asset } from '@/types';
import { ArrowLeft, Map, Calendar, QrCode, Box, AlertCircle, FileText, Activity, ArrowRight, History } from 'lucide-react';
import QRModal from '@/components/assets/QRModal';
import DocumentUpload from '@/components/assets/DocumentUpload';
import HealthBadge from '@/components/assets/HealthBadge';
import PMSchedule from '@/components/assets/PMSchedule';
import ComplianceTags from '@/components/assets/ComplianceTags';
import { useState } from 'react';
import LifecycleTab from '@/components/assets/LifecycleTab';
import AssetTimeline from '@/components/assets/AssetTimeline';
import { useAuthStore } from '@/stores/authStore';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [showLifecycle, setShowLifecycle] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetsApi.getById(id!),
    enabled: !!id,
  });

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['asset-documents', id],
    queryFn: () => assetsApi.getDocuments(id!),
    enabled: !!id,
  });

  const { data: twinSummary } = useQuery({
    queryKey: ['asset-twin-summary', id],
    queryFn: () => assetsApi.getDigitalTwinSummary(id!),
    enabled: !!id,
  });

  const handleDocumentUpdate = () => {
    refetchDocuments();
    queryClient.invalidateQueries({ queryKey: ['asset', id] });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg">Loading asset...</div>
    </div>
  );

  if (error || !asset) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <p className="text-red-400 text-lg">Asset not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  const a = asset as Asset;

  const typeColors: Record<string, string> = {
    HVAC: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Elevator: 'bg-green-500/20 text-green-400 border-green-500/30',
    'Fire Extinguisher': 'bg-red-500/20 text-red-400 border-red-500/30',
    Lighting: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Plumbing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  const statusColors: Record<string, string> = {
    commissioning: 'bg-blue-500/20 text-blue-400',
    active: 'bg-green-500/20 text-green-400',
    maintenance: 'bg-yellow-500/20 text-yellow-400',
    repair: 'bg-red-500/20 text-red-400',
    decommissioned: 'bg-gray-400/20 text-gray-400',
    disposed: 'bg-gray-600/20 text-gray-500',
  };

  const allowedTransitionsMap: Record<string, string[]> = {
    commissioning: ['active'],
    active: ['maintenance', 'repair', 'decommissioned'],
    maintenance: ['active', 'repair'],
    repair: ['active', 'maintenance'],
    decommissioned: ['disposed', 'active'],
    disposed: [],
  };
  const allowedTransitions = allowedTransitionsMap[a.status] || [];

  const handleTransition = async () => {
    if (!selectedStatus || !reason.trim()) return;
    setIsTransitioning(true);
    try {
      await assetsApi.transition(id!, selectedStatus, reason, user?.id || 'unknown');
      setShowTransitionModal(false);
      setSelectedStatus('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
    } catch (error: any) {
      alert('Transition failed: ' + error.message);
    } finally {
      setIsTransitioning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{a.name}</h1>
            <p className="text-sm text-gray-400">Asset Details</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center gap-2"
            >
              <QrCode size={16} />
              QR Code
            </button>
            {a.scene_id && a.walkthrough_id && (
              <button
                onClick={() => navigate(`/walkthrough/${a.walkthrough_id}?scene=${a.scene_id}`)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm flex items-center gap-2"
              >
                <Map size={16} />
                Jump to Scene
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <Box size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{a.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full border ${typeColors[a.type] || typeColors.Other}`}>
                      {a.type}
                    </span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${statusColors[a.status]}`}>
                  {a.status}
                </span>
                {allowedTransitions.length > 0 && (
                  <button
                    onClick={() => setShowTransitionModal(true)}
                    className="ml-2 text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded"
                  >
                    Change State
                  </button>
                )}
                {a.health_score !== undefined && (
                  <HealthBadge assetId={a.id} score={a.health_score} size="sm" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {a.brand && (
                  <div>
                    <p className="text-xs text-gray-500">Brand</p>
                    <p className="text-white">{a.brand}</p>
                  </div>
                )}
                {a.model && (
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-white">{a.model}</p>
                  </div>
                )}
                {a.serial_number && (
                  <div>
                    <p className="text-xs text-gray-500">Serial Number</p>
                    <p className="text-white">{a.serial_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Asset ID</p>
                  <p className="text-white font-mono text-sm">{a.id}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            {(a.scene_id || a.floor !== undefined || a.room) && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Map size={18} />
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {a.scene_id && (
                    <div>
                      <p className="text-xs text-gray-500">Scene ID</p>
                      <p className="text-white font-mono text-sm">{a.scene_id}</p>
                    </div>
                  )}
                  {a.floor !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Floor</p>
                      <p className="text-white">Floor {a.floor}</p>
                    </div>
                  )}
                  {a.room && (
                    <div>
                      <p className="text-xs text-gray-500">Room</p>
                      <p className="text-white">{a.room}</p>
                    </div>
                  )}
                  {a.yaw !== undefined && a.pitch !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500">Coordinates</p>
                      <p className="text-white text-sm">Yaw: {a.yaw}°, Pitch: {a.pitch}°</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lifecycle */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={18} />
                  Lifecycle
                </h3>
                <button
                  onClick={() => setShowLifecycle(true)}
                  className="text-sm text-primary-400 hover:text-primary-300"
                >
                  View Details
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {a.purchase_date && (
                  <div>
                    <p className="text-xs text-gray-500">Purchase Date</p>
                    <p className="text-white">{new Date(a.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                {a.warranty_date && (
                  <div>
                    <p className="text-xs text-gray-500">Warranty Expiry</p>
                    <p className="text-white">{new Date(a.warranty_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={18} />
                Documents
              </h3>
              <DocumentUpload
                assetId={a.id}
                documents={documents}
                onUpdate={handleDocumentUpdate}
              />
            </div>

            {/* Preventive Maintenance Schedule */}
            <PMSchedule assetId={a.id} />

            {/* Compliance Tags */}
            {a.compliance && a.compliance.length > 0 && (
              <ComplianceTags assetId={a.id} compliance={a.compliance} onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['asset', a.id] });
              }} />
            )}

            {/* State History */}
            {a.transition_history && a.transition_history.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <History size={18} />
                  State History
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {a.transition_history.slice().reverse().map((trans: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm border-b border-gray-800 pb-3 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[trans.from_status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {trans.from_status}
                          </span>
                          <ArrowRight size={12} className="text-gray-500" />
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColors[trans.to_status] || 'bg-gray-500/20 text-gray-400'}`}>
                            {trans.to_status}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-1">{trans.reason}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(trans.timestamp).toLocaleString()} by {trans.user_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Asset Timeline */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <History size={18} />
                Asset Timeline
              </h3>
              <AssetTimeline assetId={a.id} />
            </div>

            {/* Digital Twin Summary */}
            {twinSummary && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity size={18} />
                  Digital Twin Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Inspections</p>
                    <p className="text-white text-xl font-bold">{twinSummary.total_inspections}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Maintenance</p>
                    <p className="text-white text-xl font-bold">{twinSummary.total_maintenance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Issues Resolved</p>
                    <p className="text-white text-xl font-bold">{twinSummary.resolved_issues}/{twinSummary.total_issues}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Uptime</p>
                    <p className="text-white text-xl font-bold">{twinSummary.uptime_percentage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">MTBF (days)</p>
                    <p className="text-white text-xl font-bold">{twinSummary.mtbf_days}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Cost</p>
                    <p className="text-white text-xl font-bold">${twinSummary.total_cost.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Health Trend:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      twinSummary.health_trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                      twinSummary.health_trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {twinSummary.health_trend}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div> {/* closes md:col-span-2 */}

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowQR(true)}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <QrCode size={16} />
                  Show QR Code
                </button>
                {a.scene_id && a.walkthrough_id && (
                  <button
                    onClick={() => navigate(`/walkthrough/${a.walkthrough_id}?scene=${a.scene_id}`)}
                    className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <Map size={16} />
                    View in Scene
                  </button>
                )}
                <Link
                  to="/assets"
                  className="block w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm text-center"
                >
                  All Assets
                </Link>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-300">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-gray-300">{new Date(a.updated_at).toLocaleDateString()}</span>
                </div>
                {a.walkthrough_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Walkthrough</span>
                    <span className="text-gray-300 font-mono text-xs">{a.walkthrough_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR Modal */}
      {showQR && (
        <QRModal
          assetId={a.id}
          assetName={a.name}
          onClose={() => setShowQR(false)}
        />
      )}

      {/* State Transition Modal */}
      {showTransitionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Change Asset State</h2>
              <button
                onClick={() => setShowTransitionModal(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm mb-1">New Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              >
                <option value="" disabled>Select status</option>
                {allowedTransitions.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <label className="block text-sm mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                rows={3}
                placeholder="Explain why the state is changing"
              />
              <button
                onClick={handleTransition}
                disabled={isTransitioning || !selectedStatus || !reason.trim()}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded disabled:opacity-50"
              >
                {isTransitioning ? 'Updating...' : 'Update State'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifecycle Modal */}
      {showLifecycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Asset Lifecycle</h2>
              <button
                onClick={() => setShowLifecycle(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <LifecycleTab asset={a} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
