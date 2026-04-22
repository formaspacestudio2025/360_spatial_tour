import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface AIProcessingStatusProps {
  isProcessing: boolean;
  progress?: number;
  sceneCount?: number;
  processedCount?: number;
  error?: string | null;
}

function AIProcessingStatus({
  isProcessing,
  progress = 0,
  sceneCount = 0,
  processedCount = 0,
  error,
}: AIProcessingStatusProps) {
  if (!isProcessing && !error) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-black/90 backdrop-blur-sm border border-gray-700 rounded-xl px-6 py-4 min-w-[300px]">
        {error ? (
          <div className="flex items-center gap-3 text-red-400">
            <XCircle size={20} />
            <div>
              <div className="font-semibold">Processing Failed</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 text-white mb-3">
              <Loader2 size={20} className="animate-spin" />
              <div className="font-semibold">AI Processing...</div>
            </div>
            
            {sceneCount > 0 && (
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Progress</span>
                  <span>{processedCount}/{sceneCount} scenes</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-400">
              Analyzing objects, detecting issues, generating tags...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIProcessingStatus;
