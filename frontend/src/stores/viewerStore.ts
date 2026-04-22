import { create } from 'zustand';
import { Scene } from '@/types';

interface ViewerState {
  currentScene: Scene | null;
  scenes: Scene[];
  isTransitioning: boolean;
  showHotspots: boolean;
  showGrid: boolean;
  
  // Actions
  setCurrentScene: (scene: Scene | null) => void;
  setScenes: (scenes: Scene[]) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  toggleHotspots: () => void;
  toggleGrid: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  currentScene: null,
  scenes: [],
  isTransitioning: false,
  showHotspots: true,
  showGrid: false,

  setCurrentScene: (currentScene) => set({ currentScene }),
  setScenes: (scenes) => set({ scenes }),
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  toggleHotspots: () => set((state) => ({ showHotspots: !state.showHotspots })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
}));
