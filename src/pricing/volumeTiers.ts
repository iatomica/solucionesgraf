import type { VolumeTier } from '../types';

export const DEFAULT_VOLUME_TIERS: VolumeTier[] = [
  { minQty: 1, maxQty: 4, discountFactor: 1.0, label: '1-4 unidades (0% desc.)' },
  { minQty: 5, maxQty: 9, discountFactor: 0.95, label: '5-9 unidades (5% desc.)' },
  { minQty: 10, maxQty: 19, discountFactor: 0.9, label: '10-19 unidades (10% desc.)' },
  { minQty: 20, maxQty: null, discountFactor: 0.85, label: '20+ unidades (15% desc.)' },
];

export function getVolumeDiscountFactor(
  quantity: number,
  tiers: VolumeTier[] = DEFAULT_VOLUME_TIERS
): { factor: number; percentage: number } {
  const safeQty = Math.max(1, quantity);
  const matchedTier = tiers.find(
    (tier) =>
      safeQty >= tier.minQty && (tier.maxQty === null || safeQty <= tier.maxQty)
  );

  const factor = matchedTier ? matchedTier.discountFactor : 1.0;
  const percentage = Math.round((1 - factor) * 100);

  return { factor, percentage };
}
