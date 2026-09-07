# Presupuestador Visual Interactivo para Impresión Gráfica y Cartelería

Aplicación web completa, moderna y ultra-minimalista diseñada para empresas de impresiones gráficas, cartelería comercial y productos personalizados.

Permite a los clientes elegir un producto gráfico, configurar dimensiones físicas en centímetros, seleccionar materiales, tipos de impresión y acabados, diseñar visualmente sobre un lienzo interactivo a escala real ($1:1$) y obtener una estimación de presupuesto transparente en tiempo real.

---

## 🚀 Requisitos Previos y Ejecución

### 1. Instalación de dependencias
```bash
cd presupuestador-grafico
npm install
```

### 2. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 3. Ejecutar suite de pruebas unitarias (Motor de Precios)
```bash
npx vitest run
```

### 4. Compilar para producción
```bash
npm run build
```

---

## 🏛️ Arquitectura del Sistema

El proyecto está diseñado bajo una arquitectura modular limpia con separación estricta entre la UI de presentación, los stores de estado (Zustand) y la lógica de dominio / motor de precios:

```text
src/
├── api/                   # Mocks de API REST y endpoints de presupuesto
├── components/
│   ├── configuration/     # Sidebar de producto (medidas, material, impresión, terminación, cantidad)
│   ├── editor/            # Lienzo interactivo (React Konva, regla a escala, sangrado, área segura, atajos)
│   ├── layout/            # TopHeader minimalista B2B (undo/redo, exportación, vista previa)
│   ├── quote/             # Card de cotización en tiempo real y Modal de solicitud de presupuesto
│   └── templates/         # Modal de selección de plantillas demo
├── pricing/               # Lógica pura del motor de precios (desacoplada de React)
│   ├── pricingEngine.ts   # Algoritmo de cálculo de superficie, materiales, acabados y volumen
│   ├── volumeTiers.ts     # Escalas de descuentos por cantidad (1-4: 0%, 5-9: 5%, 10-19: 10%, 20+: 15%)
│   └── __tests__/         # Pruebas de unidad Vitest
├── products/              # Definiciones de productos y matrices de compatibilidad técnica
├── stores/                # Zustand stores (useProductStore, useCanvasStore, useSelectionStore, useHistoryStore, useQuoteStore)
├── templates/             # Plantillas base (Inmobiliaria, Obra, Comercio)
├── types/                 # Definiciones de tipos estrictos TypeScript
└── utils/                 # Transformador de escala cm ↔ px, estimador de DPI y serializador JSON
```

---

## ⚙️ Guía de Extensión y Mantenimiento

### 1. Cómo agregar un nuevo Producto
Edita el archivo `src/products/productDefinitions.ts` e inserta un nuevo objeto dentro del array `MOCK_PRODUCTS`:

```typescript
{
  id: 'cartel-luminoso',
  name: 'Cartel Luminoso Backlight',
  category: 'carteleria',
  description: 'Caja de luz de aluminio con frente translúcido.',
  minWidth: 50,
  maxWidth: 300,
  minHeight: 30,
  maxHeight: 150,
  defaultWidth: 150,
  defaultHeight: 80,
  materials: [ ... ],
  printMethods: [ ... ],
  finishes: [ ... ]
}
```

### 2. Cómo agregar un nuevo Material
Dentro de la definición de cualquier producto en `src/products/productDefinitions.ts`, añade una entrada al array `materials`:

```typescript
{
  id: 'pvc-15mm',
  name: 'PVC Espumado 15 mm',
  thickness: '15 mm',
  pricePerM2: 34000,          // Precio por metro cuadrado en ARS
  minimumCharge: 22000,       // Cobro mínimo por pieza
  compatiblePrintMethodIds: ['uv-color', 'latex'],
  compatibleFinishIds: ['laminado-mate', 'corte-cnc']
}
```

### 3. Cómo agregar una nueva Terminación / Acabado
En el array `finishes` de `src/products/productDefinitions.ts`:

```typescript
{
  id: 'corte-laser',
  name: 'Corte Láser Alta Precisión',
  pricingType: 'pricePerLinearMeter', // Opciones: 'pricePerM2' | 'pricePerLinearMeter' | 'fixedPrice' | 'pricePerUnit'
  price: 2500,                         // Precio según el pricingType
  description: 'Bordes pulidos con acabado cristal.'
}
```

### 4. Cómo modificar las reglas del Motor de Precios
El motor de precios se encuentra en `src/pricing/pricingEngine.ts`. La función pura `calculateQuote()` realiza:

1. Cálculo de **Superficie** ($m^2 = \text{ancho} \times \text{alto} / 10000$) y **Perímetro**.
2. **Costo de Material** ($\max(\text{área} \times \text{precioM2}, \text{minimumCharge})$).
3. **Costo de Impresión** ($\text{área} \times \text{precioM2}$).
4. **Costo de Terminación** (según si es por $m^2$, metro lineal o precio fijo).
5. **Costo Fijo de Preparación / Setup** (`setupCost`).
6. **Descuento por Volumen** según los tiers configurados en `src/pricing/volumeTiers.ts`.

---

## 🎨 Principios de Diseño Visual

- Estética minimalista estilo B2B SaaS (Linear, Stripe, Apple, Framer).
- Tipografía limpia **Inter**.
- Paleta neutra: Fondo `#FAFAFA`, Tarjetas `#FFFFFF`, Bordes `#E5E7EB`, Acento `#2563EB`.
- Sin sombras pesadas, neones ni elementos cargados.
