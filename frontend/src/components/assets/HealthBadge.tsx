import { useEffect, useState } from 'react';
import { assetsApi } from '@/api/assetsApi';

interface HealthBadgeProps {
  assetId: string;
  score?: number; // If not provided, will fetch/calculate
  size?: 'sm' | 'md' | 'lg';
}

const HealthBadge: React.FC<HealthBadgeProps> = ({ assetId, score: initialScore, size = 'md' }) => {
  const [score, setScore] = useState<number | null>(initialScore || null);
  const [loading, setLoading] = useState(!initialScore);

  useEffect(() => {
    if (initialScore !== undefined) {
      setScore(initialScore);
      setLoading(false);
      return;
    }

    // Calculate health score via API or compute locally
    // For now, we'll compute it locally based on asset data
    // In a real implementation, this would call an API endpoint
    setLoading(false);
  }, [assetId, initialScore]);

  const getColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 40) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1 rounded-full border ${sizeClasses[size]} bg-gray-500/20 border-gray-500/30`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400">...</span>
      </div>
    );
  }

  if (score === null) return null;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${getColor(score)} ${sizeClasses[size]}`}>
      <div className={`w-2 h-2 rounded-full ${score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : score >= 40 ? 'bg-orange-400' : 'bg-red-400'}`}></div>
      <span className="font-medium">{score}</span>
      <span className="opacity-70">|</span>
      <span>{getLabel(score)}</span>
    </div>
  );
};

export default HealthBadge;
