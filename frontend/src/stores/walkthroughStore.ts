import { create } from 'zustand';
import { Walkthrough } from '@/types';

interface WalkthroughState {
  walkthroughs: Walkthrough[];
  currentWalkthrough: Walkthrough | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setWalkthroughs: (walkthroughs: Walkthrough[]) => void;
  setCurrentWalkthrough: (walkthrough: Walkthrough | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWalkthroughStore = create<WalkthroughState>((set) => ({
  walkthroughs: [],
  currentWalkthrough: null,
  loading: false,
  error: null,

  setWalkthroughs: (walkthroughs) => set({ walkthroughs }),
  setCurrentWalkthrough: (currentWalkthrough) => set({ currentWalkthrough }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
