import React, { useState } from 'react';
import {
  Layers,
  Ruler,
  Printer,
  Sparkles,
  Minus,
  Plus,
  Info,
  CheckCircle2,
  Footprints,
  Shapes,
  Palette,
} from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import { MOCK_PRODUCTS, getProductById } from '../../products/productDefinitions';
import type { CanvasShape, ProductCategory, StructureType } from '../../types';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  carteleria: 'Cartelería',
  textil: 'Textil & Estampería',
};

const GARMENT_COLORS = [
  { id: '#F8FAFC', label: 'Blanco Puro' },
  { id: '#1E293B', label: 'Negro / Carbón' },
  { id: '#64748B', label: 'Gris Melange' },
  { id: '#1E3A8A', label: 'Azul Marino' },
  { id: '#991B1B', label: 'Rojo Carmín' },
  { id: '#065F46', label: 'Verde Botella' },
  { id: '#78350F', label: 'Beige / Arena' },
];

const SHAPE_NAMES: Record<CanvasShape, string> = {
  rectangular: 'Rectangular Standard',
  circular: 'Circular / Disco',
  ovalado: 'Ovalado / Elíptico',
  escudo: 'Forma Escudo / Badge',
  troquelado: 'Troquelado / Forma Libre',
  'letra-corporea': 'Silueta Letra Corpórea',
  'plancha-stickers': 'Plancha de Stickers',
};

