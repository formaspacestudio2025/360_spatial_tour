import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Square, Volume2, VolumeX, Settings } from 'lucide-react';
import { Scene } from '@/types';

interface TourStep {
  sceneId: string;
  scene: Scene;
  narration?: string;
  duration?: number; // Auto-advance after this many seconds
  orientation?: {
    yaw: number;
    pitch: number;
  };
}

interface TourControlsProps {
  scenes: Scene[];
  currentScene: Scene;
  onSceneSelect: (scene: Scene, orientation?: { yaw: number; pitch: number }) => void;
  tourSteps?: TourStep[];
  autoAdvance?: boolean;
  showNarration?: boolean;
  className?: string;
}

function TourControls({
  scenes,
  currentScene,
  onSceneSelect,
  tourSteps,
  autoAdvance = false,
  showNarration = true,
  className = '',
}: TourControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [speed, setSpeed] = useState(1); // Playback speed multiplier

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Use provided tour steps or create default tour from all scenes
  const steps = tourSteps || scenes.map(scene => ({
    sceneId: scene.id,
    scene,
    narration: scene.room_name || `Scene ${scene.id.slice(0, 8)}`,
    duration: 5, // Default 5 seconds per scene
  }));

  // Find current step index
  const currentStep = steps[currentStepIndex];
  const isCurrentSceneInTour = currentStep?.sceneId === currentScene.id;

  // Update current step index when scene changes
  useEffect(() => {
    const newIndex = steps.findIndex(step => step.sceneId === currentScene.id);
    if (newIndex !== -1 && newIndex !== currentStepIndex) {
      setCurrentStepIndex(newIndex);
      setTimeRemaining(steps[newIndex].duration || 5);
    }
  }, [currentScene.id, steps, currentStepIndex]);

  // Auto-advance timer
  useEffect(() => {
    if (isPlaying && isCurrentSceneInTour && autoAdvance && timeRemaining > 0) {
      // Clear existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);

      // Progress timer (updates every 100ms)
      progressRef.current = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 0.1 / speed));
      }, 100);

      // Auto-advance timer
      timerRef.current = setTimeout(() => {
        handleNext();
      }, (timeRemaining * 1000) / speed);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
      };
    }
  }, [isPlaying, isCurrentSceneInTour, autoAdvance, timeRemaining, speed]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    // If we're at the end, restart from beginning
    if (currentStepIndex === steps.length - 1) {
      setCurrentStepIndex(0);
      const firstStep = steps[0];
      onSceneSelect(firstStep.scene, firstStep.orientation);
    }
  }, [currentStepIndex, steps, onSceneSelect]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    const firstStep = steps[0];
    onSceneSelect(firstStep.scene, firstStep.orientation);
  }, [steps, onSceneSelect]);

  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      const step = steps[newIndex];
      setTimeRemaining(step.duration || 5);
      onSceneSelect(step.scene, step.orientation);
    }
  }, [currentStepIndex, steps, onSceneSelect]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      const step = steps[newIndex];
      setTimeRemaining(step.duration || 5);
      onSceneSelect(step.scene, step.orientation);
    } else {
      // Tour completed
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps, onSceneSelect]);

  const handleStepClick = useCallback((index: number) => {
    setCurrentStepIndex(index);
    const step = steps[index];
    setTimeRemaining(step.duration || 5);
    onSceneSelect(step.scene, step.orientation);
  }, [steps, onSceneSelect]);

  const progress = currentStep?.duration
    ? ((currentStep.duration - timeRemaining) / currentStep.duration) * 100
    : 0;

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play size={16} className="text-primary-500" />
          <span className="text-white text-sm font-medium">Guided Tour</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Tour Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Tour Info */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-gray-400">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {autoAdvance && (
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
            <div
              className="bg-primary-500 h-1.5 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Narration */}
        {showNarration && currentStep?.narration && (
          <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
            {currentStep.narration}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center justify-center gap-2">
        <button
          onClick={handleStop}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          title="Stop Tour"
        >
          <Square size={16} />
        </button>
        <button
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous Step"
        >
          <SkipBack size={16} />
        </button>
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          className="p-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={handleNext}
          disabled={currentStepIndex === steps.length - 1}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next Step"
        >
          <SkipForward size={16} />
        </button>
      </div>

      {/* Step List */}
      <div className="px-4 py-3 border-t border-gray-800 max-h-48 overflow-y-auto">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <button
                key={step.sceneId}
                onClick={() => handleStepClick(index)}
                disabled={isPlaying}
                className={`w-full px-3 py-2 rounded-lg text-left text-xs transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'bg-primary-600/20 border border-primary-500/30 text-primary-400'
                    : isCompleted
                    ? 'bg-gray-800/30 text-gray-500'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : isCompleted
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-gray-700 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className="truncate flex-1">
                  {step.scene.room_name || `Scene ${step.scene.id.slice(0, 8)}`}
                </span>
                {step.duration && (
                  <span className="text-[10px] text-gray-500">
                    {step.duration}s
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/50">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Auto-Advance</label>
              <button
                onClick={() => setSpeed(speed === 1 ? 0.5 : speed === 0.5 ? 2 : 1)}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
              >
                Speed: {speed}x
              </button>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Default Duration</label>
              <input
                type="number"
                min="1"
                max="30"
                defaultValue={5}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white"
                placeholder="Seconds per scene"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TourControls;