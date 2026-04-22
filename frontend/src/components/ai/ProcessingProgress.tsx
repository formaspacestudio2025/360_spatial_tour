import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react';

interface SceneStatus {
  sceneId: string;
  sceneName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface ProcessingProgressProps {
  isProcessing: boolean;
  totalScenes: number;
  processedScenes: number;
  sceneStatuses: SceneStatus[];
  onCancel?: () => void;
  onRetry?: () => void;
}

export function ProcessingProgress({
  isProcessing,
  totalScenes,
  processedScenes,
  sceneStatuses,
  onCancel,
  onRetry,
}: ProcessingProgressProps) {
  const progressPercent = totalScenes > 0 ? (processedScenes / totalScenes) * 100 : 0;
  const completedCount = sceneStatuses.filter((s) => s.status === 'completed').length;
  const failedCount = sceneStatuses.filter((s) => s.status === 'failed').length;
  const processingCount = sceneStatuses.filter((s) => s.status === 'processing').length;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-200">Processing Progress</span>
          <span className="text-sm font-semibold text-blue-400">
            {processedScenes}/{totalScenes}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">{Math.round(progressPercent)}% complete</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-400">{completedCount}</div>
          <div className="text-[10px] text-gray-400">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <Loader2 className="w-5 h-5 text-blue-400 mx-auto mb-1 animate-spin" />
          <div className="text-lg font-bold text-blue-400">{processingCount}</div>
          <div className="text-[10px] text-gray-400">Processing</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-red-400">{failedCount}</div>
          <div className="text-[10px] text-gray-400">Failed</div>
        </div>
      </div>

      {/* Scene Status List */}
      <div className="max-h-48 overflow-y-auto space-y-1">
        {sceneStatuses.map((status) => (
          <div key={status.sceneId} className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded text-xs">
            {status.status === 'pending' && <Clock className="w-3.5 h-3.5 text-gray-500" />}
            {status.status === 'processing' && <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
            {status.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
            {status.status === 'failed' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
            <span className="flex-1 text-gray-300 truncate">{status.sceneName}</span>
            <span className={`text-[10px] capitalize ${
              status.status === 'completed' ? 'text-green-400' :
              status.status === 'processing' ? 'text-blue-400' :
              status.status === 'failed' ? 'text-red-400' :
              'text-gray-500'
            }`}>
              {status.status}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isProcessing && onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancel Processing
          </button>
        )}
        {failedCount > 0 && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Failed ({failedCount})
          </button>
        )}
      </div>
    </div>
  );
}
