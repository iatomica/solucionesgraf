import { create } from 'zustand';
import type { QuoteBreakdown } from '../types';
import { calculateQuote } from '../pricing/pricingEngine';
import { useProductStore } from './useProductStore';
import { useCanvasStore } from './useCanvasStore';
import { getProductById } from '../products/productDefinitions';

interface QuoteState {
  quote: QuoteBreakdown;
  recalculate: () => void;
}

const initialConfig = useProductStore.getState().configuration;
const initialProductDef = getProductById(initialConfig.productId);
const initialQuote = calculateQuote(initialConfig, initialProductDef, []);

export const useQuoteStore = create<QuoteState>((set) => ({
  quote: initialQuote,
  recalculate: () => {
    const config = useProductStore.getState().configuration;
    const elements = useCanvasStore.getState().elements;
    const productDef = getProductById(config.productId);
    const newQuote = calculateQuote(config, productDef, elements);
    set({ quote: newQuote });
  },
}));

// Subscribe to product and canvas store changes automatically to ensure real-time recalculation
useProductStore.subscribe(() => {
  useQuoteStore.getState().recalculate();
});

useCanvasStore.subscribe(() => {
  useQuoteStore.getState().recalculate();
});
