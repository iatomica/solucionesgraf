import { create } from 'zustand';
import type { CanvasElement } from '../types';
import { useSelectionStore } from './useSelectionStore';

interface CanvasState {
  elements: CanvasElement[];
  showBleed: boolean;
  showSafeArea: boolean;
  previewMode: boolean;
  copiedElement: CanvasElement | null;

  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, partial: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  reorderZIndex: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  setElements: (elements: CanvasElement[]) => void;

  copySelected: () => void;
  pasteCopied: () => void;

  toggleBleed: () => void;
  toggleSafeArea: () => void;
  setPreviewMode: (enabled: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  showBleed: true,
  showSafeArea: true,
  previewMode: false,
  copiedElement: null,

  addElement: (element: CanvasElement) => {
    set((state) => {
      const maxZ = state.elements.reduce(
        (max, el) => Math.max(max, el.zIndex || 0),
        0
      );
      const newEl = { ...element, zIndex: maxZ + 1 };
      return { elements: [...state.elements, newEl] };
    });
    useSelectionStore.getState().selectElement(element.id);
  },

  updateElement: (id: string, partial: Partial<CanvasElement>) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? ({ ...el, ...partial } as CanvasElement) : el
      ),
    }));
  },

  deleteElement: (id: string) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
    }));
    if (useSelectionStore.getState().selectedId === id) {
      useSelectionStore.getState().clearSelection();
    }
  },

  duplicateElement: (id: string) => {
    const state = get();
    const target = state.elements.find((el) => el.id === id);
    if (!target) return;

    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const duplicate: CanvasElement = {
      ...target,
      id: newId,
      x: target.x + 5, // offset slightly
      y: target.y + 5,
      zIndex: Math.max(...state.elements.map((e) => e.zIndex), 0) + 1,
    };

    set((s) => ({ elements: [...s.elements, duplicate] }));
    useSelectionStore.getState().selectElement(newId);
  },

  reorderZIndex: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    set((state) => {
      const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex((el) => el.id === id);
      if (index === -1) return state;

      if (direction === 'up' && index < sorted.length - 1) {
        const temp = sorted[index].zIndex;
        sorted[index].zIndex = sorted[index + 1].zIndex;
        sorted[index + 1].zIndex = temp;
      } else if (direction === 'down' && index > 0) {
        const temp = sorted[index].zIndex;
        sorted[index].zIndex = sorted[index - 1].zIndex;
        sorted[index - 1].zIndex = temp;
      } else if (direction === 'top') {
        const maxZ = Math.max(...sorted.map((e) => e.zIndex), 0);
        sorted[index].zIndex = maxZ + 1;
      } else if (direction === 'bottom') {
        const minZ = Math.min(...sorted.map((e) => e.zIndex), 1);
        sorted[index].zIndex = Math.max(0, minZ - 1);
      }

      return { elements: sorted };
    });
  },

  setElements: (elements: CanvasElement[]) => set({ elements }),

  copySelected: () => {
    const selectedId = useSelectionStore.getState().selectedId;
    if (!selectedId) return;
    const target = get().elements.find((e) => e.id === selectedId);
    if (target) {
      set({ copiedElement: { ...target } });
    }
  },

  pasteCopied: () => {
    const copied = get().copiedElement;
    if (!copied) return;
    const newId = `el-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const pasted: CanvasElement = {
      ...copied,
      id: newId,
      x: copied.x + 5,
      y: copied.y + 5,
      zIndex: Math.max(...get().elements.map((e) => e.zIndex), 0) + 1,
    };
    set((s) => ({ elements: [...s.elements, pasted] }));
    useSelectionStore.getState().selectElement(newId);
  },

  toggleBleed: () => set((s) => ({ showBleed: !s.showBleed })),
  toggleSafeArea: () => set((s) => ({ showSafeArea: !s.showSafeArea })),
  setPreviewMode: (enabled: boolean) => set({ previewMode: enabled }),
}));
