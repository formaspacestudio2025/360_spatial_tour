import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../../api/ai';
import { ProcessingProgress } from './ProcessingProgress';
import { Settings, TestTube, Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SceneStatus {
  sceneId: string;
  sceneName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

interface AIProcessingPanelProps {
  walkthroughId: string;
  sceneId?: string;
  totalScenes: number;
}

export function AIProcessingPanel({ walkthroughId, sceneId, totalScenes }: AIProcessingPanelProps) {
  const [config, setConfig] = useState({
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [sceneStatuses, setSceneStatuses] = useState<SceneStatus[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');

  const configMutation = useMutation({
    mutationFn: aiApi.setConfig,
    onSuccess: () => {
      alert('Configuration saved!');
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: aiApi.testConnection,
    onSuccess: (data) => {
      setConnectionStatus(data.data.connected ? 'connected' : 'disconnected');
      if (data.data.connected) {
        alert(`Connected! Model: ${data.data.model || 'Unknown'}`);
      } else {
        alert(`Connection failed: ${data.data.error}`);
      }
    },
  });

  const processSceneMutation = useMutation({
    mutationFn: () => aiApi.processScene(walkthroughId, sceneId!),
    onSuccess: () => {
      setIsProcessing(false);
      alert('Scene processed successfully!');
    },
    onError: () => {
      setIsProcessing(false);
      alert('Processing failed');
    },
  });

  const processAllMutation = useMutation({
    mutationFn: () => aiApi.processAll(walkthroughId),
    onSuccess: () => {
      setIsProcessing(false);
      alert('All scenes processed!');
    },
    onError: () => {
      setIsProcessing(false);
      alert('Processing failed');
    },
  });

  const handleSaveConfig = () => {
    configMutation.mutate(config);
  };

  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };

  const handleProcessSingle = () => {
    if (!sceneId) return;
    setIsProcessing(true);
    processSceneMutation.mutate();
  };

  const handleProcessAll = () => {
    setIsProcessing(true);
    // Initialize scene statuses
    const statuses: SceneStatus[] = Array.from({ length: totalScenes }, (_, i) => ({
      sceneId: `scene-${i}`,
      sceneName: `Scene ${i + 1}`,
      status: 'pending',
    }));
    setSceneStatuses(statuses);
    processAllMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* LM Studio Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">LM Studio Configuration</h3>
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Base URL</label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="http://localhost:1234/v1"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Model Name</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="local-model"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveConfig}
              disabled={configMutation.isPending}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
            >
              {configMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : 'Save Config'}
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testConnectionMutation.isPending}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              {testConnectionMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <TestTube className="w-3.5 h-3.5" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        {connectionStatus !== 'unknown' && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
            connectionStatus === 'connected' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{connectionStatus === 'connected' ? 'Connected to LM Studio' : 'Connection failed'}</span>
          </div>
        )}
      </div>

      {/* Processing Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-200">AI Processing</h3>
        </div>

        <div className="space-y-2">
          {sceneId && (
            <button
              onClick={handleProcessSingle}
              disabled={isProcessing || processSceneMutation.isPending}
              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {processSceneMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Process Current Scene'
              )}
            </button>
          )}
          <button
            onClick={handleProcessAll}
            disabled={isProcessing || processAllMutation.isPending}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
          >
            {processAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              `Process All Scenes (${totalScenes})`
            )}
          </button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <ProcessingProgress
          isProcessing={isProcessing}
          totalScenes={totalScenes}
          processedScenes={processAllMutation.isSuccess ? totalScenes : 0}
          sceneStatuses={sceneStatuses}
          onCancel={() => setIsProcessing(false)}
          onRetry={handleProcessAll}
        />
      )}
    </div>
  );
}
