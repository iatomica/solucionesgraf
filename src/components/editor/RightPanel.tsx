import React, { useState } from 'react';
import {
  Type,
  Image as ImageIcon,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Maximize2,
  Shirt,
  Palette,
  Sparkles,
  Shapes,
  Square,
  Circle as CircleIcon,
  Shield,
  Star as StarIcon,
  Triangle,
  Plus,
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useSelectionStore } from '../../stores/useSelectionStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useProductStore } from '../../stores/useProductStore';
import type {
  ImageCanvasElement,
  LightEffectType,
  TextCanvasElement,
  ShapeCanvasElement,
  ShapeType,
  GarmentSide,
} from '../../types';
import { getProductById } from '../../products/productDefinitions';
import { createWebProxyImage } from '../../utils/imageProxy';

const FONT_OPTIONS = [
  'Inter',
  'Montserrat',
  'Bebas Neue',
  'Oswald',
  'Playfair Display',
  'Pacifico',
  'Arial',
  'Roboto',
  'Impact',
  'Georgia',
  'Courier New',
];

interface RightPanelProps {
  onOpenTemplates?: () => void;
  onRequestQuote?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = () => {
  const {
    elements,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    reorderZIndex,
  } = useCanvasStore();

  const { selectedId, selectElement } = useSelectionStore();
  const { pushState } = useHistoryStore();
  const { configuration, setProduct } = useProductStore();

  const [activeTab, setActiveTab] = useState<'tools' | 'layers'>('tools');
  const [newText, setNewText] = useState('NUEVO TEXTO');
  const [newTextFont, setNewTextFont] = useState('Inter');
  const [newTextColor, setNewTextColor] = useState('#0F172A');

  // State for adding shape layers
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>('rect');
  const [selectedShapeFill, setSelectedShapeFill] = useState('#2563EB');

  const selectedElement = elements.find((el) => el.id === selectedId);
  const productDef = getProductById(configuration.productId);

  // Add shape layer element
  const handleAddShape = (shapeTypeToUse?: ShapeType) => {
    pushState(elements);
    const chosenType = shapeTypeToUse || selectedShapeType;
    const isEquilateral =
      chosenType === 'circle' || chosenType === 'star' || chosenType === 'triangle';

    const targetW = Number(Math.min(configuration.widthCm * 0.45, 50).toFixed(1));
    const targetH = isEquilateral ? targetW : Number((targetW * 0.65).toFixed(1));

    // Stagger position if there are already shapes so layers don't overlap 100% invisibly
    const existingShapes = elements.filter((e) => e.type === 'shape');
    const offsetStep = existingShapes.length > 0 ? ((existingShapes.length % 5) + 1) * 2.5 : 0;
    const centerX = (configuration.widthCm - targetW) / 2;
    const centerY = (configuration.heightCm - targetH) / 2;
    const initialX = Number(Math.max(2, Math.min(configuration.widthCm - targetW - 2, centerX + offsetStep)).toFixed(2));
    const initialY = Number(Math.max(2, Math.min(configuration.heightCm - targetH - 2, centerY + offsetStep)).toFixed(2));

    const newEl: ShapeCanvasElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: chosenType,
      fill: selectedShapeFill,
      fillSecondary: '#FFFFFF',
      colorPattern: 'solido',
      x: initialX,
      y: initialY,
      width: targetW,
      height: targetH,
      rotation: 0,
      stroke: '#CBD5E1',
      strokeWidth: 2,
      cornerRadius: chosenType === 'rect' ? 8 : 0,
      opacity: 1,
      side: configuration.activeSide || 'frente',
      zIndex: elements.length + 1,
    };
    addElement(newEl);
    selectElement(newEl.id);
  };

