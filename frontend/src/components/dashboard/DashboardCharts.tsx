import { useQuery } from '@tanstack/react-query';
import { dashboardApi, ChartDataPoint, TrendDataPoint, DashboardStats } from '@/api/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';

interface DashboardChartsProps {
  stats?: DashboardStats;
  startDate?: string;
  endDate?: string;
  propertyId?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
        {label && <p className="text-gray-400 mb-1">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color || entry.fill }}>
            {entry.name}: <span className="font-bold text-white">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
      <Zap size={24} className="opacity-40" />
      <p className="text-xs">{message}</p>
    </div>
  );
}

export default function DashboardCharts({ stats, startDate, endDate, propertyId }: DashboardChartsProps) {
  const { data: statusData } = useQuery({
    queryKey: ['dashboard-chart-status', startDate, endDate, propertyId],
    queryFn: () => dashboardApi.getIssuesByStatus(startDate, endDate, propertyId),
  });

  const { data: typeData } = useQuery({
    queryKey: ['dashboard-chart-type', startDate, endDate, propertyId],
    queryFn: () => dashboardApi.getIssuesByType(startDate, endDate, propertyId),
  });

  const { data: priorityData } = useQuery({
    queryKey: ['dashboard-chart-priority', startDate, endDate, propertyId],
    queryFn: () => dashboardApi.getIssuesByPriority(startDate, endDate, propertyId),
  });

  const { data: trendData } = useQuery({
    queryKey: ['dashboard-chart-trend', startDate, endDate, propertyId],
    queryFn: () => dashboardApi.getIssueTrend(startDate, endDate, propertyId),
  });

  const statusPoints: ChartDataPoint[] = statusData?.data || [];
  const typePoints: ChartDataPoint[] = typeData?.data || [];
  const priorityPoints: ChartDataPoint[] = priorityData?.data || [];
  const trendPoints: TrendDataPoint[] = trendData?.data || [];

  // KPI banner derived from stats
  const kpis = [
    {
      label: 'Critical Issues',
      value: stats?.critical_issues ?? 0,
      icon: AlertTriangle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      trend: 'high',
    },
    {
      label: 'In Progress',
      value: stats?.in_progress_issues ?? 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      trend: 'neutral',
    },
    {
      label: 'Resolved',
      value: stats?.resolved_issues ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      trend: 'low',
    },
    {
      label: 'Overdue',
      value: stats?.overdue_issues ?? 0,
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      trend: 'high',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Enterprise KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg} transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-2">
                <Icon size={16} className={kpi.color} />
                {kpi.trend === 'high' && <TrendingUp size={12} className="text-red-400" />}
                {kpi.trend === 'low' && <TrendingDown size={12} className="text-emerald-400" />}
              </div>
              <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 14-Day Issue Trend - Area Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-1">Issue Trend — Last 14 Days</h3>
          <p className="text-xs text-gray-500 mb-4">Created vs Resolved</p>
          <div className="h-48">
            {trendPoints.length === 0 || trendPoints.every(p => p.created === 0 && p.resolved === 0) ? (
              <EmptyChart message="No issue data yet. Create issues to see trends." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="created" name="Created" stroke="#ef4444" strokeWidth={2} fill="url(#colorCreated)" />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Issues by Type - Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Issues by Type</h3>
          <p className="text-xs text-gray-500 mb-4">Distribution across categories</p>
          <div className="h-44">
            {typePoints.length === 0 ? (
              <EmptyChart message="No issues yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typePoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Issues" radius={[4, 4, 0, 0]}>
                    {typePoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Issues by Priority - Bar Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Issues by Priority</h3>
          <p className="text-xs text-gray-500 mb-4">SLA urgency breakdown</p>
          <div className="h-44">
            {priorityPoints.every(p => p.value === 0) ? (
              <EmptyChart message="No issues yet" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityPoints} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Issues" radius={[4, 4, 0, 0]}>
                    {priorityPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Issues by Status - Donut Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-1">Issues by Status</h3>
          <p className="text-xs text-gray-500 mb-4">Workflow stage distribution</p>
          <div className="h-44">
            {statusPoints.length === 0 ? (
              <EmptyChart message="No issues yet. Start by creating issues in a walkthrough." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPoints}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
