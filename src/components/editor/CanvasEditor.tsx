import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Transformer,
  Group,
  Circle,
  Ellipse,
  Path,
} from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useSelectionStore } from '../../stores/useSelectionStore';
import { useProductStore } from '../../stores/useProductStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateScaleFactor,
  cmToPx,
  pxToCm,
} from '../../utils/scaleConverter';
import type { CanvasElement, ImageCanvasElement, TextCanvasElement, GarmentSide } from '../../types';
import { getProductById } from '../../products/productDefinitions';
import {
  getTShirtPath,
  getHoodiePath,
  getSweaterPath,
  getKangarooPocketPath,
} from '../../utils/garmentShapes';
import { getShapeSvgPath } from '../../utils/productShapes';
import { processImageFile } from '../../utils/imageUploader';
import { Shirt, UploadCloud } from 'lucide-react';

interface CanvasEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

// Custom hook to load HTMLImageElement for Konva Image
const useKonvaImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => setImage(img);
  }, [src]);
  return image;
};

// Render single Konva Image
const RenderableImage: React.FC<{
  element: ImageCanvasElement;
  scaleFactor: number;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}> = ({ element, scaleFactor, onSelect, onChange }) => {
  const image = useKonvaImage(element.src);
  const shapeRef = useRef<Konva.Image>(null);

  const xPx = cmToPx(element.x, scaleFactor);
  const yPx = cmToPx(element.y, scaleFactor);
  const wPx = cmToPx(element.width, scaleFactor);
  const hPx = cmToPx(element.height, scaleFactor);

  return (
    <KonvaImage
      id={element.id}
      name="canvas-element"
      ref={shapeRef}
      image={image || undefined}
      x={xPx}
      y={yPx}
      width={wPx}
      height={hPx}
      rotation={element.rotation}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: Number(pxToCm(e.target.x(), scaleFactor).toFixed(2)),
          y: Number(pxToCm(e.target.y(), scaleFactor).toFixed(2)),
        });
      }}
      onTransformEnd={() => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
          x: Number(pxToCm(node.x(), scaleFactor).toFixed(2)),
          y: Number(pxToCm(node.y(), scaleFactor).toFixed(2)),
          width: Math.max(
            1,
            Number(pxToCm(node.width() * scaleX, scaleFactor).toFixed(2))
          ),
          height: Math.max(
            1,
            Number(pxToCm(node.height() * scaleY, scaleFactor).toFixed(2))
          ),
          rotation: Math.round(node.rotation()),
        });
      }}
    />
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ stageRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const { configuration, setActiveSide } = useProductStore();
  const currentProduct = getProductById(configuration.productId);
  const {
    elements,
    previewMode,
    updateElement,
    deleteElement,
    duplicateElement,
    copySelected,
    pasteCopied,
  } = useCanvasStore();

  const { selectedId, selectElement, clearSelection } = useSelectionStore();
  const { undo, redo, pushState } = useHistoryStore();

  // Container dimensions
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const scaleCalc = calculateScaleFactor(
    configuration.widthCm,
    configuration.heightCm,
    containerSize.width * 0.82,
    containerSize.height * 0.82
  );

  const scaleFactor = scaleCalc.scaleFactor;
  const canvasWidthPx = scaleCalc.canvasWidthPx;
  const canvasHeightPx = scaleCalc.canvasHeightPx;

  // Synchronize Konva Transformer selection
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    if (selectedId && !previewMode) {
      const selectedNode = stageRef.current.findOne('#' + selectedId);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId, elements, previewMode, stageRef]);

  // Keyboard Shortcuts Handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT';

      if (isInput) return;

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          pushState(elements);
          deleteElement(selectedId);
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedId) {
          pushState(elements);
          duplicateElement(selectedId);
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copySelected();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pushState(elements);
        pasteCopied();
      } else if (selectedId && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        const target = elements.find((el) => el.id === selectedId);
        if (!target) return;

        let newX = target.x;
        let newY = target.y;
        if (e.key === 'ArrowLeft') newX -= step;
        if (e.key === 'ArrowRight') newX += step;
        if (e.key === 'ArrowUp') newY -= step;
        if (e.key === 'ArrowDown') newY += step;

        updateElement(selectedId, { x: newX, y: newY });
      }
    },
    [
      selectedId,
      elements,
      deleteElement,
      duplicateElement,
      copySelected,
      pasteCopied,
      undo,
      redo,
      pushState,
      updateElement,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'product-bg') {
      clearSelection();
    }
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processImageFile(file);
    }
  };

  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  // Filter elements by active side for Textiles
  const currentActiveSide = configuration.activeSide || 'frente';
  const filteredElements = sortedElements.filter((el) => {
    if (currentProduct.category !== 'textil') return true;
    if (currentActiveSide === 'ambos') return true;
    const elSide = el.side || 'frente';
    return elSide === currentActiveSide || elSide === 'ambos';
  });

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-4 z-50 bg-blue-900/70 backdrop-blur-sm border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center text-white space-y-3 pointer-events-none animate-pulse">
          <div className="p-4 bg-blue-600 rounded-full shadow-lg">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <span className="text-base font-bold tracking-wide">
            ¡Soltá tu imagen aquí para estampar en {currentActiveSide.toUpperCase()}!
          </span>
          <span className="text-xs text-blue-200">
            Se aplicará directamente sobre la superficie del objeto (2D & 3D)
          </span>
        </div>
      )}

      {/* Textile Garment Side Switcher Header */}
      {currentProduct.category === 'textil' && (
        <div className="absolute top-4 z-20 flex items-center space-x-2 bg-white/90 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-full shadow-md">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mr-1">
            <Shirt className="w-4 h-4 text-blue-600" />
            <span>Cara de Edición:</span>
          </div>

          {(['frente', 'espalda', 'ambos'] as GarmentSide[]).map((side) => (
            <button
              key={side}
              onClick={() => setActiveSide(side)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                currentActiveSide === side
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {side === 'frente' && 'Frente (Pecho)'}
              {side === 'espalda' && 'Espalda (Dorsal)'}
              {side === 'ambos' && 'Ambos Lados'}
            </button>
          ))}
        </div>
      )}

      {/* Main Konva Canvas Stage Container */}
      <div className="relative flex flex-col items-center">
        <div className="shadow-lg rounded border border-gray-300 bg-white relative transition-all duration-200">
          <Stage
            ref={stageRef}
            width={canvasWidthPx}
            height={canvasHeightPx}
            onMouseDown={handleStageClick}
            onTouchStart={handleStageClick}
          >
            {/* Layer 1: Product Physical Background & Shape */}
            <Layer>
              {currentProduct.category === 'textil' ? (
                /* Textile Garment Vector Silhouette */
                <Group name="product-bg">
                  <Path
                    data={
                      configuration.productId === 'textil-hoodie'
                        ? getHoodiePath(canvasWidthPx, canvasHeightPx, currentActiveSide === 'espalda')
                        : configuration.productId === 'textil-pulover'
                        ? getSweaterPath(canvasWidthPx, canvasHeightPx, currentActiveSide === 'espalda')
                        : getTShirtPath(canvasWidthPx, canvasHeightPx, currentActiveSide === 'espalda')
                    }
                    fill={configuration.garmentColor || '#F8FAFC'}
                    stroke="#64748B"
                    strokeWidth={2}
                    shadowColor="#000000"
                    shadowBlur={12}
                    shadowOpacity={0.12}
                  />

                  {/* Hoodie Kangaroo Pocket Outline */}
                  {configuration.productId === 'textil-hoodie' && currentActiveSide !== 'espalda' && (
                    <Path
                      data={getKangarooPocketPath(canvasWidthPx, canvasHeightPx)}
                      fill="transparent"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      dash={[4, 4]}
                    />
                  )}

                  {/* Print Safe Boundary Line */}
                  <Rect
                    x={canvasWidthPx * 0.15}
                    y={canvasHeightPx * 0.18}
                    width={canvasWidthPx * 0.7}
                    height={canvasHeightPx * 0.72}
                    stroke="#38BDF8"
                    strokeWidth={1.5}
                    dash={[5, 4]}
                    listening={false}
                  />
                </Group>
              ) : configuration.shape === 'circular' ? (
                /* Circular Plaque */
                <Circle
                  name="product-bg"
                  x={canvasWidthPx / 2}
                  y={canvasHeightPx / 2}
                  radius={Math.min(canvasWidthPx, canvasHeightPx) / 2}
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth={2}
                  shadowColor="#000000"
                  shadowBlur={16}
                  shadowOpacity={0.1}
                />
              ) : configuration.shape === 'ovalado' ? (
                /* Oval Shape Plaque */
                <Ellipse
                  name="product-bg"
                  x={canvasWidthPx / 2}
                  y={canvasHeightPx / 2}
                  radiusX={canvasWidthPx / 2}
                  radiusY={canvasHeightPx / 2}
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth={2}
                  shadowColor="#000000"
                  shadowBlur={16}
                  shadowOpacity={0.1}
                />
              ) : configuration.shape === 'escudo' ? (
                /* Shield Shape Plaque */
                <Path
                  name="product-bg"
                  data={getShapeSvgPath('escudo', canvasWidthPx, canvasHeightPx)}
                  fill="#FFFFFF"
                  stroke="#0284C7"
                  strokeWidth={2}
                  shadowColor="#000000"
                  shadowBlur={16}
                  shadowOpacity={0.1}
                />
              ) : (
                /* Standard Rectangular or Troquelado Plaque */
                <Rect
                  name="product-bg"
                  x={0}
                  y={0}
                  width={canvasWidthPx}
                  height={canvasHeightPx}
                  fill="#FFFFFF"
                  stroke={configuration.shape === 'troquelado' ? '#0284C7' : '#94A3B8'}
                  strokeWidth={2}
                  dash={configuration.shape === 'troquelado' ? [6, 4] : undefined}
                  cornerRadius={configuration.shape === 'troquelado' ? 24 : 4}
                  shadowColor="#000000"
                  shadowBlur={16}
                  shadowOpacity={0.1}
                />
              )}
            </Layer>

            {/* Layer 2: Canvas Elements */}
            <Layer>
              {filteredElements.map((el) => {
                if (el.type === 'text') {
                  const textEl = el as TextCanvasElement;
                  const xPx = cmToPx(textEl.x, scaleFactor);
                  const yPx = cmToPx(textEl.y, scaleFactor);
                  const fontSizePx = Math.round(textEl.fontSize * scaleFactor * 0.25);

                  return (
                    <Text
                      key={textEl.id}
                      id={textEl.id}
                      name="canvas-element"
                      x={xPx}
                      y={yPx}
                      text={textEl.text}
                      fontSize={fontSizePx}
                      fontFamily={textEl.fontFamily || 'Inter'}
                      fill={textEl.fill || '#0F172A'}
                      align={textEl.align || 'left'}
                      fontStyle={`${textEl.bold ? 'bold' : ''} ${
                        textEl.italic ? 'italic' : ''
                      }`.trim()}
                      rotation={textEl.rotation || 0}
                      draggable={!textEl.locked}
                      onClick={() => selectElement(textEl.id)}
                      onTap={() => selectElement(textEl.id)}
                      onDragEnd={(e) => {
                        updateElement(textEl.id, {
                          x: Number(pxToCm(e.target.x(), scaleFactor).toFixed(2)),
                          y: Number(pxToCm(e.target.y(), scaleFactor).toFixed(2)),
                        });
                      }}
                    />
                  );
                } else if (el.type === 'image') {
                  const imgEl = el as ImageCanvasElement;
                  return (
                    <RenderableImage
                      key={imgEl.id}
                      element={imgEl}
                      scaleFactor={scaleFactor}
                      onSelect={() => selectElement(imgEl.id)}
                      onChange={(newAttrs) => updateElement(imgEl.id, newAttrs)}
                    />
                  );
                }
                return null;
              })}

              {/* Konva Transformer for active selection */}
              {!previewMode && (
                <Transformer
                  ref={transformerRef}
                  keepRatio={true}
                  enabledAnchors={[
                    'top-left',
                    'top-right',
                    'bottom-left',
                    'bottom-right',
                  ]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>

        {/* Empty Canvas Overlay Guidance */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6 text-center">
            <div className="bg-slate-900/80 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md backdrop-blur-md">
              Diseñá tu producto agregando texto o cargando tu logo
            </div>
          </div>
        )}

        {/* Canvas Dimension Specs Pill below canvas */}
        <div className="mt-3 text-[11px] font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-2xs flex items-center space-x-2">
          <span>
            {configuration.widthCm} cm × {configuration.heightCm} cm
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-bold uppercase">
            {currentProduct.category === 'textil'
              ? `Vista ${currentActiveSide.toUpperCase()}`
              : 'Escala 1:1'}
          </span>
        </div>
      </div>
    </div>
  );
};
