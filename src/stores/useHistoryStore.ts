import { create } from 'zustand';
import type { CanvasElement } from '../types';
import { useCanvasStore } from './useCanvasStore';

interface HistoryState {
  past: CanvasElement[][];
  future: CanvasElement[][];

  pushState: (elements: CanvasElement[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushState: (elements: CanvasElement[]) => {
    const current = useCanvasStore.getState().elements;
    // Avoid duplicate pushes of identical states
    if (JSON.stringify(current) === JSON.stringify(elements)) return;

    set((state) => {
      const newPast = [...state.past, current].slice(-30); // keep up to 30 history states
      return {
        past: newPast,
        future: [],
        canUndo: newPast.length > 0,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { past, future } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    const current = useCanvasStore.getState().elements;

    useCanvasStore.getState().setElements(previous);

    set({
      past: newPast,
      future: [current, ...future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { past, future } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const current = useCanvasStore.getState().elements;

    useCanvasStore.getState().setElements(next);

    set({
      past: [...past, current],
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
  },

  clearHistory: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}));
