import { describe, expect, it } from 'vitest';
import { calculateQuote } from '../pricingEngine';
import { MOCK_PRODUCTS } from '../../products/productDefinitions';
import type { ProductConfiguration } from '../../types';

describe('PricingEngine Unit Tests', () => {
  const pvcProduct = MOCK_PRODUCTS.find((p) => p.id === 'cartel-pvc')!;

  it('calculates area and prices correctly for Cartel PVC 200x100cm (2m2)', () => {
    const config: ProductConfiguration = {
      productId: 'cartel-pvc',
      widthCm: 200,
      heightCm: 100,
      materialId: 'pvc-5mm', // $18,500 / m2
      printMethodId: 'uv-color', // $6,500 / m2
      finishId: 'laminado-mate', // $4,200 / m2
      quantity: 1,
    };

    const quote = calculateQuote(config, pvcProduct);

    // Area: 2.00 m2
    expect(quote.areaM2).toBe(2.0);
    // Material cost: 2m2 * 18,500 = $37,000 (minimum charge is $12,000)
    expect(quote.materialCost).toBe(37000);
    // Print cost: 2m2 * 6,500 = $13,000
    expect(quote.printCost).toBe(13000);
    // Finish cost: 2m2 * 4,200 = $8,400
    expect(quote.finishCost).toBe(8400);

    // Unit Subtotal = 37,000 + 13,000 + 8,400 = $58,400
    expect(quote.unitSubtotal).toBe(58400);

    // Setup cost = $5,000
    expect(quote.setupCost).toBe(5000);

    // Total for qty 1 (0% discount) = 58,400 + 5,000 = $63,400
    expect(quote.subtotalBeforeDiscount).toBe(63400);
    expect(quote.volumeDiscountPercentage).toBe(0);
    expect(quote.total).toBe(63400);
    expect(quote.formatted.total).toBe('$ 63.400');
  });

  it('applies minimum charge when calculated material cost is below minimum', () => {
    const config: ProductConfiguration = {
      productId: 'cartel-pvc',
      widthCm: 20,
      heightCm: 20, // 0.04 m2
      materialId: 'pvc-5mm', // min charge is $12,000
      printMethodId: 'uv-color', // 0.04 * 6,500 = 260
      finishId: undefined,
      quantity: 1,
    };

    const quote = calculateQuote(config, pvcProduct);
    expect(quote.areaM2).toBe(0.04);
    expect(quote.materialCost).toBe(12000); // Triggered minimum charge
    expect(quote.printCost).toBe(260);
  });

  it('applies 15% volume discount for 20+ units', () => {
    const config: ProductConfiguration = {
      productId: 'cartel-pvc',
      widthCm: 100,
      heightCm: 100, // 1m2
      materialId: 'pvc-3mm', // $14,500
      printMethodId: 'eco-solvente', // $4,800
      finishId: undefined,
      quantity: 20,
    };

    const quote = calculateQuote(config, pvcProduct);
    expect(quote.volumeDiscountPercentage).toBe(15);
    // subtotalBeforeDiscount = (14500 + 4800) * 20 + 5000 = 19300 * 20 + 5000 = 386,000 + 5,000 = 391,000
    // With 15% off: 391,000 * 0.85 = 332,350
    expect(quote.subtotalBeforeDiscount).toBe(391000);
    expect(quote.total).toBe(332350);
  });

  it('handles linear meter pricing for CNC finish', () => {
    const config: ProductConfiguration = {
      productId: 'cartel-pvc',
      widthCm: 200,
      heightCm: 100, // Perimeter = 2 * (2 + 1) = 6 meters
      materialId: 'pvc-5mm',
      printMethodId: 'uv-color',
      finishId: 'corte-cnc', // $1,800 per linear meter
      quantity: 1,
    };

    const quote = calculateQuote(config, pvcProduct);
    expect(quote.perimeterMeters).toBe(6);
    expect(quote.finishCost).toBe(6 * 1800); // $10,800
  });
});
