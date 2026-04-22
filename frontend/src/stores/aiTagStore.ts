import { create } from 'zustand';
import { AITag } from '../api/ai';

export type TagCategory = 'all' | 'structural' | 'furniture' | 'safety' | 'hvac' | 'damage' | 'other';

const CATEGORY_MAP: Record<string, TagCategory> = {
  door: 'structural',
  window: 'structural',
  wall: 'structural',
  floor: 'structural',
  ceiling: 'structural',
  table: 'furniture',
  chair: 'furniture',
  desk: 'furniture',
  cabinet: 'furniture',
  sofa: 'furniture',
  extinguisher: 'safety',
  exit: 'safety',
  hazard: 'safety',
  smoke_detector: 'safety',
  hvac: 'hvac',
  vent: 'hvac',
  radiator: 'hvac',
  crack: 'damage',
  leak: 'damage',
  water_damage: 'damage',
  broken: 'damage',
};

function getCategory(objectType: string): TagCategory {
  const lower = objectType.toLowerCase();
  for (const [key, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return category;
  }
  return 'other';
}

interface AITagState {
  tags: AITag[];
  selectedTag: AITag | null;
  filterCategory: TagCategory;
  showTags: boolean;
  confidenceThreshold: number;
  
  setTags: (tags: AITag[]) => void;
  selectTag: (tag: AITag | null) => void;
  setFilter: (category: TagCategory) => void;
  toggleVisibility: () => void;
  setConfidenceThreshold: (threshold: number) => void;
  getFilteredTags: () => AITag[];
  getTagCategory: (tag: AITag) => TagCategory;
  getTagCountsByCategory: () => Record<TagCategory, number>;
}

export const useAITagStore = create<AITagState>((set, get) => ({
  tags: [],
  selectedTag: null,
  filterCategory: 'all',
  showTags: true,
  confidenceThreshold: 0,
  
  setTags: (tags) => set({ tags }),
  selectTag: (tag) => set({ selectedTag: tag }),
  setFilter: (category) => set({ filterCategory: category }),
  toggleVisibility: () => set((state) => ({ showTags: !state.showTags })),
  setConfidenceThreshold: (threshold) => set({ confidenceThreshold: threshold }),
  
  getFilteredTags: () => {
    const { tags, filterCategory, confidenceThreshold } = get();
    return tags.filter((tag) => {
      const categoryMatch = filterCategory === 'all' || getCategory(tag.object_type) === filterCategory;
      const confidenceMatch = tag.confidence >= confidenceThreshold;
      return categoryMatch && confidenceMatch;
    });
  },
  
  getTagCategory: (tag) => getCategory(tag.object_type),
  
  getTagCountsByCategory: () => {
    const { tags } = get();
    const counts: Record<TagCategory, number> = {
      all: tags.length,
      structural: 0,
      furniture: 0,
      safety: 0,
      hvac: 0,
      damage: 0,
      other: 0,
    };
    
    tags.forEach((tag) => {
      const category = getCategory(tag.object_type);
      counts[category]++;
    });
    
    return counts;
  },
}));
