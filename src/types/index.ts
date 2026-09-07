export type ProductCategory =
  | 'carteleria'
  | 'textil';

export type CanvasShape =
  | 'rectangular'
  | 'circular'
  | 'ovalado'
  | 'escudo'
  | 'troquelado'
  | 'letra-corporea'
  | 'plancha-stickers';

export type GarmentSide = 'frente' | 'espalda' | 'ambos';

export interface ProductConfiguration {
  productId: string;
  widthCm: number;
  heightCm: number;
  materialId: string;
  printMethodId: string;
  finishId?: string;
  structureId?: StructureType;
  shape?: CanvasShape;
  garmentColor?: string;
  printPlacement?: string;
  activeSide?: GarmentSide;
  quantity: number;
}

export type PricingType =
  | 'pricePerM2'
  | 'pricePerLinearMeter'
  | 'fixedPrice'
  | 'pricePerUnit';

export type StructureType =
  | 'ninguna'
  | 'patas-aluminio'
  | 'bastidor-hierro'
  | 'base-madera';

export type LightEffectType =
  | 'none'
  | 'neon-front'
  | 'backlight'
  | 'led-bulbs';

export interface LightEffect {
  type: LightEffectType;
  color: string;
  intensity: number; // 1 to 10
}

export interface StructureDefinition {
  id: StructureType;
  name: string;
  price: number;
  description?: string;
}

export interface PrintMethod {
  id: string;
  name: string;
  description?: string;
  pricePerM2: number;
}

export interface FinishDefinition {
  id: string;
  name: string;
  pricingType: PricingType;
  price: number;
  description?: string;
}

export interface MaterialDefinition {
  id: string;
  name: string;
  thickness: string;
  pricePerM2: number;
  minimumCharge?: number;
  compatiblePrintMethodIds: string[];
  compatibleFinishIds: string[];
  description?: string;
}

export interface ProductDefinition {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  materials: MaterialDefinition[];
  printMethods: PrintMethod[];
  finishes: FinishDefinition[];
  structures: StructureDefinition[];
  defaultShape?: CanvasShape;
  availableShapes?: CanvasShape[];
  bleedMm?: number;
  safeAreaMm?: number;
  setupCost?: number;
}

export interface ProductConfiguration {
  productId: string;
  widthCm: number;
  heightCm: number;
  materialId: string;
  printMethodId: string;
  finishId?: string;
  structureId?: StructureType;
  shape?: CanvasShape;
  garmentColor?: string;
  printPlacement?: string;
  quantity: number;
}

export interface VolumeTier {
  minQty: number;
  maxQty: number | null;
  discountFactor: number;
  label: string;
}

export interface QuoteBreakdown {
  areaM2: number;
  perimeterMeters: number;
  materialCost: number;
  printCost: number;
  finishCost: number;
  structureCost: number;
  lightCost: number;
  setupCost: number;
  unitSubtotal: number;
  subtotalBeforeDiscount: number;
  volumeDiscountPercentage: number;
  volumeDiscountAmount: number;
  total: number;
  formatted: {
    area: string;
    materialCost: string;
    printCost: string;
    finishCost: string;
    structureCost: string;
    lightCost: string;
    setupCost: string;
    unitSubtotal: string;
    subtotalBeforeDiscount: string;
    volumeDiscountAmount: string;
    total: string;
  };
}

export type ElementType = 'text' | 'image';

export interface BaseCanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  side?: GarmentSide;
  locked?: boolean;
  visible?: boolean;
  lightEffect?: LightEffect;
}

export interface TextCanvasElement extends BaseCanvasElement {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
}

export interface ImageCanvasElement extends BaseCanvasElement {
  type: 'image';
  src: string;
  proxyUrl?: string; // Web proxy compressed format
  naturalWidth: number;
  naturalHeight: number;
  qualityRating?: 'good' | 'medium' | 'poor';
  approxDpi?: number;
  isPrintedTexture?: boolean;
}

export type CanvasElement = TextCanvasElement | ImageCanvasElement;

export interface DesignDocument {
  version: 1;
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  productConfiguration: ProductConfiguration;
  canvasElements: CanvasElement[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
  description: string;
  design: DesignDocument;
}

export interface QuoteRequestCustomerData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
}

export interface QuoteRequest {
  id: string;
  customer: QuoteRequestCustomerData;
  design: DesignDocument;
  quote: QuoteBreakdown;
  createdAt: string;
}


