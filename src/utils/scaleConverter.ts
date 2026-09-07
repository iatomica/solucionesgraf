export interface ScaleCalculation {
  scaleFactor: number; // pixels per cm
  canvasWidthPx: number;
  canvasHeightPx: number;
}

/**
 * Calculates scale factor to fit physical dimensions (in cm) inside available viewport (in px)
 */
export function calculateScaleFactor(
  physicalWidthCm: number,
  physicalHeightCm: number,
  viewportWidthPx: number,
  viewportHeightPx: number,
  paddingPx: number = 60
): ScaleCalculation {
  const safeViewportW = Math.max(200, viewportWidthPx - paddingPx * 2);
  const safeViewportH = Math.max(200, viewportHeightPx - paddingPx * 2);

  const scaleX = safeViewportW / Math.max(1, physicalWidthCm);
  const scaleY = safeViewportH / Math.max(1, physicalHeightCm);

  // Preserve aspect ratio
  const scaleFactor = Math.min(scaleX, scaleY);

  const canvasWidthPx = Math.round(physicalWidthCm * scaleFactor);
  const canvasHeightPx = Math.round(physicalHeightCm * scaleFactor);

  return {
    scaleFactor,
    canvasWidthPx,
    canvasHeightPx,
  };
}

/**
 * Converts centimeters to canvas pixels using the scale factor
 */
export function cmToPx(cm: number, scaleFactor: number): number {
  return cm * scaleFactor;
}

/**
 * Converts canvas pixels to centimeters using the scale factor
 */
export function pxToCm(px: number, scaleFactor: number): number {
  return scaleFactor > 0 ? px / scaleFactor : 0;
}

/**
 * Calculates approximate DPI for an uploaded image based on its natural pixel width and physical size in cm
 */
export function calculateApproxDpi(
  imageNaturalWidthPx: number,
  physicalWidthCm: number
): { dpi: number; rating: 'good' | 'medium' | 'poor' } {
  if (physicalWidthCm <= 0) return { dpi: 300, rating: 'good' };

  const physicalInches = physicalWidthCm / 2.54;
  const dpi = Math.round(imageNaturalWidthPx / physicalInches);

  let rating: 'good' | 'medium' | 'poor' = 'good';
  if (dpi < 100) {
    rating = 'poor';
  } else if (dpi < 200) {
    rating = 'medium';
  }

  return { dpi, rating };
}