  // Add text element
  const handleAddText = () => {
    pushState(elements);
    const targetW = Math.min(configuration.widthCm * 0.6, 40);
    const targetH = 8;
    const newEl: TextCanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: newText || 'TEXTO PERSONALIZADO',
      x: Number(Math.max(2, (configuration.widthCm - targetW) / 2).toFixed(2)),
      y: Number(Math.max(2, (configuration.heightCm - targetH) / 2).toFixed(2)),
      width: targetW,
      height: targetH,
      fontSize: 48,
      fontFamily: newTextFont,
      fill: newTextColor,
      align: 'center',
      bold: true,
      rotation: 0,
      side: configuration.activeSide || 'frente',
      zIndex: elements.length + 1,
    };
    addElement(newEl);
    selectElement(newEl.id);
  };

  // Image upload handler using Web Proxy format
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Formato de imagen no soportado. Por favor usá PNG, JPG, WEBP o SVG.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('El archivo es demasiado grande (máximo 15MB).');
      return;
    }

    try {
      const targetW = Math.min(configuration.widthCm * 0.7, 60);
      const targetH = targetW;

      const proxyResult = await createWebProxyImage(
        file,
        targetW,
        targetH
      );

      pushState(elements);
      const aspect = proxyResult.naturalHeight / (proxyResult.naturalWidth || 1);
      const calculatedH = targetW * aspect;

      const newEl: ImageCanvasElement = {
        id: `img-${Date.now()}`,
        type: 'image',
        src: proxyResult.proxyUrl,
        proxyUrl: proxyResult.proxyUrl,
        naturalWidth: proxyResult.naturalWidth,
        naturalHeight: proxyResult.naturalHeight,
        x: (configuration.widthCm - targetW) / 2,
        y: (configuration.heightCm - calculatedH) / 2,
        width: Number(targetW.toFixed(2)),
        height: Number(calculatedH.toFixed(2)),
        rotation: 0,
        qualityRating: proxyResult.qualityRating,
        approxDpi: proxyResult.approxDpi,
        isPrintedTexture: true,
        side: configuration.activeSide || 'frente',
        zIndex: elements.length + 1,
      };
      addElement(newEl);
    } catch (err) {
      console.error('Error procesando imagen Web Proxy:', err);
      alert('Hubo un error al procesar la imagen.');
    }
  };

  // Full Crop / Cover Entire Surface helper
  const handleFullCropImage = (imgEl: ImageCanvasElement) => {
    pushState(elements);
    const containerW = configuration.widthCm;
    const containerH = configuration.heightCm;
    const imgRatio = (imgEl.naturalWidth || 1) / (imgEl.naturalHeight || 1);
    const containerRatio = containerW / containerH;

    let newW = containerW;
    let newH = containerH;

    if (imgRatio > containerRatio) {
      newH = containerH;
      newW = containerH * imgRatio;
    } else {
      newW = containerW;
      newH = containerW / imgRatio;
    }

    updateElement(imgEl.id, {
      x: Number(((containerW - newW) / 2).toFixed(2)),
      y: Number(((containerH - newH) / 2).toFixed(2)),
      width: Number(newW.toFixed(2)),
      height: Number(newH.toFixed(2)),
      rotation: 0,
    });
  };

  return (
    <aside className="w-[300px] bg-white border-l border-gray-200 flex flex-col h-full shrink-0 select-none overflow-y-auto">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 py-2.5 text-[11px] font-semibold text-center border-b-2 transition-all ${
            activeTab === 'tools'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Herramientas
        </button>

        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-2.5 text-[11px] font-semibold text-center border-b-2 transition-all ${
            activeTab === 'layers'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Capas ({elements.length})
        </button>
      </div>

      <div className="p-4 flex-1">
        {activeTab === 'layers' ? (
          /* TAB 2: Panel de Capas view */
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Panel de Capas
            </h3>

            {elements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                No hay elementos en el lienzo
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...elements]
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((el) => {
                    const isSel = el.id === selectedId;
                    return (
                      <div
                        key={el.id}
                        onClick={() => selectElement(el.id)}
                        onDoubleClick={() => {
                          selectElement(el.id);
                          setActiveTab('tools');
                        }}
                        className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                          isSel
                            ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium shadow-2xs'
                            : 'bg-slate-50 border-gray-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {el.type === 'text' && (
                            <Type className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          {el.type === 'image' && (
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          {el.type === 'shape' && (
                            <div
                              className="w-3.5 h-3.5 rounded-xs border border-slate-300 shrink-0 shadow-2xs"
                              style={{ backgroundColor: (el as ShapeCanvasElement).fill || '#2563EB' }}
                              title={`Forma ${(el as ShapeCanvasElement).shapeType}`}
                            />
                          )}
                          <span className="truncate">
                            {el.type === 'text'
                              ? `"${(el as TextCanvasElement).text}"`
                              : el.type === 'shape'
                              ? `Capa: ${
                                  (el as ShapeCanvasElement).shapeType === 'circle'
                                    ? 'Círculo'
                                    : (el as ShapeCanvasElement).shapeType === 'escudo'
                                    ? 'Escudo'
                                    : (el as ShapeCanvasElement).shapeType === 'ellipse'
                                    ? 'Óvalo'
                                    : (el as ShapeCanvasElement).shapeType === 'star'
                                    ? 'Estrella'
                                    : (el as ShapeCanvasElement).shapeType === 'triangle'
                                    ? 'Triángulo'
                                    : (el as ShapeCanvasElement).shapeType === 'badge'
                                    ? 'Placa'
                                    : 'Rectángulo'
                                }`
                              : 'Imagen / Logo'}
                          </span>
                          {productDef.category === 'textil' && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                              {el.side || 'frente'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectElement(el.id);
                              setActiveTab('tools');
                            }}
                            className="p-1 hover:bg-white rounded text-blue-600"
                            title="Editar propiedades de capa"
                          >
                            <Palette className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pushState(elements);
                              reorderZIndex(el.id, 'up');
                            }}
                            className="p-1 hover:bg-white rounded text-slate-500"
                            title="Subir nivel"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pushState(elements);
                              reorderZIndex(el.id, 'down');
                            }}
                            className="p-1 hover:bg-white rounded text-slate-500"
                            title="Bajar nivel"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              pushState(elements);
                              deleteElement(el.id);
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-500 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : selectedElement ? (
          /* TAB 1: INSPECTOR MODE (Selected Element active) */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
                {selectedElement.type === 'text' ? (
                  <Type className="w-4 h-4 text-blue-600" />
                ) : selectedElement.type === 'shape' ? (
                  <Shapes className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {selectedElement.type === 'text'
                    ? 'Propiedades de Texto'
                    : selectedElement.type === 'shape'
                    ? 'Propiedades de Capa / Forma'
                    : 'Propiedades de Imagen'}
                </span>
              </h3>
              <button
                onClick={() => selectElement('')}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
              >
                Cerrar
              </button>
            </div>

            {/* Target Garment Side (Textile Category Only) */}
            {productDef.category === 'textil' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Cara / Ubicación de Estampa</span>
                  <Shirt className="w-3.5 h-3.5 text-blue-500" />
                </label>
                <div className="flex items-center space-x-1 bg-slate-50 border border-gray-200 p-1 rounded-md">
                  {(['frente', 'espalda', 'ambos'] as GarmentSide[]).map((side) => (
                    <button
                      key={side}
                      onClick={() => {
                        pushState(elements);
                        updateElement(selectedElement.id, { side });
                      }}
                      className={`p-1.5 rounded flex-1 text-[11px] font-semibold text-center transition-all ${
                        (selectedElement.side || 'frente') === side
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:bg-white'
                      }`}
                    >
                      {side === 'frente' && 'Frente'}
                      {side === 'espalda' && 'Espalda'}
                      {side === 'ambos' && 'Ambos'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TEXT PROPERTIES */}
            {selectedElement.type === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contenido
                  </label>
                  <textarea
                    value={(selectedElement as TextCanvasElement).text}
                    onChange={(e) => {
                      pushState(elements);
                      updateElement(selectedElement.id, {
                        text: e.target.value,
                      });
                    }}
                    rows={2}
                    className="w-full text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md p-2 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipografía
                    </label>
                    <select
                      value={(selectedElement as TextCanvasElement).fontFamily}
                      onChange={(e) => {
                        pushState(elements);
                        updateElement(selectedElement.id, {
                          fontFamily: e.target.value,
                        });
                      }}
                      className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md p-1.5 focus:bg-white focus:border-blue-500 focus:outline-none"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tamaño
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="200"
                      value={(selectedElement as TextCanvasElement).fontSize}
                      onChange={(e) => {
                        pushState(elements);
                        updateElement(selectedElement.id, {
                          fontSize: Number(e.target.value),
                        });
                      }}
                      className="w-full text-xs font-semibold text-slate-900 bg-slate-50 border border-gray-200 rounded-md p-1.5 focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Alignment & Styles */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alineación y Estilo
                  </label>
                  <div className="flex items-center space-x-1 bg-slate-50 border border-gray-200 p-1 rounded-md">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() => {
                          pushState(elements);
                          updateElement(selectedElement.id, { align });
                        }}
                        className={`p-1.5 rounded flex-1 flex justify-center text-slate-600 hover:bg-white ${
                          (selectedElement as TextCanvasElement).align === align
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : ''
                        }`}
                      >
                        {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                        {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                        {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                      </button>
                    ))}

                    <div className="h-4 w-px bg-gray-200 mx-1" />

                    <button
                      onClick={() => {
                        pushState(elements);
                        updateElement(selectedElement.id, {
                          bold: !(selectedElement as TextCanvasElement).bold,
                        });
                      }}
                      className={`p-1.5 rounded flex-1 flex justify-center text-slate-600 hover:bg-white ${
                        (selectedElement as TextCanvasElement).bold
                          ? 'bg-white text-blue-600 shadow-2xs font-bold'
                          : ''
                      }`}
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Color del Texto</span>
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <div className="flex items-center flex-wrap gap-1.5 mb-2">
                    {['#0F172A', '#FFFFFF', '#DC2626', '#EA580C', '#EAB308', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => {
                          pushState(elements);
                          updateElement(selectedElement.id, { fill: col });
                        }}
                        className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                          (selectedElement as TextCanvasElement).fill === col
                            ? 'scale-125 border-blue-600 ring-2 ring-blue-300'
                            : 'border-slate-300 hover:scale-110'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={(selectedElement as TextCanvasElement).fill || '#0F172A'}
                      onChange={(e) => {
                        pushState(elements);
                        updateElement(selectedElement.id, {
                          fill: e.target.value,
                        });
                      }}
                      className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600">
                      {(selectedElement as TextCanvasElement).fill || '#0F172A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* IMAGE PROPERTIES */}
            {selectedElement.type === 'image' && (
              <div className="space-y-4">
                {/* Full Crop Coverage Button */}
                <button
                  onClick={() => handleFullCropImage(selectedElement as ImageCanvasElement)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ajustar a Cobertura Total (Full Crop 100%)</span>
                </button>

                <div className="p-3 bg-slate-50 border border-gray-200 rounded-md space-y-2">
                  <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Calidad de la Imagen
                  </span>

                  {((selectedElement as ImageCanvasElement).qualityRating === 'good') && (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Buena calidad (~{(selectedElement as ImageCanvasElement).approxDpi} DPI)</span>
                    </div>
                  )}

                  {((selectedElement as ImageCanvasElement).qualityRating === 'medium') && (
                    <div className="flex items-center space-x-1.5 text-xs text-amber-700 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>⚠ Calidad media (~{(selectedElement as ImageCanvasElement).approxDpi} DPI)</span>
                    </div>
                  )}

                  {((selectedElement as ImageCanvasElement).qualityRating === 'poor') && (
                    <div className="flex items-center space-x-1.5 text-xs text-rose-700 font-semibold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>⚠ Resolución insuficiente (&lt;100 DPI)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIGHT EFFECTS SECTION FOR CARTELERIA PRODUCTS */}
            {productDef.category === 'carteleria' && (
              <div className="pt-3 border-t border-gray-100 space-y-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Efectos Visuales de Luz (LED / Neón)</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tipo de Iluminación
                  </label>
                  <select
                    value={selectedElement.lightEffect?.type || 'none'}
                    onChange={(e) => {
                      pushState(elements);
                      const type = e.target.value as LightEffectType;
                      updateElement(selectedElement.id, {
                        lightEffect: {
                          type,
                          color: selectedElement.lightEffect?.color || '#38BDF8',
                          intensity: selectedElement.lightEffect?.intensity || 5,
                        },
                      });
                    }}
                    className="w-full text-xs font-medium text-slate-800 bg-white border border-gray-200 rounded-md p-1.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="none">Sin luces</option>
                    <option value="neon-front">Neón LED Frontal</option>
                    <option value="backlight">Retroiluminación LED (Backlight)</option>
                    <option value="led-bulbs">Luces LED Puntuales (Focos Vintage)</option>
                  </select>
                </div>
              </div>
            )}

            {/* SHAPE PROPERTIES */}
            {selectedElement.type === 'shape' && (() => {
              const shapeEl = selectedElement as ShapeCanvasElement;
              const QUICK_COLORS = [
                '#FFFFFF', '#0F172A', '#2563EB', '#0284C7',
                '#DC2626', '#EA580C', '#16A34A', '#F59E0B',
                '#7C3AED', '#DB2777', '#E2E8F0', '#94A3B8',
              ];

              return (
                <div className="space-y-4">
                  {/* Shape Type Quick Switcher */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Forma Geométrica</span>
                      <span className="text-[10px] text-blue-600 font-bold uppercase">
                        {shapeEl.shapeType}
                      </span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'rect', label: 'Rectángulo', icon: Square },
                        { id: 'circle', label: 'Círculo', icon: CircleIcon },
                        { id: 'ellipse', label: 'Óvalo', icon: CircleIcon },
                        { id: 'escudo', label: 'Escudo', icon: Shield },
                        { id: 'star', label: 'Estrella', icon: StarIcon },
                        { id: 'triangle', label: 'Triángulo', icon: Triangle },
                        { id: 'badge', label: 'Placa', icon: Square },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isChosen = shapeEl.shapeType === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              pushState(elements);
                              updateElement(shapeEl.id, { shapeType: item.id as ShapeType });
                            }}
                            className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                              isChosen
                                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            title={item.label}
                          >
                            <Icon className="w-3.5 h-3.5 mb-0.5" />
                            <span className="text-[9px] truncate w-full">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Color & Palette */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Color de Relleno (Base)</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {shapeEl.fill || '#2563EB'}
                      </span>
                    </label>
                    <div className="flex items-center space-x-1.5 mb-2">
                      <input
                        type="color"
                        value={shapeEl.fill || '#2563EB'}
                        onChange={(e) => {
                          pushState(elements);
                          updateElement(shapeEl.id, { fill: e.target.value });
                        }}
                        className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={shapeEl.fill || '#2563EB'}
                        onChange={(e) => {
                          pushState(elements);
                          updateElement(shapeEl.id, { fill: e.target.value });
                        }}
                        className="w-full text-xs font-mono font-semibold text-slate-800 bg-white border border-gray-200 rounded-md p-1.5 uppercase"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                      {QUICK_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => {
                            pushState(elements);
                            updateElement(shapeEl.id, { fill: col });
                          }}
                          className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                            shapeEl.fill === col
                              ? 'scale-125 border-blue-600 ring-2 ring-blue-300'
                              : 'border-slate-300 hover:scale-110'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Color Pattern Style */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Disposición de Colores
                    </label>
                    <select
                      value={shapeEl.colorPattern || 'solido'}
                      onChange={(e) => {
                        pushState(elements);
                        updateElement(shapeEl.id, {
                          colorPattern: e.target.value as any,
                        });
                      }}
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-gray-200 rounded-md p-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="solido">Color Sólido (1 solo color)</option>
                      <option value="horizontal">Líneas Horizontales (Bicolor 50/50)</option>
                      <option value="vertical">Líneas Verticales (Bicolor 50/50)</option>
                      <option value="diagonal">Líneas Diagonales (Bicolor)</option>
                      <option value="radial">Degradado Radial Suave</option>
                    </select>
                  </div>

                  {/* Secondary Color (Shown for bicolor/gradient) */}
                  {shapeEl.colorPattern && shapeEl.colorPattern !== 'solido' && (
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>Color Secundario de Capa</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {shapeEl.fillSecondary || '#FFFFFF'}
                        </span>
                      </label>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="color"
                          value={shapeEl.fillSecondary || '#FFFFFF'}
                          onChange={(e) => {
                            pushState(elements);
                            updateElement(shapeEl.id, { fillSecondary: e.target.value });
                          }}
                          className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                        />
                        <div className="flex items-center space-x-1 flex-wrap gap-1 flex-1">
                          {QUICK_COLORS.slice(0, 8).map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => {
                                pushState(elements);
                                updateElement(shapeEl.id, { fillSecondary: col });
                              }}
                              className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                                shapeEl.fillSecondary === col
                                  ? 'scale-125 border-blue-600 ring-2 ring-blue-300'
                                  : 'border-slate-300'
                              }`}
                              style={{ backgroundColor: col }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Border / Stroke */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Borde / Contorno de Capa</span>
                      <span className="text-[10px] text-slate-500">
                        {shapeEl.strokeWidth || 0} px
                      </span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={shapeEl.stroke || '#CBD5E1'}
                        onChange={(e) => {
                          pushState(elements);
                          updateElement(shapeEl.id, { stroke: e.target.value });
                        }}
                        className="w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5 bg-white shrink-0"
                      />
                      <div className="flex items-center space-x-1 flex-1">
                        {[0, 2, 4, 6, 8].map((px) => (
                          <button
                            key={px}
                            type="button"
                            onClick={() => {
                              pushState(elements);
                              updateElement(shapeEl.id, { strokeWidth: px });
                            }}
                            className={`flex-1 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              (shapeEl.strokeWidth || 0) === px
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {px === 0 ? 'Sin' : `${px}px`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Opacidad de la Capa</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        {Math.round((shapeEl.opacity !== undefined ? shapeEl.opacity : 1) * 100)}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={shapeEl.opacity !== undefined ? shapeEl.opacity : 1}
                      onPointerDown={() => pushState(elements)}
                      onChange={(e) => {
                        updateElement(shapeEl.id, { opacity: parseFloat(e.target.value) });
                      }}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Corner Radius (for Rect) */}
                  {shapeEl.shapeType === 'rect' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Redondeo de Esquinas</span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {shapeEl.cornerRadius || 0} px
                        </span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        step="2"
                        value={shapeEl.cornerRadius || 0}
                        onPointerDown={() => pushState(elements)}
                        onChange={(e) => {
                          updateElement(shapeEl.id, { cornerRadius: parseInt(e.target.value) });
                        }}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Layer Z-Order Quick Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        pushState(elements);
                        reorderZIndex(shapeEl.id, 'up');
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1 cursor-pointer"
                      title="Subir de nivel en la pila de capas"
                    >
                      <ArrowUp className="w-3 h-3 text-blue-600" />
                      <span>Traer al Frente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        pushState(elements);
                        reorderZIndex(shapeEl.id, 'down');
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center justify-center space-x-1 cursor-pointer"
                      title="Bajar de nivel en la pila de capas"
                    >
                      <ArrowDown className="w-3 h-3 text-slate-600" />
                      <span>Enviar Atrás</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* UNIVERSAL ACTIONS */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rotación (Grados)
                </label>
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={selectedElement.rotation || 0}
                  onFocus={() => pushState(elements)}
                  onChange={(e) => {
                    updateElement(selectedElement.id, {
                      rotation: Number(e.target.value),
                    });
                  }}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-gray-200 rounded-md p-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => {
                    pushState(elements);
                    deleteElement(selectedElement.id);
                  }}
                  className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 1: GENERAL ADD TOOLS MODE (No selection) */
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Agregar Elementos
              </h3>
              <p className="text-[11px] text-slate-400">
                Añadí texto, imágenes o figuras al diseño
              </p>
            </div>

            {/* Pacdora-style Quick Add Text Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Type className="w-4 h-4 text-blue-600" />
                  <span>Texto / Escritura</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Personalizado</span>
              </div>

              <div>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Escribí tu texto aquí..."
                  className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Font Selector & Color Preview */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Tipografía
                  </label>
                  <select
                    value={newTextFont}
                    onChange={(e) => setNewTextFont(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Color de Letra
                  </label>
                  <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <input
                      type="color"
                      value={newTextColor}
                      onChange={(e) => setNewTextColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="text-[11px] font-mono font-medium text-slate-600 truncate">
                      {newTextColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Text Palette Preset Pills */}
              <div>
                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                  {['#0F172A', '#FFFFFF', '#DC2626', '#EA580C', '#16A34A', '#2563EB', '#7C3AED', '#DB2777'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewTextColor(col)}
                      title={col}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                        newTextColor === col
                          ? 'scale-125 border-blue-600 ring-2 ring-blue-300'
                          : 'border-slate-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddText}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Insertar Texto en {configuration.activeSide?.toUpperCase() || 'FRENTE'}</span>
              </button>
            </div>

            {/* Quick Add Shape Layers Card (Especialmente para Cartelería) */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3.5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Shapes className="w-4 h-4 text-indigo-600" />
                  <span>Capas de Formas para Cartel</span>
                </label>
                <span className="text-[10px] text-indigo-600 bg-indigo-100/80 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Capas
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                Superponé formas geométricas por delante del cartel y combinalas con colores o degradados.
              </p>

              {/* Grid of shapes with instant preview */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'rect', label: 'Rectángulo', icon: Square },
                  { id: 'circle', label: 'Círculo', icon: CircleIcon },
                  { id: 'ellipse', label: 'Óvalo', icon: CircleIcon },
                  { id: 'escudo', label: 'Escudo', icon: Shield },
                  { id: 'star', label: 'Estrella', icon: StarIcon },
                  { id: 'triangle', label: 'Triángulo', icon: Triangle },
                  { id: 'badge', label: 'Placa', icon: Square },
                ].map((item) => {
                  const Icon = item.icon;
                  const isChosen = selectedShapeType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedShapeType(item.id as ShapeType);
                      }}
                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isChosen
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                      title={`Elegir ${item.label}`}
                    >
                      <Icon className="w-3.5 h-3.5 mb-0.5" />
                      <span className="text-[9px] truncate w-full">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Shape Color Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Color Inicial de la Capa
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="color"
                      value={selectedShapeFill}
                      onChange={(e) => setSelectedShapeFill(e.target.value)}
                      className="w-5 h-5 rounded border border-gray-200 cursor-pointer p-0 bg-white shrink-0"
                    />
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {selectedShapeFill}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                  {[
                    '#2563EB', '#0284C7', '#0F172A', '#FFFFFF',
                    '#DC2626', '#EA580C', '#16A34A', '#F59E0B',
                    '#7C3AED', '#DB2777', '#E2E8F0', '#94A3B8',
                  ].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedShapeFill(col)}
                      title={col}
                      className={`w-5 h-5 rounded-full border transition-all cursor-pointer ${
                        selectedShapeFill === col
                          ? 'scale-125 border-indigo-600 ring-2 ring-indigo-300'
                          : 'border-slate-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddShape()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>➕ Añadir Capa de Forma al Cartel</span>
              </button>
            </div>

            {/* Pacdora-style Image Upload Banner */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Subir Imagen / Diseño</span>
                <span className="text-[10px] font-normal text-slate-400">PNG, JPG, SVG</span>
              </label>

              <label className="group relative border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gradient-to-b from-blue-50/40 via-white to-purple-50/30 hover:bg-blue-50/60 shadow-2xs">
                <div className="w-12 h-12 rounded-full bg-blue-100/70 group-hover:bg-blue-600 group-hover:text-white text-blue-600 flex items-center justify-center mb-2.5 transition-all shadow-2xs group-hover:scale-110">
                  <Upload className="w-6 h-6 transition-colors" />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Haga clic para cargar
                </span>
                <span className="text-[11px] text-slate-500 mt-1 text-center">
                  O arrastre y suelte la imagen aquí
                </span>
                <span className="mt-2 text-[10px] font-semibold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded-full">
                  Se estampará en: {(configuration.activeSide || 'frente').toUpperCase()}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Pacdora-style "Maquetas similares" Textile Model Gallery */}
            {productDef.category === 'textil' && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Maquetas similares</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer">
                    Modelos
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'textil-remera',
                      label: 'Remera Cuello Redondo',
                      sub: 'Algodón 24/1',
                      iconBg: 'bg-blue-50',
                      iconColor: 'text-blue-600',
                    },
                    {
                      id: 'textil-hoodie',
                      label: 'Buzo Hoodie Canguro',
                      sub: 'Con Capucha',
                      iconBg: 'bg-purple-50',
                      iconColor: 'text-purple-600',
                    },
                    {
                      id: 'textil-pulover',
                      label: 'Sweater Cuello en V',
                      sub: 'Deportivo',
                      iconBg: 'bg-emerald-50',
                      iconColor: 'text-emerald-600',
                    },
                  ].map((m) => {
                    const isCurrent = configuration.productId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setProduct(m.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                          isCurrent
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-400'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg ${m.iconBg} ${m.iconColor} flex items-center justify-center mb-1.5 shadow-2xs`}
                        >
                          <Shirt className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2">
                          {m.label}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5">{m.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
