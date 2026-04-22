import { create } from 'zustand';
import { AITag } from '@/types';

interface AIState {
  tags: AITag[];
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;
  
  // Actions
  setTags: (tags: AITag[]) => void;
  addTag: (tag: AITag) => void;
  updateTag: (tagId: string, updates: Partial<AITag>) => void;
  removeTag: (tagId: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  clearTags: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  tags: [],
  isProcessing: false,
  processingProgress: 0,
  error: null,

  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
  updateTag: (tagId, updates) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === tagId ? { ...t, ...updates } : t)),
    })),
  removeTag: (tagId) =>
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== tagId),
    })),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setProgress: (progress) => set({ processingProgress: progress }),
  setError: (error) => set({ error }),
  clearTags: () => set({ tags: [] }),
}));
