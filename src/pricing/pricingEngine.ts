import type {
  CanvasElement,
  ProductConfiguration,
  ProductDefinition,
  QuoteBreakdown,
} from '../types';
import { formatArea, formatCurrency } from '../utils/formatters';
import { getVolumeDiscountFactor } from './volumeTiers';

export function calculateQuote(
  config: ProductConfiguration,
  productDef: ProductDefinition,
  canvasElements: CanvasElement[] = []
): QuoteBreakdown {
  const { widthCm, heightCm, materialId, printMethodId, finishId, structureId, quantity } =
    config;

  // 1. Area & Perimeter
  const areaM2 = (widthCm / 100) * (heightCm / 100);
  const perimeterMeters = 2 * (widthCm / 100 + heightCm / 100);

  // 2. Material Cost
  const material = productDef.materials.find((m) => m.id === materialId);
  let materialCost = 0;
  if (material) {
    const rawMaterialCost = areaM2 * material.pricePerM2;
    materialCost = Math.max(
      rawMaterialCost,
      material.minimumCharge ?? 0
    );
  }

  // 3. Print Cost
  const printMethod = productDef.printMethods.find(
    (p) => p.id === printMethodId
  );
  let printCost = 0;
  if (printMethod) {
    printCost = areaM2 * printMethod.pricePerM2;
  }

  // 4. Finish Cost
  let finishCost = 0;
  if (finishId) {
    const finish = productDef.finishes.find((f) => f.id === finishId);
    if (finish) {
      switch (finish.pricingType) {
        case 'pricePerM2':
          finishCost = areaM2 * finish.price;
          break;
        case 'pricePerLinearMeter':
          finishCost = perimeterMeters * finish.price;
          break;
        case 'fixedPrice':
        case 'pricePerUnit':
          finishCost = finish.price;
          break;
      }
    }
  }

  // 5. Structure Cost (2nd body: legs, frame, wooden base)
  let structureCost = 0;
  if (structureId && productDef.structures) {
    const structureDef = productDef.structures.find((s) => s.id === structureId);
    if (structureDef) {
      structureCost = structureDef.price;
    }
  }

  // 6. Light Effects Cost (Neon, Backlight, LED bulbs)
  let lightCost = 0;
  canvasElements.forEach((el) => {
    if (el.lightEffect && el.lightEffect.type !== 'none') {
      switch (el.lightEffect.type) {
        case 'neon-front':
          lightCost += 4500 * (el.lightEffect.intensity || 1);
          break;
        case 'backlight':
          lightCost += 6800 * (el.lightEffect.intensity || 1);
          break;
        case 'led-bulbs':
          lightCost += 5200 * (el.lightEffect.intensity || 1);
          break;
      }
    }
  });

  // 7. Setup / Preparation Cost
  const setupCost = productDef.setupCost ?? 5000;

  // 8. Subtotals & Volume Discount
  const unitSubtotal = materialCost + printCost + finishCost + structureCost + lightCost;
  const safeQty = Math.max(1, quantity);
  const subtotalBeforeDiscount = unitSubtotal * safeQty + setupCost;

  const { factor: discountFactor, percentage: volumeDiscountPercentage } =
    getVolumeDiscountFactor(safeQty);

  const subtotalWithDiscount = subtotalBeforeDiscount * discountFactor;
  const volumeDiscountAmount = subtotalBeforeDiscount - subtotalWithDiscount;
  const total = Math.round(subtotalWithDiscount);

  return {
    areaM2: Number(areaM2.toFixed(4)),
    perimeterMeters: Number(perimeterMeters.toFixed(4)),
    materialCost: Math.round(materialCost),
    printCost: Math.round(printCost),
    finishCost: Math.round(finishCost),
    structureCost: Math.round(structureCost),
    lightCost: Math.round(lightCost),
    setupCost: Math.round(setupCost),
    unitSubtotal: Math.round(unitSubtotal),
    subtotalBeforeDiscount: Math.round(subtotalBeforeDiscount),
    volumeDiscountPercentage,
    volumeDiscountAmount: Math.round(volumeDiscountAmount),
    total,
    formatted: {
      area: formatArea(areaM2),
      materialCost: formatCurrency(materialCost),
      printCost: formatCurrency(printCost),
      finishCost: formatCurrency(finishCost),
      structureCost: formatCurrency(structureCost),
      lightCost: formatCurrency(lightCost),
      setupCost: formatCurrency(setupCost),
      unitSubtotal: formatCurrency(unitSubtotal),
      subtotalBeforeDiscount: formatCurrency(subtotalBeforeDiscount),
      volumeDiscountAmount: formatCurrency(volumeDiscountAmount),
      total: formatCurrency(total),
    },
  };
}