export const ProductSidebar: React.FC = () => {
  const {
    configuration,
    setProduct,
    setDimensions,
    setMaterial,
    setPrintMethod,
    setFinish,
    setStructure,
    setShape,
    setGarmentColor,
    setPrintPlacement,
    setActiveSide,
    setQuantity,
  } = useProductStore();

  const currentProduct = getProductById(configuration.productId);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(
    currentProduct.category
  );

  const filteredProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === selectedCategory
  );

  const currentMaterial =
    currentProduct.materials.find((m) => m.id === configuration.materialId) ||
    currentProduct.materials[0];

  const availablePrintMethods = currentProduct.printMethods.filter((p) =>
    currentMaterial.compatiblePrintMethodIds.includes(p.id)
  );

  const availableFinishes = currentProduct.finishes.filter(
    (f) =>
      f.id === 'sin-terminacion' ||
      currentMaterial.compatibleFinishIds.includes(f.id)
  );

  const availableShapes = currentProduct.availableShapes || ['rectangular'];

  return (
    <aside className="w-[290px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none overflow-y-auto">
      <div className="p-4 border-b border-gray-100 bg-slate-50/50">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
          <span>Configuración del Producto</span>
          <Layers className="w-3.5 h-3.5 text-slate-400" />
        </h2>
        <p className="text-[11px] text-slate-400">
          Seleccioná categoría, material, formas y acabados
        </p>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Filtro de Categoría */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['carteleria', 'textil'] as ProductCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const firstInCat = MOCK_PRODUCTS.find((p) => p.category === cat);
                    if (firstInCat) setProduct(firstInCat.id);
                  }}
                  className={`text-[10px] font-semibold py-1.5 px-2 rounded-md transition-all text-center truncate ${
                    selectedCategory === cat
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            )}
          </div>
        </div>

        {/* 1. Producto */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Modelo / Producto</span>
          </label>
          <select
            value={configuration.productId}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            {filteredProducts.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1 leading-tight">
            {currentProduct.description}
          </p>
        </div>

        {/* Forma del Canva / Cartel */}
        {availableShapes.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Forma del Canva / Cartel</span>
              <Shapes className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <select
              value={configuration.shape || 'rectangular'}
              onChange={(e) => setShape(e.target.value as CanvasShape)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {availableShapes.map((shape) => (
                <option key={shape} value={shape}>
                  {SHAPE_NAMES[shape] || shape}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles para Indumentaria Textil */}
        {currentProduct.category === 'textil' && (
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Color de Prenda</span>
                <Palette className="w-3.5 h-3.5 text-blue-500" />
              </label>
              <div className="flex items-center space-x-2">
                {GARMENT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setGarmentColor(c.id)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      configuration.garmentColor === c.id
                        ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-300'
                        : 'border-slate-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.id }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Cara Activa de Edición
              </label>
              <div className="flex items-center space-x-1 bg-white p-1 rounded-md border border-blue-200">
                {(['frente', 'espalda', 'ambos'] as const).map((side) => (
                  <button
                    key={side}
                    onClick={() => setActiveSide(side)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-all text-center cursor-pointer ${
                      (configuration.activeSide || 'frente') === side
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {side === 'frente' && 'Frente'}
                    {side === 'espalda' && 'Espalda'}
                    {side === 'ambos' && 'Ambos'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Ubicación de Estampa
              </label>
              <select
                value={configuration.printPlacement || 'frente-pecho'}
                onChange={(e) => setPrintPlacement(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-white border border-blue-200 rounded-md px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="frente-pecho">Frente / Pecho Central</option>
                <option value="frente-grande">Frente Completo A3</option>
                <option value="espalda">Espalda / Dorsal</option>
                <option value="manga">Manga Izquierda</option>
              </select>
            </div>
          </div>
        )}

        {/* 2. Medidas (cm) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Medidas (cm)</span>
            <Ruler className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-1">Ancho</span>
              <div className="relative">
                <input
                  type="number"
                  min={currentProduct.minWidth}
                  max={currentProduct.maxWidth}
                  value={configuration.widthCm}
                  onChange={(e) =>
                    setDimensions(
                      Number(e.target.value),
                      configuration.heightCm
                    )
                  }
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-1.5 pr-7 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <span className="absolute right-2 top-1.5 text-[10px] font-medium text-slate-400">
                  cm
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] text-slate-500 mb-1">Alto</span>
              <div className="relative">
                <input
                  type="number"
                  min={currentProduct.minHeight}
                  max={currentProduct.maxHeight}
                  value={configuration.heightCm}
                  onChange={(e) =>
                    setDimensions(
                      configuration.widthCm,
                      Number(e.target.value)
                    )
                  }
                  className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-1.5 pr-7 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                />
                <span className="absolute right-2 top-1.5 text-[10px] font-medium text-slate-400">
                  cm
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
            <Info className="w-3 h-3 text-slate-300" />
            <span>
              Rango: {currentProduct.minWidth}×{currentProduct.minHeight} cm a {currentProduct.maxWidth}×{currentProduct.maxHeight} cm
            </span>
          </p>
        </div>

        {/* 3. Material y Espesor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Material / Sustrato
          </label>
          <select
            value={configuration.materialId}
            onChange={(e) => setMaterial(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            {currentProduct.materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name} ({mat.thickness})
              </option>
            ))}
          </select>
        </div>

        {/* 4. Tipo de Impresión */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Técnica de Impresión</span>
            <Printer className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <select
            value={configuration.printMethodId}
            onChange={(e) => setPrintMethod(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
          >
            {availablePrintMethods.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Terminación / Acabado */}
        {availableFinishes.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Terminación</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <select
              value={configuration.finishId || 'sin-terminacion'}
              onChange={(e) =>
                setFinish(
                  e.target.value === 'sin-terminacion' ? undefined : e.target.value
                )
              }
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {availableFinishes.map((fin) => (
                <option key={fin.id} value={fin.id}>
                  {fin.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 6. Estructura / Segundo Cuerpo */}
        {currentProduct.structures.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Estructura / 2º Cuerpo</span>
              <Footprints className="w-3.5 h-3.5 text-slate-400" />
            </label>
            <select
              value={configuration.structureId || 'ninguna'}
              onChange={(e) => setStructure(e.target.value as StructureType)}
              className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              {currentProduct.structures.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 7. Cantidad Stepper */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Cantidad
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-gray-200 rounded-md bg-slate-50 overflow-hidden">
              <button
                onClick={() => setQuantity(configuration.quantity - 1)}
                className="p-2 text-slate-600 hover:bg-white active:bg-slate-100 transition-all disabled:opacity-30"
                disabled={configuration.quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <input
                type="number"
                min="1"
                value={configuration.quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-12 text-center text-xs font-bold text-slate-900 bg-transparent outline-none"
              />

              <button
                onClick={() => setQuantity(configuration.quantity + 1)}
                className="p-2 text-slate-600 hover:bg-white active:bg-slate-100 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {configuration.quantity >= 5 && (
              <div className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Descuento aplicado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

