import type {
  DesignDocument,
  ProductConfiguration,
  ProductDefinition,
  QuoteBreakdown,
  QuoteRequest,
  QuoteRequestCustomerData,
} from '../types';
import { MOCK_PRODUCTS, getProductById } from '../products/productDefinitions';
import { calculateQuote } from '../pricing/pricingEngine';

export async function fetchProducts(): Promise<ProductDefinition[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return MOCK_PRODUCTS;
}

export async function fetchProductById(
  id: string
): Promise<ProductDefinition> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return getProductById(id);
}

/**
 * Backend authority price recalculation endpoint
 */
export async function calculateQuoteServer(
  config: ProductConfiguration
): Promise<QuoteBreakdown> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const productDef = getProductById(config.productId);
  return calculateQuote(config, productDef);
}

/**
 * Endpoint to submit a formal quote request
 */
export async function submitQuoteRequest(
  customer: QuoteRequestCustomerData,
  design: DesignDocument,
  config: ProductConfiguration
): Promise<{ success: boolean; request: QuoteRequest }> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Server re-calculates exact pricing to enforce authority
  const productDef = getProductById(config.productId);
  const serverQuote = calculateQuote(config, productDef);

  const request: QuoteRequest = {
    id: `req-${Date.now()}`,
    customer,
    design,
    quote: serverQuote,
    createdAt: new Date().toISOString(),
  };

  // Log in console for demo debugging
  console.log('✅ [Server REST API] Presupuesto recibido y recalculado:', request);

  return { success: true, request };
}
