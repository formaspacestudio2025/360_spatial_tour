import { Box, AlertCircle, CheckCircle2, Brain } from 'lucide-react';

interface Stats {
  total_projects: number;
  total_scenes: number;
  open_issues: number;
  resolved_issues: number;
  total_ai_tags: number;
  total_users: number;
}

interface StatCardsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

const cards = [
  {
    key: 'total_projects' as const,
    label: 'Total Projects',
    icon: Box,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    key: 'open_issues' as const,
    label: 'Open Issues',
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    key: 'resolved_issues' as const,
    label: 'Resolved Issues',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'total_ai_tags' as const,
    label: 'AI Findings',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
];

function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = stats?.[card.key] ?? 0;

        return (
          <div
            key={card.key}
            className={`bg-gray-900 border ${card.borderColor} rounded-xl p-6 hover:border-opacity-40 transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 ${card.bgColor} rounded-lg`}>
                <Icon size={20} className={card.color} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-400 mt-1">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StatCards;
