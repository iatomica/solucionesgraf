/**
 * Formats a numeric value into ARS currency string ($ 185.400)
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'ARS',
  locale: string = 'es-AR'
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Replace non-breaking spaces (\u00A0 and \u202F) with standard space
  return formatter.format(amount).replace(/[\u00A0\u202F]/g, ' ');
}

/**
 * Formats m² area
 */
export function formatArea(areaM2: number): string {
  return `${areaM2.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} m²`;
}

/**
 * Formats dimensions string (e.g., 200 × 100 cm)
 */
export function formatDimensions(widthCm: number, heightCm: number): string {
  return `${widthCm} × ${heightCm} cm`;
}
