import { calculateApproxDpi } from './scaleConverter';

export interface WebProxyImageResult {
  proxyUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  approxDpi: number;
  qualityRating: 'good' | 'medium' | 'poor';
}

/**
 * Converts a File or image source string to a Web Proxy DataURL with web optimization,
 * resolution verification, and ink texture pre-processing.
 */
export async function createWebProxyImage(
  fileOrUrl: File | string,
  targetWidthCm: number,
  _targetHeightCm?: number
): Promise<WebProxyImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const loadHandler = () => {
      const naturalWidth = img.naturalWidth || 800;
      const naturalHeight = img.naturalHeight || 600;

      // Calculate DPI quality rating
      const dpiInfo = calculateApproxDpi(naturalWidth, targetWidthCm);
      const approxDpi = dpiInfo.dpi;
      const qualityRating = dpiInfo.rating;

      // Create Web Proxy Canvas (compressed/optimized for browser rendering)
      const canvas = document.createElement('canvas');
      const maxDimension = 1600; // max resolution for smooth WebGL/Canvas rendering
      let width = naturalWidth;
      let height = naturalHeight;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({
          proxyUrl: typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl),
          naturalWidth,
          naturalHeight,
          approxDpi,
          qualityRating,
        });
        return;
      }

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Web Proxy Data URL (PNG / WebP for transparency preservation)
      const proxyUrl = canvas.toDataURL('image/png', 0.92);

      resolve({
        proxyUrl,
        naturalWidth,
        naturalHeight,
        approxDpi,
        qualityRating,
      });
    };

    img.onload = loadHandler;
    img.onerror = (err) => reject(err);

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrUrl);
    }
  });
}
