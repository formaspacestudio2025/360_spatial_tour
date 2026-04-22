import { create } from 'zustand';
import { Hotspot } from '@/api/hotspots';

interface HotspotState {
  hotspots: Hotspot[];
  isPlacingHotspot: boolean;
  selectedHotspot: Hotspot | null;
  pendingHotspot: { yaw: number; pitch: number } | null;
  setHotspots: (hotspots: Hotspot[]) => void;
  addHotspot: (hotspot: Hotspot) => void;
  removeHotspot: (id: string) => void;
  updateHotspot: (hotspot: Hotspot) => void;
  setPlacingMode: (active: boolean) => void;
  setSelectedHotspot: (hotspot: Hotspot | null) => void;
  setPendingHotspot: (pos: { yaw: number; pitch: number } | null) => void;
}

export const useHotspotStore = create<HotspotState>((set) => ({
  hotspots: [],
  isPlacingHotspot: false,
  selectedHotspot: null,
  pendingHotspot: null,

  setHotspots: (hotspots) => set({ hotspots }),

  addHotspot: (hotspot) =>
    set((state) => ({
      hotspots: [...state.hotspots, hotspot],
      isPlacingHotspot: false,
      pendingHotspot: null,
    })),

  removeHotspot: (id) =>
    set((state) => ({
      hotspots: state.hotspots.filter((h) => h.id !== id),
      selectedHotspot: state.selectedHotspot?.id === id ? null : state.selectedHotspot,
    })),

  updateHotspot: (hotspot) =>
    set((state) => ({
      hotspots: state.hotspots.map((h) => (h.id === hotspot.id ? hotspot : h)),
      selectedHotspot: state.selectedHotspot?.id === hotspot.id ? hotspot : state.selectedHotspot,
    })),

  setPlacingMode: (active) =>
    set({
      isPlacingHotspot: active,
      pendingHotspot: active ? null : undefined as any,
      selectedHotspot: null,
    }),

  setSelectedHotspot: (hotspot) => set({ selectedHotspot: hotspot }),

  setPendingHotspot: (pos) => set({ pendingHotspot: pos }),
}));
