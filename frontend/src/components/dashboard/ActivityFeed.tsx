import { Box, Image, AlertCircle, CheckCircle2, UserPlus, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[] | undefined;
  isLoading: boolean;
}

const typeConfig: Record<string, { icon: typeof Box; color: string; bgColor: string }> = {
  walkthrough_created: { icon: Box, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  scene_uploaded: { icon: Image, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  issue_created: { icon: AlertCircle, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  issue_resolved: { icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  user_registered: { icon: UserPlus, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

      {(!activities || activities.length === 0) ? (
        <div className="text-center py-8 text-gray-500">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {activities.map((activity) => {
            const config = typeConfig[activity.type] || typeConfig.walkthrough_created;
            const Icon = config.icon;

            return (
              <div key={activity.id} className="flex gap-3 items-start">
                <div className={`p-2 ${config.bgColor} rounded-full flex-shrink-0 mt-0.5`}>
                  <Icon size={14} className={config.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
