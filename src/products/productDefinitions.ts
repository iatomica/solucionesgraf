import type { ProductDefinition } from '../types';

export const COMMON_STRUCTURES = [
  {
    id: 'ninguna' as const,
    name: 'Sin estructura adicional',
    price: 0,
    description: 'Montaje directo sobre pared o superficie existente.',
  },
  {
    id: 'patas-aluminio' as const,
    name: 'Patas de Apoyo de Aluminio (Auto-portante)',
    price: 8500,
    description: 'Dos patas ligeras metálicas para colocar en el suelo.',
  },
  {
    id: 'bastidor-hierro' as const,
    name: 'Bastidor Estructura Tubo de Hierro',
    price: 14000,
    description: 'Estructura tubular soldada para soporte en intemperie.',
  },
  {
    id: 'base-madera' as const,
    name: 'Base / Zócalo de Pie de Madera',
    price: 6000,
    description: 'Zócalo encastrable para soporte sobre mostradores o piso.',
  },
];

export const MOCK_PRODUCTS: ProductDefinition[] = [
  // --- CARTELERIA ---
  {
    id: 'cartel-pvc',
    name: 'Cartel PVC',
    category: 'carteleria',
    description:
      'Carteles de PVC espumado rígido. Ideales para exterior e interior, señalética y cartelería comercial de alta durabilidad.',
    minWidth: 20,
    maxWidth: 300,
    minHeight: 20,
    maxHeight: 200,
    defaultWidth: 200,
    defaultHeight: 100,
    defaultShape: 'rectangular',
    availableShapes: ['rectangular', 'circular', 'ovalado', 'escudo', 'troquelado'],
    bleedMm: 5,
    safeAreaMm: 10,
    setupCost: 5000,
    structures: COMMON_STRUCTURES,
    materials: [
      {
        id: 'pvc-3mm',
        name: 'PVC Espumado 3 mm',
        thickness: '3 mm',
        pricePerM2: 14500,
        minimumCharge: 9500,
        description: 'Liviano y versátil para carteles medianos y pequeños.',
        compatiblePrintMethodIds: ['uv-color', 'latex', 'eco-solvente'],
        compatibleFinishIds: ['laminado-mate', 'laminado-brillante', 'corte-cnc'],
      },
      {
        id: 'pvc-5mm',
        name: 'PVC Espumado 5 mm',
        thickness: '5 mm',
        pricePerM2: 18500,
        minimumCharge: 12000,
        description: 'Rigidez superior para grandes dimensiones e intemperie.',
        compatiblePrintMethodIds: ['uv-color', 'latex', 'eco-solvente'],
        compatibleFinishIds: [
          'laminado-mate',
          'laminado-brillante',
          'barniz-uv',
          'corte-cnc',
          'ojales',
        ],
      },
      {
        id: 'pvc-10mm',
        name: 'PVC Espumado 10 mm',
        thickness: '10 mm',
        pricePerM2: 26500,
        minimumCharge: 18000,
        description: 'Máxima solidez y presencia volumétrica.',
        compatiblePrintMethodIds: ['uv-color', 'latex'],
        compatibleFinishIds: [
          'laminado-mate',
          'laminado-brillante',
          'corte-cnc',
        ],
      },
    ],
    printMethods: [
      {
        id: 'uv-color',
        name: 'Impresión UV Color Directa',
        description: 'Secado UV de altísima precisión, colores vibrantes y resistencia a los rayos UV.',
        pricePerM2: 6500,
      },
      {
        id: 'latex',
        name: 'Impresión HP Latex (Vinilo montado)',
        description: 'Tintas ecológicas inodoras montadas sobre el panel.',
        pricePerM2: 5800,
      },
      {
        id: 'eco-solvente',
        name: 'Impresión Eco-Solvente',
        description: 'Excelente relación costo-beneficio para señalética comercial.',
        pricePerM2: 4800,
      },
    ],
    finishes: [
      {
        id: 'sin-terminacion',
        name: 'Sin terminación adicional',
        pricingType: 'fixedPrice',
        price: 0,
      },
      {
        id: 'laminado-mate',
        name: 'Laminado Protección Mate',
        pricingType: 'pricePerM2',
        price: 4200,
        description: 'Protege contra rayaduras y elimina reflejos molestos.',
      },
      {
        id: 'laminado-brillante',
        name: 'Laminado Protección Brillante',
        pricingType: 'pricePerM2',
        price: 4200,
        description: 'Realza la intensidad de los colores con acabado espejo.',
      },
      {
        id: 'corte-cnc',
        name: 'Corte de Contorno CNC Router',
        pricingType: 'pricePerLinearMeter',
        price: 1800,
        description: 'Corte de formas personalizadas y bordes perfectos.',
      },
    ],
  },
  {
    id: 'cartel-acrilico',
    name: 'Cartel Acrílico',
    category: 'carteleria',
    description:
      'Paneles de acrílico cristal o blanco brillante. Elegancia premium para marcas, recepciones y placas institucionales.',
    minWidth: 15,
    maxWidth: 240,
    minHeight: 15,
    maxHeight: 120,
    defaultWidth: 120,
    defaultHeight: 80,
    defaultShape: 'rectangular',
    availableShapes: ['rectangular', 'circular', 'ovalado', 'escudo'],
    bleedMm: 3,
    safeAreaMm: 10,
    setupCost: 7500,
    structures: COMMON_STRUCTURES,
    materials: [
      {
        id: 'acrilico-3mm',
        name: 'Acrílico Transparente 3 mm',
        thickness: '3 mm',
        pricePerM2: 32000,
        minimumCharge: 18000,
        compatiblePrintMethodIds: ['uv-color'],
        compatibleFinishIds: ['laminado-mate', 'corte-cnc', 'distanciadores'],
      },
      {
        id: 'acrilico-5mm',
        name: 'Acrílico Transparente 5 mm',
        thickness: '5 mm',
        pricePerM2: 45000,
        minimumCharge: 25000,
        compatiblePrintMethodIds: ['uv-color'],
        compatibleFinishIds: ['corte-cnc', 'distanciadores'],
      },
    ],
    printMethods: [
      {
        id: 'uv-color',
        name: 'Impresión UV Reversa + Cama Blanca',
        pricePerM2: 8900,
      },
    ],
    finishes: [
      {
        id: 'sin-terminacion',
        name: 'Sin terminación',
        pricingType: 'fixedPrice',
        price: 0,
      },
      {
        id: 'distanciadores',
        name: 'Kit 4 Distanciadores Metálicos',
        pricingType: 'fixedPrice',
        price: 6800,
      },
    ],
  },

  // --- TEXTIL Y ESTAMPERIA ---
  {
    id: 'textil-remera',
    name: 'Remera 100% Algodón Peinado',
    category: 'textil',
    description:
      'Remeras textiles de algodón peinado 24/1 premium. Aptas para estampado DTF full color, bordado o serigrafía.',
    minWidth: 20,
    maxWidth: 50,
    minHeight: 20,
    maxHeight: 60,
    defaultWidth: 35,
    defaultHeight: 45,
    defaultShape: 'rectangular',
    availableShapes: ['rectangular'],
    setupCost: 3000,
    structures: [],
    materials: [
      {
        id: 'algodon-24-1',
        name: 'Algodón Peinado 24/1 Premium',
        thickness: '180g',
        pricePerM2: 12000,
        minimumCharge: 7500,
        compatiblePrintMethodIds: ['dtf-textil', 'serigrafia', 'bordado', 'vinilo-textil'],
        compatibleFinishIds: ['bolsa-individual'],
      },
    ],
    printMethods: [
      {
        id: 'dtf-textil',
        name: 'Estampado DTF Full Color HD',
        pricePerM2: 6500,
        description: 'Colores vibrantes sin límite de tonos y alta durabilidad al lavado.',
      },
      {
        id: 'serigrafia',
        name: 'Serigrafía Plastisol (1 a 4 tintas)',
        pricePerM2: 4500,
        description: 'Ideal para grandes tiradas textiles.',
      },
      {
        id: 'bordado',
        name: 'Bordado Computarizado Fino',
        pricePerM2: 8500,
        description: 'Puntadas de alta densidad para presencia institucional.',
      },
      {
        id: 'vinilo-textil',
        name: 'Vinilo Térmico Textil Flex',
        pricePerM2: 5500,
      },
    ],
    finishes: [
      {
        id: 'sin-terminacion',
        name: 'Doblado y empaquetado estándar',
        pricingType: 'fixedPrice',
        price: 0,
      },
      {
        id: 'bolsa-individual',
        name: 'Embolsado Individual c/Etiqueta',
        pricingType: 'pricePerUnit',
        price: 350,
      },
    ],
  },
  {
    id: 'textil-hoodie',
    name: 'Buzo Hoodie con Capucha',
    category: 'textil',
    description:
      'Buzos estilo Canguro con capucha y bolsillo frontal en friza invisible de primera calidad. Máximo abrigo y confort.',
    minWidth: 20,
    maxWidth: 60,
    minHeight: 20,
    maxHeight: 70,
    defaultWidth: 40,
    defaultHeight: 50,
    defaultShape: 'rectangular',
    availableShapes: ['rectangular'],
    setupCost: 4500,
    structures: [],
    materials: [
      {
        id: 'friza-invisible',
        name: 'Friza Invisible Algodón/Poliéster',
        thickness: '320g',
        pricePerM2: 24000,
        minimumCharge: 18000,
        compatiblePrintMethodIds: ['dtf-textil', 'bordado', 'vinilo-textil'],
        compatibleFinishIds: ['bolsa-individual'],
      },
    ],
    printMethods: [
      {
        id: 'dtf-textil',
        name: 'Estampado DTF Full Color HD',
        pricePerM2: 6500,
      },
      {
        id: 'bordado',
        name: 'Bordado Computarizado Fino',
        pricePerM2: 8500,
      },
    ],
    finishes: [
      {
        id: 'sin-terminacion',
        name: 'Doblado Estándar',
        pricingType: 'fixedPrice',
        price: 0,
      },
    ],
  },
  {
    id: 'textil-pulover',
    name: 'Pulóver / Sweater Deportivo',
    category: 'textil',
    description:
      'Sweaters y pulóveres de lana acrílica o friza liviana sin capucha. Elegante opción corporativa para personal de atención.',
    minWidth: 20,
    maxWidth: 50,
    minHeight: 20,
    maxHeight: 60,
    defaultWidth: 35,
    defaultHeight: 45,
    defaultShape: 'rectangular',
    availableShapes: ['rectangular'],
    setupCost: 4000,
    structures: [],
    materials: [
      {
        id: 'lana-acrilica',
        name: 'Tejido Lana Acrílica / Friza Soft',
        thickness: '280g',
        pricePerM2: 21000,
        minimumCharge: 16000,
        compatiblePrintMethodIds: ['bordado', 'dtf-textil'],
        compatibleFinishIds: ['bolsa-individual'],
      },
    ],
    printMethods: [
      {
        id: 'bordado',
        name: 'Bordado Institucional Pecho/Espalda',
        pricePerM2: 8500,
      },
      {
        id: 'dtf-textil',
        name: 'DTF Textil',
        pricePerM2: 6500,
      },
    ],
    finishes: [
      {
        id: 'sin-terminacion',
        name: 'Doblado Estándar',
        pricingType: 'fixedPrice',
        price: 0,
      },
    ],
  },
];

export function getProductById(id: string): ProductDefinition {
  const found = MOCK_PRODUCTS.find((p) => p.id === id);
  return found || MOCK_PRODUCTS[0];
}

