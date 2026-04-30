import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/assetsApi';
import { ClipboardCheck, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentInspectionsProps {
  compact?: boolean;
}

const RecentInspections: React.FC<RecentInspectionsProps> = ({ compact }) => {
  const { data: inspections, isLoading, error } = useQuery({
    queryKey: ['recent-inspections'],
    queryFn: () => assetsApi.getRecentInspections(5),
  });

  if (isLoading) {
    return (
      <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center justify-center ${compact ? 'h-[200px]' : 'h-[300px]'}`}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center ${compact ? 'h-[200px]' : 'h-[300px]'} text-center`}>
        <ClipboardCheck className="w-12 h-12 text-gray-700 mb-4" />
        <h3 className="text-white font-medium mb-1">Failed to load inspections</h3>
        <p className="text-gray-500 text-sm">Please try again later</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col ${compact ? 'h-[235px]' : 'h-full'}`}>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-primary-500" size={18} />
          <h3 className="text-white font-semibold">Recent Inspections</h3>
        </div>
        <Link to="/assets" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {inspections && inspections.length > 0 ? (
          inspections.map((inspection: any) => (
            <div key={inspection.id} className="bg-gray-800/40 rounded-lg p-3 border border-gray-800/50 hover:border-gray-700 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white text-sm font-medium group-hover:text-primary-400 transition-colors">
                    {inspection.assetName}
                  </h4>
                  <p className="text-xs text-gray-500">{inspection.template_name || 'Regular Check'}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  inspection.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                  inspection.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {inspection.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={10} />
                    <span>{new Date(inspection.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
                    <span>Score: {inspection.score || 'N/A'}%</span>
                  </div>
                </div>
                <button className="text-[10px] text-primary-400 hover:underline">Details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <ClipboardCheck size={32} className="text-gray-700 mb-2 opacity-50" />
            <p className="text-gray-500 text-sm">No recent inspections</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentInspections;
