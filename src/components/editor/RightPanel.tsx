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
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useSelectionStore } from '../../stores/useSelectionStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useProductStore } from '../../stores/useProductStore';
import type {
  ImageCanvasElement,
  LightEffectType,
  TextCanvasElement,
  GarmentSide,
} from '../../types';
import { getProductById } from '../../products/productDefinitions';
import { createWebProxyImage } from '../../utils/imageProxy';

const FONT_OPTIONS = ['Inter', 'Arial', 'Roboto', 'Impact', 'Georgia', 'Courier New'];

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
  const { configuration } = useProductStore();

  const [activeTab, setActiveTab] = useState<'tools' | 'layers'>('tools');
  const [newText, setNewText] = useState('NUEVO TEXTO');

  const selectedElement = elements.find((el) => el.id === selectedId);
  const productDef = getProductById(configuration.productId);

  // Add text element
  const handleAddText = () => {
    pushState(elements);
    const newEl: TextCanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: newText || 'TEXTO PERSONALIZADO',
      x: configuration.widthCm / 4,
      y: configuration.heightCm / 3,
      width: configuration.widthCm / 2,
      height: 10,
      fontSize: 48,
      fontFamily: 'Inter',
      fill: '#0F172A',
      align: 'center',
      bold: true,
      rotation: 0,
      side: configuration.activeSide || 'frente',
      zIndex: elements.length + 1,
    };
    addElement(newEl);
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
                          <span className="truncate">
                            {el.type === 'text'
                              ? `"${(el as TextCanvasElement).text}"`
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
                ) : (
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {selectedElement.type === 'text'
                    ? 'Propiedades de Texto'
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Color del Texto
                  </label>
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
                  onChange={(e) => {
                    pushState(elements);
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

            {/* Quick Add Text */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Agregar Texto
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Texto personalizado"
                  className="flex-1 text-xs font-medium text-slate-900 bg-slate-50 border border-gray-200 rounded-md px-2.5 py-2 focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleAddText}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Insertar Texto</span>
              </button>
            </div>

            {/* Image Upload Dropzone */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-slate-700">
                Subir Imagen / Logo
              </label>
              <label className="border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-blue-50/30">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Elegir archivo (PNG, JPG, SVG)
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Máximo 15MB
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
