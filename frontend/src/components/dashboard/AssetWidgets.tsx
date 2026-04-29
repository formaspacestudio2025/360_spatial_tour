import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

interface AssetStats {
  total: number;
  byHealth: { excellent: number; good: number; fair: number; poor: number };
  warrantyExpiringSoon: number;
  overdueInspections: number;
}

export const AssetWidgets = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'asset-stats'],
    queryFn: () => api.get<{ success: boolean; data: AssetStats }>('/api/dashboard/asset-stats')
      .then(r => r.data.data),
  });

  if (isLoading) return <div className="text-white">Loading asset stats...</div>;
  if (!stats) return null;

  const health = stats.byHealth;
  const totalHealth = health.excellent + health.good + health.fair + health.poor;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Assets */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase">Total Assets</p>
        <p className="text-3xl font-bold text-white">{stats.total}</p>
      </div>

      {/* Health Score Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase mb-2">Health Breakdown</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-green-400">Excellent</span>
            <span className="text-white">{health.excellent} ({totalHealth ? Math.round(health.excellent/totalHealth*100) : 0}%)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-yellow-400">Good</span>
            <span className="text-white">{health.good} ({totalHealth ? Math.round(health.good/totalHealth*100) : 0}%)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-orange-400">Fair</span>
            <span className="text-white">{health.fair} ({totalHealth ? Math.round(health.fair/totalHealth*100) : 0}%)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-red-400">Poor</span>
            <span className="text-white">{health.poor} ({totalHealth ? Math.round(health.poor/totalHealth*100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Warranty Expiries */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase">Warranty Expiring Soon</p>
        <p className="text-3xl font-bold text-yellow-400">{stats.warrantyExpiringSoon}</p>
        <p className="text-xs text-gray-400">within 30 days</p>
      </div>

      {/* Overdue Inspections */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase">Overdue Inspections</p>
        <p className="text-3xl font-bold text-red-400">{stats.overdueInspections}</p>
        <p className="text-xs text-gray-400">past due date</p>
      </div>
    </div>
  );
};

export default AssetWidgets;
