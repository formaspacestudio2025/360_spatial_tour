import { create } from 'zustand';
import { Scene } from '@/types';

interface ViewerState {
  currentScene: Scene | null;
  scenes: Scene[];
  isTransitioning: boolean;
  showHotspots: boolean;
  showGrid: boolean;
  cameraRotation: { yaw: number; pitch: number };
  
  // Actions
  setCurrentScene: (scene: Scene | null) => void;
  setScenes: (scenes: Scene[]) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  toggleHotspots: () => void;
  toggleGrid: () => void;
  setCameraRotation: (rotation: { yaw: number; pitch: number }) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  currentScene: null,
  scenes: [],
  isTransitioning: false,
  showHotspots: true,
  showGrid: false,
  cameraRotation: { yaw: 0, pitch: 0 },

  setCurrentScene: (currentScene) => set({ currentScene }),
  setScenes: (scenes) => set({ scenes }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  toggleHotspots: () => set((state) => ({ showHotspots: !state.showHotspots })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setCameraRotation: (newRotation) => set((state) => {
    // Only update if there is a meaningful change to avoid excessive re-renders
    if (
      Math.abs(state.cameraRotation.yaw - newRotation.yaw) < 0.0001 &&
      Math.abs(state.cameraRotation.pitch - newRotation.pitch) < 0.0001
    ) {
      return state;
    }
    return { cameraRotation: newRotation };
  }),
}));
