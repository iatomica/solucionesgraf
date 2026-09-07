import type { CanvasElement, ProductConfiguration, QuoteBreakdown } from '../types';
import { getProductById } from '../products/productDefinitions';

// Default WhatsApp phone number (Argentina country code +54)
export const DEFAULT_WHATSAPP_PHONE = '5491130004455';

export function buildWhatsAppMessage(
  config: ProductConfiguration,
  quote: QuoteBreakdown,
  elements: CanvasElement[]
): string {
  const productDef = getProductById(config.productId);
  const materialDef = productDef.materials.find((m) => m.id === config.materialId);
  const printDef = productDef.printMethods.find((p) => p.id === config.printMethodId);
  const finishDef = productDef.finishes.find((f) => f.id === config.finishId);
  const structureDef = productDef.structures.find((s) => s.id === config.structureId);

  // Check if any element has light effects
  const lightElements = elements.filter(
    (el) => el.lightEffect && el.lightEffect.type !== 'none'
  );

  let lightSummary = 'Sin luces';
  if (lightElements.length > 0) {
    const typesStr = Array.from(
      new Set(lightElements.map((el) => el.lightEffect?.type))
    )
      .map((t) => {
        if (t === 'neon-front') return 'Neón LED Frontal';
        if (t === 'backlight') return 'Retroiluminación LED (Backlight)';
        if (t === 'led-bulbs') return 'Luces LED Puntuales (Focos)';
        return t;
      })
      .join(', ');
    lightSummary = `${typesStr} (${lightElements.length} ${
      lightElements.length === 1 ? 'elemento' : 'elementos'
    })`;
  }

  const structureSummary =
    structureDef && structureDef.id !== 'ninguna'
      ? `${structureDef.name} (${quote.formatted.structureCost})`
      : 'Sin estructura adicional';

  const shapeNameMap: Record<string, string> = {
    rectangular: 'Rectangular',
    circular: 'Redondo / Circular',
    ovalado: 'Ovalado',
    escudo: 'Forma Escudo / Badge',
    troquelado: 'Troquelado / Forma Libre',
    'letra-corporea': 'Silueta Letra Corpórea',
  };

  const shapeSummary = shapeNameMap[config.shape || 'rectangular'] || 'Rectangular';

  const garmentDetails =
    productDef.category === 'textil'
      ? [
          `🎨 *Color de Prenda:* ${config.garmentColor || '#1E293B'}`,
          `📍 *Ubicación de Estampa:* ${config.printPlacement || 'Frente Pecho'}`,
        ]
      : [];

  const lines = [
    `👋 *¡Hola! Quisiera encargar el siguiente pedido personalizado:*`,
    ``,
    `📌 *Producto:* ${productDef.name} (${productDef.category.toUpperCase()})`,
    `🔷 *Forma del Cartel / Canva:* ${shapeSummary}`,
    `📐 *Medidas:* ${config.widthCm} × ${config.heightCm} cm (${quote.formatted.area})`,
    `🧱 *Material / Tela:* ${materialDef?.name || ''} (${materialDef?.thickness || ''})`,
    `🖨️ *Técnica / Impresión:* ${printDef?.name || ''}`,
    ...garmentDetails,
    `✨ *Terminación:* ${finishDef?.name || 'Sin terminación'}`,
    `🦵 *Estructura / 2º Cuerpo:* ${structureSummary}`,
    `💡 *Efectos de Luz:* ${lightSummary}`,
    `🔢 *Cantidad:* ${config.quantity} ${config.quantity > 1 ? 'unidades' : 'unidad'}`,
    ``,
    `💰 *TOTAL ESTIMADO:* ${quote.formatted.total}`,
    ``,
    `Quedo a la espera para coordinar la producción y entrega. ¡Muchas gracias!`,
  ];

  return lines.join('\n');
}

export function openWhatsAppUrl(
  config: ProductConfiguration,
  quote: QuoteBreakdown,
  elements: CanvasElement[],
  phoneNumber: string = DEFAULT_WHATSAPP_PHONE
) {
  const message = buildWhatsAppMessage(config, quote, elements);
  const encodedText = encodeURIComponent(message);

  // Free WhatsApp API URL format
  const url = phoneNumber
    ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  window.open(url, '_blank', 'noopener,noreferrer');
}
