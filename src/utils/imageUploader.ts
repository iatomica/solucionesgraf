import { useCanvasStore } from '../stores/useCanvasStore';
import { useSelectionStore } from '../stores/useSelectionStore';
import { useProductStore } from '../stores/useProductStore';
import type { GarmentSide } from '../types';

/**
 * Handles image files dropped or selected for upload, calculating aspect ratio
 * and adding them to the active canvas side.
 */
export function processImageFile(file: File, sideOverride?: GarmentSide) {
  if (!file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) return;

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const naturalWidth = img.naturalWidth || 800;
      const naturalHeight = img.naturalHeight || 600;

      const productConfig = useProductStore.getState().configuration;
      const activeSide = sideOverride || productConfig.activeSide || 'frente';

      // Calculate initial dimensions (~40% of product width maintaining aspect ratio)
      const aspect = naturalWidth / naturalHeight;
      let widthCm = Math.min(productConfig.widthCm * 0.5, 35);
      let heightCm = widthCm / aspect;

      if (heightCm > productConfig.heightCm * 0.8) {
        heightCm = productConfig.heightCm * 0.5;
        widthCm = heightCm * aspect;
      }

      // Center element on canvas
      const xCm = Number(((productConfig.widthCm - widthCm) / 2).toFixed(2));
      const yCm = Number(((productConfig.heightCm - heightCm) / 2).toFixed(2));

      const newId = `img-${Date.now()}`;
      useCanvasStore.getState().addElement({
        id: newId,
        type: 'image',
        src: dataUrl,
        proxyUrl: dataUrl,
        naturalWidth,
        naturalHeight,
        x: Math.max(0, xCm),
        y: Math.max(0, yCm),
        width: Number(widthCm.toFixed(2)),
        height: Number(heightCm.toFixed(2)),
        rotation: 0,
        zIndex: useCanvasStore.getState().elements.length + 1,
        side: activeSide,
        approxDpi: Math.round(naturalWidth / (widthCm / 2.54)),
        qualityRating:
          naturalWidth / (widthCm / 2.54) > 150 ? 'good' : 'medium',
      });

      useSelectionStore.getState().selectElement(newId);
    };
  };
  reader.readAsDataURL(file);
}
