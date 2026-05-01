import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { AssetEvent, AssetEventType } from '@/types';
import { History, AlertCircle, Wrench, FileText, Activity, MapPin, Shield, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AssetTimelineProps {
  assetId: string;
}

const eventTypeConfig: Record<AssetEventType, { icon: any; color: string; bg: string }> = {
  created: { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  inspected: { icon: Shield, color: 'text-green-400', bg: 'bg-green-500/20' },
  maintained: { icon: Wrench, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  issue_opened: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
  issue_resolved: { icon: AlertCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  state_changed: { icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  document_added: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  health_changed: { icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  location_changed: { icon: MapPin, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
  warranty_claimed: { icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/20' },
};

const eventTypeLabels: Record<AssetEventType, string> = {
  created: 'Created',
  inspected: 'Inspected',
  maintained: 'Maintained',
  issue_opened: 'Issue Opened',
  issue_resolved: 'Issue Resolved',
  state_changed: 'State Changed',
  document_added: 'Document Added',
  health_changed: 'Health Changed',
  location_changed: 'Location Changed',
  warranty_claimed: 'Warranty Claimed',
};

export default function AssetTimeline({ assetId }: AssetTimelineProps) {
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['asset-timeline', assetId, limit, offset],
    queryFn: () => assetsApi.getTimeline(assetId, { limit, offset }),
    enabled: !!assetId,
  });

  const events = data?.events || [];
  const total = data?.total || 0;

  if (isLoading) return <div className="text-gray-400 text-sm p-4">Loading timeline...</div>;
  if (error) return <div className="text-red-400 text-sm p-4">Failed to load timeline.</div>;

  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <History size={32} className="mx-auto mb-2 opacity-50" />
          <p>No events recorded yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

          {events.map((event: AssetEvent, idx: number) => {
            const config = eventTypeConfig[event.event_type] || eventTypeConfig.created;
            const Icon = config.icon;

            return (
              <div key={event.id || idx} className="relative pl-10 pb-6 last:pb-0">
                {/* Timeline dot */}
                <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full ${config.bg} border-2 border-gray-900 z-10`} />

                <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded ${config.bg}`}>
                      <Icon size={14} className={config.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                          {eventTypeLabels[event.event_type] || event.event_type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-white mt-1">{event.title}</p>
                      {event.description && (
                        <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                      )}
                      {event.user_name && (
                        <p className="text-xs text-gray-500 mt-1">by {event.user_name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          <span className="text-xs text-gray-500">
            Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset <= 0}
              className="px-3 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-3 py-1 bg-gray-800 text-white rounded text-xs disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
