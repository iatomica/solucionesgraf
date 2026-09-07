import type { CanvasElement, DesignDocument, ProductConfiguration } from '../types';

export function serializeDesign(
  config: ProductConfiguration,
  elements: CanvasElement[],
  name: string = 'Mi Diseño Personalizado'
): DesignDocument {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: `design-${Date.now()}`,
    name,
    createdAt: now,
    updatedAt: now,
    productConfiguration: { ...config },
    canvasElements: elements.map((el) => ({ ...el })),
  };
}

export function deserializeDesign(jsonString: string): DesignDocument {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || parsed.version !== 1 || !parsed.productConfiguration) {
      throw new Error('Formato de archivo de diseño inválido o versión incompatible.');
    }
    return parsed as DesignDocument;
  } catch (err: any) {
    throw new Error(`Error al cargar diseño: ${err.message || 'JSON inválido'}`);
  }
}

export function downloadJsonFile(doc: DesignDocument, filename?: string) {
  const jsonStr = JSON.stringify(doc, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${doc.name.toLowerCase().replace(/\s+/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
