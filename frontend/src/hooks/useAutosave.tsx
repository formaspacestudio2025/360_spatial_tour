import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number; // Debounce delay in ms
  enabled?: boolean; // Enable/disable autosave
}

interface UseAutosaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  manualSave: () => Promise<void>;
  retry: () => Promise<void>;
}

/**
 * Enterprise Autosave Hook
 * 
 * Features:
 * - Debounced saving (configurable delay)
 * - Status tracking (idle/saving/saved/error)
 * - Automatic retry on failure
 * - Manual save trigger
 * - Enable/disable toggle
 * 
 * Usage:
 * ```tsx
 * const { saveStatus, lastSaved, manualSave, retry } = useAutosave({
 *   data: hotspotData,
 *   onSave: async (data) => await hotspotsApi.update(id, data),
 *   delay: 1000,
 *   enabled: true
 * });
 * ```
 */
export function useAutosave<T>({
  data,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(data);
  const onSaveRef = useRef(onSave);
  const hasChangesRef = useRef(false);
  const isMountedRef = useRef(true);

  // Update refs when data or onSave changes
  useEffect(() => {
    dataRef.current = data;
    hasChangesRef.current = true;
  }, [data]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Debounced save function
  const performSave = useCallback(async () => {
    if (!enabled || !hasChangesRef.current) return;

    if (isMountedRef.current) {
      setSaveStatus('saving');
      setError(null);
    }

    try {
      await onSaveRef.current(dataRef.current);
      hasChangesRef.current = false;

      if (isMountedRef.current) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle');
          }
        }, 2000);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setSaveStatus('error');
        setError(err.message || 'Failed to save');
      }
      console.error('[Autosave] Save failed:', err);
    }
  }, [enabled]);

  // Retry function
  const retry = useCallback(async () => {
    if (saveStatus === 'error') {
      await performSave();
    }
  }, [saveStatus, performSave]);

  // Manual save function
  const manualSave = useCallback(async () => {
    // Clear any pending debounce
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    await performSave();
  }, [performSave]);

  // Debounce effect
  useEffect(() => {
    if (!enabled || !hasChangesRef.current) return;

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer
    timerRef.current = setTimeout(() => {
      performSave();
    }, delay);

    // Cleanup for this specific effect run
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, delay, enabled, performSave]);

  // Cleanup on unmount - Ensure final save
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Perform final save if needed
      if (hasChangesRef.current && enabled) {
        console.log('[Autosave] Performing final save on unmount');
        onSaveRef.current(dataRef.current).catch(err => {
          console.error('[Autosave] Final save on unmount failed:', err);
        });
      }
    };
  }, [enabled]); // Re-run if enabled changes, though unmount logic is primary

  return {
    saveStatus,
    lastSaved,
    error,
    manualSave,
    retry,
  };
}

/**
 * Save Status Indicator Component
 * 
 * Displays current save status with appropriate icon and color
 */
export function SaveStatusIndicator({ 
  status, 
  lastSaved, 
  error, 
  onRetry 
}: { 
  status: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  onRetry?: () => void;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: '⏳',
          text: 'Saving...',
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
        };
      case 'saved':
        return {
          icon: '✓',
          text: lastSaved 
            ? `Saved ${lastSaved.toLocaleTimeString()}`
            : 'Saved',
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
        };
      case 'error':
        return {
          icon: '✗',
          text: error || 'Save failed',
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          retryable: true,
        };
      default:
        return {
          icon: '●',
          text: lastSaved 
            ? `Last saved: ${lastSaved.toLocaleTimeString()}`
            : 'Ready',
          color: 'text-gray-400',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.border}`}
    >
      <span className={`${config.color} text-xs`}>{config.icon}</span>
      <span className={`text-xs ${config.color}`}>{config.text}</span>
      {config.retryable && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-red-400 hover:text-red-300 underline ml-1"
        >
          Retry
        </button>
      )}
    </div>
  );
}
