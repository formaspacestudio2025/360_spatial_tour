import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { Activity, ShieldAlert, AlertCircle, Box, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-gray-900 border border-gray-800 rounded-xl" />
      ))}
    </div>
  );

  if (!stats && !isLoading) return (
    <div className="bg-gray-900 border border-dashed border-gray-800 rounded-xl p-8 text-center">
      <AlertTriangle className="mx-auto text-gray-600 mb-2" size={24} />
      <p className="text-gray-500 text-sm">No asset intelligence data available yet.</p>
      <Link to="/assets" className="text-xs text-primary-400 mt-2 hover:underline inline-block">
        Manage Assets →
      </Link>
    </div>
  );

  const health = stats?.byHealth || { excellent: 0, good: 0, fair: 0, poor: 0 };
  const totalHealth = health.excellent + health.good + health.fair + health.poor;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Assets */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/5 group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Assets</p>
          <Box className="text-primary-500 opacity-50 group-hover:opacity-100 transition-opacity" size={14} />
        </div>
        <p className="text-3xl font-bold text-white leading-none">{stats?.total || 0}</p>
        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500" style={{ width: '100%' }} />
        </div>
      </div>

      {/* Health Score Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Health Distribution</p>
          <Activity className="text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" size={14} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400">Excellent</span>
            <span className="text-[10px] font-medium">{health.excellent}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-yellow-400">Good</span>
            <span className="text-[10px] font-medium">{health.good}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-orange-400">Fair</span>
            <span className="text-[10px] font-medium">{health.fair}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-red-400">Poor</span>
            <span className="text-[10px] font-medium">{health.poor}</span>
          </div>
        </div>
        <div className="mt-3 flex h-1.5 rounded-full overflow-hidden bg-gray-800">
          <div className="bg-emerald-500" style={{ width: `${totalHealth ? (health.excellent / totalHealth) * 100 : 0}%` }} />
          <div className="bg-yellow-500" style={{ width: `${totalHealth ? (health.good / totalHealth) * 100 : 0}%` }} />
          <div className="bg-orange-500" style={{ width: `${totalHealth ? (health.fair / totalHealth) * 100 : 0}%` }} />
          <div className="bg-red-500" style={{ width: `${totalHealth ? (health.poor / totalHealth) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Warranty Expiries */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/5 group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Warranty Risks</p>
          <ShieldAlert className="text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity" size={14} />
        </div>
        <p className="text-3xl font-bold text-amber-500 leading-none">{stats?.warrantyExpiringSoon || 0}</p>
        <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Expiring within 30 days
        </p>
      </div>

      {/* Overdue Inspections */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/5 group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Critical Failures</p>
          <AlertCircle className="text-red-500 opacity-50 group-hover:opacity-100 transition-opacity" size={14} />
        </div>
        <p className="text-3xl font-bold text-red-500 leading-none">{stats?.overdueInspections || 0}</p>
        <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Overdue inspections
        </p>
      </div>
    </div>
  );
};

export default AssetWidgets;
