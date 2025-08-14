import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types/product';

interface ComparisonState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearAll: () => void;
  isInComparison: (productId: string) => boolean;
  getTotalItems: () => number;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);
        
        if (!existingItem && currentItems.length < 3) {
          set({ items: [...currentItems, product] });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },
      
      clearAll: () => {
        set({ items: [] });
      },
      
      isInComparison: (productId) => {
        return get().items.some(item => item.id === productId);
      },
      
      getTotalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
);