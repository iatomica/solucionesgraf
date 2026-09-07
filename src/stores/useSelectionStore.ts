import { create } from 'zustand';

interface SelectionState {
  selectedId: string | null;
  selectElement: (id: string | null) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedId: null,
  selectElement: (id: string | null) => set({ selectedId: id }),
  clearSelection: () => set({ selectedId: null }),
}));
