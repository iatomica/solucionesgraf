import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Transformer,
  Circle,
  Ellipse,
  Path,
  Line,
  Group,
  Star,
  RegularPolygon,
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
import type {
  CanvasElement,
  ImageCanvasElement,
  TextCanvasElement,
  ShapeCanvasElement,
  GarmentSide,
} from '../../types';
import { getProductById } from '../../products/productDefinitions';
import { getShapeSvgPath } from '../../utils/productShapes';
import { processImageFile } from '../../utils/imageUploader';
import { Shirt, UploadCloud, AlignCenter, AlignVerticalSpaceAround, Crosshair } from 'lucide-react';
import { RealisticGarmentMockup } from './RealisticGarmentMockup';

interface CanvasEditorProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  viewMode?: '2d' | '3d';
  onToggleViewMode?: () => void;
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

// Fill generator for shape layers
const getLayerShapeFillProps = (shapeEl: ShapeCanvasElement, wPx: number, hPx: number) => {
  const primary = shapeEl.fill || '#2563EB';
  const secondary = shapeEl.fillSecondary || '#FFFFFF';
  const pattern = shapeEl.colorPattern || 'solido';

  switch (pattern) {
    case 'horizontal':
      return {
        fillPriority: 'linear-gradient' as const,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: hPx },
        fillLinearGradientColorStops: [0, primary, 0.5, primary, 0.5, secondary, 1, secondary],
      };
    case 'vertical':
      return {
        fillPriority: 'linear-gradient' as const,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: wPx, y: 0 },
        fillLinearGradientColorStops: [0, primary, 0.5, primary, 0.5, secondary, 1, secondary],
      };
    case 'diagonal':
      return {
        fillPriority: 'linear-gradient' as const,
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: wPx, y: hPx },
        fillLinearGradientColorStops: [0, primary, 0.5, primary, 0.5, secondary, 1, secondary],
      };
    case 'radial':
      return {
        fillPriority: 'radial-gradient' as const,
        fillRadialGradientStartPoint: { x: wPx / 2, y: hPx / 2 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: wPx / 2, y: hPx / 2 },
        fillRadialGradientEndRadius: Math.max(wPx, hPx) / 2,
        fillRadialGradientColorStops: [0, secondary, 1, primary],
      };
    case 'solido':
    default:
      return {
        fillPriority: 'color' as const,
        fill: primary,
      };
  }
};

// Render single shape layer (Rect, Circle, Ellipse, Escudo, Star, Triangle, Badge)
const RenderableShape: React.FC<{
  element: ShapeCanvasElement;
  scaleFactor: number;
  onSelect: () => void;
  onDragMove?: (e: any) => void;
  onDragEnd?: (e: any) => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}> = ({ element, scaleFactor, onSelect, onDragMove, onDragEnd, onChange }) => {
  const groupRef = useRef<any>(null);

  const xPx = cmToPx(element.x, scaleFactor);
  const yPx = cmToPx(element.y, scaleFactor);
  const wPx = Math.max(10, cmToPx(element.width, scaleFactor));
  const hPx = Math.max(10, cmToPx(element.height, scaleFactor));

  const fillProps = getLayerShapeFillProps(element, wPx, hPx);
  const strokeColor = element.stroke || undefined;
  const strokeW = element.strokeWidth !== undefined ? element.strokeWidth : 0;
  const opacityVal = element.opacity !== undefined ? element.opacity : 1;

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const newW = Math.max(2, element.width * scaleX);
    const newH = Math.max(2, element.height * scaleY);

    onChange({
      x: Number(pxToCm(node.x(), scaleFactor).toFixed(2)),
      y: Number(pxToCm(node.y(), scaleFactor).toFixed(2)),
      width: Number(newW.toFixed(2)),
      height: Number(newH.toFixed(2)),
      rotation: Math.round(node.rotation()),
    });
  };

  const innerProps = {
    listening: true,
    opacity: opacityVal,
    stroke: strokeColor,
    strokeWidth: strokeW,
    ...fillProps,
  };

  const renderShapeGeometry = () => {
    switch (element.shapeType) {
      case 'circle':
        return (
          <Circle
            x={wPx / 2}
            y={hPx / 2}
            radius={Math.min(wPx, hPx) / 2}
            {...innerProps}
          />
        );
      case 'ellipse':
        return (
          <Ellipse
            x={wPx / 2}
            y={hPx / 2}
            radiusX={wPx / 2}
            radiusY={hPx / 2}
            {...innerProps}
          />
        );
      case 'escudo':
        return (
          <Path
            x={0}
            y={0}
            data={getShapeSvgPath('escudo', wPx, hPx)}
            {...innerProps}
          />
        );
      case 'star':
        return (
          <Star
            x={wPx / 2}
            y={hPx / 2}
            numPoints={5}
            innerRadius={(Math.min(wPx, hPx) / 2) * 0.45}
            outerRadius={Math.min(wPx, hPx) / 2}
            {...innerProps}
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            x={wPx / 2}
            y={hPx / 2}
            sides={3}
            radius={Math.min(wPx, hPx) / 2}
            {...innerProps}
          />
        );
      case 'badge':
        return (
          <Rect
            x={0}
            y={0}
            width={wPx}
            height={hPx}
            cornerRadius={Math.min(wPx, hPx) * 0.15}
            dash={[6, 4]}
            {...innerProps}
          />
        );
      case 'rect':
      default:
        return (
          <Rect
            x={0}
            y={0}
            width={wPx}
            height={hPx}
            cornerRadius={element.cornerRadius || 0}
            {...innerProps}
          />
        );
    }
  };

  return (
    <Group
      id={element.id}
      name="canvas-element"
      ref={groupRef}
      x={xPx}
      y={yPx}
      width={wPx}
      height={hPx}
      rotation={element.rotation || 0}
      draggable={!element.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={() => onSelect()}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = element.locked ? 'default' : 'move';
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'default';
      }}
      onDragMove={onDragMove}
      onDragEnd={(e) => {
        if (onDragEnd) {
          onDragEnd(e);
        } else {
          onChange({
            x: Number(pxToCm(e.target.x(), scaleFactor).toFixed(2)),
            y: Number(pxToCm(e.target.y(), scaleFactor).toFixed(2)),
          });
        }
      }}
      onTransformEnd={handleTransformEnd}
    >
      {/* Invisible hit testing bounding box so the shape can be clicked and dragged anywhere */}
      <Rect
        x={0}
        y={0}
        width={wPx}
        height={hPx}
        fill="rgba(0,0,0,0.0001)"
        listening={true}
      />
      {renderShapeGeometry()}
    </Group>
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  stageRef,
  onToggleViewMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const { configuration, setActiveSide, setGarmentColor } = useProductStore();
  const currentProduct = getProductById(configuration.productId);
  const isTextil = currentProduct.category === 'textil';
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

  // Zoom control state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

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

  const scaleCalc = useMemo(
    () =>
      calculateScaleFactor(
        configuration.widthCm,
        configuration.heightCm,
        containerSize.width * 0.78 * zoomLevel,
        containerSize.height * 0.78 * zoomLevel
      ),
    [
      configuration.widthCm,
      configuration.heightCm,
      containerSize.width,
      containerSize.height,
      zoomLevel,
    ]
  );

  // Textile dimensions matching Pacdora mockup
  const textileMockupW = Math.round(520 * zoomLevel);
  const textileMockupH = Math.round(560 * zoomLevel);
  const textilePrintW = Math.round(textileMockupW * 0.284);
  const textilePrintH = Math.round(textileMockupH * 0.398);
  const textileScaleFactor = textilePrintW / (configuration.widthCm || 35);

  const scaleFactor = isTextil ? textileScaleFactor : scaleCalc.scaleFactor;
  const canvasWidthPx = isTextil ? textilePrintW : scaleCalc.canvasWidthPx;
  const canvasHeightPx = isTextil ? textilePrintH : scaleCalc.canvasHeightPx;

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

  const currentActiveSide = configuration.activeSide || 'frente';

  const sortedElements = useMemo<CanvasElement[]>(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  // Filter elements by active side for Textiles
  const filteredElements = useMemo<CanvasElement[]>(() => {
    if (currentProduct.category !== 'textil') return sortedElements;
    if (currentActiveSide === 'ambos') return sortedElements;
    return sortedElements.filter((el: CanvasElement) => {
      const elSide = el.side || 'frente';
      return elSide === currentActiveSide || elSide === 'ambos';
    });
  }, [sortedElements, currentProduct.category, currentActiveSide]);

  // Cartel Background properties calculation
  const cartelBg = configuration.cartelBg || {
    pattern: 'solido',
    primaryColor: '#FFFFFF',
    secondaryColor: '#0F172A',
  };
  const primaryColor = cartelBg.primaryColor || '#FFFFFF';
  const secondaryColor = cartelBg.secondaryColor || '#0F172A';
  const bgPattern = cartelBg.pattern || 'solido';

  const cartelBgFill = useMemo(() => {
    switch (bgPattern) {
      case 'horizontal':
        return {
          fillPriority: 'linear-gradient' as const,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: 0, y: canvasHeightPx },
          fillLinearGradientColorStops: [
            0, primaryColor,
            0.5, primaryColor,
            0.5, secondaryColor,
            1, secondaryColor,
          ],
        };
      case 'vertical':
        return {
          fillPriority: 'linear-gradient' as const,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: canvasWidthPx, y: 0 },
          fillLinearGradientColorStops: [
            0, primaryColor,
            0.5, primaryColor,
            0.5, secondaryColor,
            1, secondaryColor,
          ],
        };
      case 'diagonal':
        return {
          fillPriority: 'linear-gradient' as const,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: canvasWidthPx, y: canvasHeightPx },
          fillLinearGradientColorStops: [
            0, primaryColor,
            0.5, primaryColor,
            0.5, secondaryColor,
            1, secondaryColor,
          ],
        };
      case 'circular':
        return {
          fillPriority: 'radial-gradient' as const,
          fillRadialGradientStartPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientEndRadius: Math.min(canvasWidthPx, canvasHeightPx) * 0.4,
          fillRadialGradientColorStops: [
            0, secondaryColor,
            0.8, secondaryColor,
            0.81, primaryColor,
            1, primaryColor,
          ],
        };
      case 'marco':
        return {
          fillPriority: 'radial-gradient' as const,
          fillRadialGradientStartPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientEndRadius: Math.max(canvasWidthPx, canvasHeightPx) * 0.55,
          fillRadialGradientColorStops: [
            0, primaryColor,
            0.7, primaryColor,
            0.71, secondaryColor,
            1, secondaryColor,
          ],
        };
      case 'degradado-lineal':
        return {
          fillPriority: 'linear-gradient' as const,
          fillLinearGradientStartPoint: { x: 0, y: 0 },
          fillLinearGradientEndPoint: { x: canvasWidthPx, y: canvasHeightPx },
          fillLinearGradientColorStops: [0, primaryColor, 1, secondaryColor],
        };
      case 'degradado-radial':
        return {
          fillPriority: 'radial-gradient' as const,
          fillRadialGradientStartPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndPoint: { x: canvasWidthPx / 2, y: canvasHeightPx / 2 },
          fillRadialGradientEndRadius: Math.max(canvasWidthPx, canvasHeightPx) / 2,
          fillRadialGradientColorStops: [0, primaryColor, 1, secondaryColor],
        };
      case 'solido':
      default:
        return {
          fillPriority: 'color' as const,
          fill: primaryColor,
        };
    }
  }, [bgPattern, primaryColor, secondaryColor, canvasWidthPx, canvasHeightPx]);

  // Alignment Guides state for Text and Elements
  const [activeSnapGuides, setActiveSnapGuides] = useState<{
    verticalCenter: boolean;
    horizontalCenter: boolean;
  }>({
    verticalCenter: false,
    horizontalCenter: false,
  });

  const [showAlignmentGuides, setShowAlignmentGuides] = useState(true);

  // Drag handlers with magnetic snapping
  const handleElementDragMove = (e: any) => {
    const node = e.target;
    const x = node.x();
    const y = node.y();
    const nodeW = (node.width() || 100) * (node.scaleX() || 1);
    const nodeH = (node.height() || 40) * (node.scaleY() || 1);

    const centerX = canvasWidthPx / 2;
    const centerY = canvasHeightPx / 2;

    const elCenterX = x + nodeW / 2;
    const elCenterY = y + nodeH / 2;

    const snapDistance = 7;
    let snapX = false;
    let snapY = false;

    // Magnet snap to center X
    if (Math.abs(elCenterX - centerX) < snapDistance) {
      node.x(centerX - nodeW / 2);
      snapX = true;
    } else if (Math.abs(x - centerX) < snapDistance) {
      node.x(centerX);
      snapX = true;
    }

    // Magnet snap to center Y
    if (Math.abs(elCenterY - centerY) < snapDistance) {
      node.y(centerY - nodeH / 2);
      snapY = true;
    } else if (Math.abs(y - centerY) < snapDistance) {
      node.y(centerY);
      snapY = true;
    }

    // Crucial performance optimization: only dispatch React state update when snap status changes!
    setActiveSnapGuides((prev) => {
      if (prev.verticalCenter === snapX && prev.horizontalCenter === snapY) {
        return prev;
      }
      return {
        verticalCenter: snapX,
        horizontalCenter: snapY,
      };
    });
  };

  const handleElementDragEnd = (e: any, elementId: string) => {
    setActiveSnapGuides({
      verticalCenter: false,
      horizontalCenter: false,
    });
    updateElement(elementId, {
      x: Number(pxToCm(e.target.x(), scaleFactor).toFixed(2)),
      y: Number(pxToCm(e.target.y(), scaleFactor).toFixed(2)),
    });
  };

  // Center selected element horizontally to page/shape
  const handleCenterHorizontal = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find((el) => el.id === selectedId);
    if (!target) return;
    pushState(elements);
    const targetW = target.width || 20;
    const newX = Number(((configuration.widthCm - targetW) / 2).toFixed(2));
    updateElement(selectedId, { x: Math.max(0, newX) });
    setActiveSnapGuides((g) => ({ ...g, verticalCenter: true }));
    setTimeout(() => setActiveSnapGuides((g) => ({ ...g, verticalCenter: false })), 1200);
  }, [selectedId, elements, configuration.widthCm, pushState, updateElement]);

  // Center selected element vertically to page/shape
  const handleCenterVertical = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find((el) => el.id === selectedId);
    if (!target) return;
    pushState(elements);
    const targetH = target.height || 10;
    const newY = Number(((configuration.heightCm - targetH) / 2).toFixed(2));
    updateElement(selectedId, { y: Math.max(0, newY) });
    setActiveSnapGuides((g) => ({ ...g, horizontalCenter: true }));
    setTimeout(() => setActiveSnapGuides((g) => ({ ...g, horizontalCenter: false })), 1200);
  }, [selectedId, elements, configuration.heightCm, pushState, updateElement]);

  // Render Smart Alignment Guides on Stage
  const renderAlignmentGuides = () => {
    const isVisible =
      showAlignmentGuides &&
      (selectedId !== null ||
        activeSnapGuides.verticalCenter ||
        activeSnapGuides.horizontalCenter);
    if (!isVisible) return null;

    const centerX = canvasWidthPx / 2;
    const centerY = canvasHeightPx / 2;
    const margin = 10;
    const shapeW = canvasWidthPx - margin * 2;
    const shapeH = canvasHeightPx - margin * 2;

    return (
      <Group name="alignment-guides-layer" listening={false}>
        {/* Vertical Center Guide Line (Eje Central X de la Pagina y Forma) */}
        <Line
          points={[centerX, 0, centerX, canvasHeightPx]}
          stroke={activeSnapGuides.verticalCenter ? '#2563EB' : '#60A5FA'}
          strokeWidth={activeSnapGuides.verticalCenter ? 2 : 1}
          dash={activeSnapGuides.verticalCenter ? undefined : [6, 4]}
          opacity={activeSnapGuides.verticalCenter ? 1 : 0.65}
        />

        {/* Horizontal Center Guide Line (Eje Central Y de la Pagina y Forma) */}
        <Line
          points={[0, centerY, canvasWidthPx, centerY]}
          stroke={activeSnapGuides.horizontalCenter ? '#2563EB' : '#60A5FA'}
          strokeWidth={activeSnapGuides.horizontalCenter ? 2 : 1}
          dash={activeSnapGuides.horizontalCenter ? undefined : [6, 4]}
          opacity={activeSnapGuides.horizontalCenter ? 1 : 0.65}
        />

        {/* Center Point Indicator */}
        <Circle
          x={centerX}
          y={centerY}
          radius={3.5}
          fill="#2563EB"
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />

        {/* Shape-specific Alignment Contours */}
        {!isTextil && configuration.shape === 'circular' && (
          <Circle
            x={centerX}
            y={centerY}
            radius={(Math.min(shapeW, shapeH) / 2) * 0.85}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.5}
          />
        )}

        {!isTextil && configuration.shape === 'ovalado' && (
          <Ellipse
            x={centerX}
            y={centerY}
            radiusX={(shapeW / 2) * 0.85}
            radiusY={(shapeH / 2) * 0.85}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.5}
          />
        )}

        {!isTextil && configuration.shape === 'escudo' && (
          <Path
            data={getShapeSvgPath('escudo', shapeW * 0.85, shapeH * 0.85)}
            x={margin + shapeW * 0.075}
            y={margin + shapeH * 0.075}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.5}
          />
        )}

        {!isTextil && configuration.shape === 'troquelado' && (
          <Rect
            x={margin + shapeW * 0.06}
            y={margin + shapeH * 0.06}
            width={shapeW * 0.88}
            height={shapeH * 0.88}
            cornerRadius={18}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.5}
          />
        )}

        {!isTextil && (!configuration.shape || configuration.shape === 'rectangular') && (
          <Rect
            x={margin + shapeW * 0.05}
            y={margin + shapeH * 0.05}
            width={shapeW * 0.9}
            height={shapeH * 0.9}
            cornerRadius={4}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.5}
          />
        )}

        {/* Textile Printable Safe Area Contour */}
        {isTextil && (
          <Rect
            x={12}
            y={12}
            width={canvasWidthPx - 24}
            height={canvasHeightPx - 24}
            cornerRadius={8}
            stroke="#3B82F6"
            strokeWidth={1.2}
            dash={[5, 4]}
            opacity={0.45}
          />
        )}
      </Group>
    );
  };

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

      {/* Floating Alignment Controls when an element is active */}
      {selectedId && (
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-full shadow-md text-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-1 text-slate-500 mr-1 text-[11px] font-semibold">
            <Crosshair className="w-3.5 h-3.5 text-blue-600" />
            <span>Alinear a la Forma:</span>
          </div>
          <button
            onClick={handleCenterHorizontal}
            className="flex items-center space-x-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 active:bg-blue-50 rounded-full font-medium transition-all cursor-pointer"
            title="Centrar horizontalmente respecto a la forma"
          >
            <AlignCenter className="w-3.5 h-3.5" />
            <span>Centro H</span>
          </button>
          <button
            onClick={handleCenterVertical}
            className="flex items-center space-x-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 active:bg-blue-50 rounded-full font-medium transition-all cursor-pointer"
            title="Centrar verticalmente respecto a la forma"
          >
            <AlignVerticalSpaceAround className="w-3.5 h-3.5" />
            <span>Centro V</span>
          </button>
          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
          <button
            onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
            className={`px-2 py-0.5 text-[10px] rounded-full font-bold transition-all cursor-pointer ${
              showAlignmentGuides
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Mostrar / Ocultar líneas de alineación a la forma"
          >
            Guías {showAlignmentGuides ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Textile Garment Side Switcher Header */}
      {currentProduct.category === 'textil' && (
        <div className="absolute top-4 z-20 flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-slate-200/90 px-3 py-1.5 rounded-full shadow-md">
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

      {/* Main Visual Canvas Area */}
      <div className="relative flex flex-col items-center">
        {isTextil ? (
          /* --- PACDORA TEXTILE REALISTIC PREVIEW CANVAS --- */
          <div className="relative w-[640px] max-w-[90vw] aspect-[4/3] rounded-[28px] border border-gray-300 shadow-xl overflow-hidden bg-white flex items-center justify-center">
            {/* Background Checkerboard Transparency Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:14px_14px] bg-[position:0_0,0_7px,7px_-7px,-7px_0px] pointer-events-none" />

            {/* Top-Left 3D Button matching exact Pacdora icon */}
            <button
              onClick={onToggleViewMode}
              title="Ver en 3D interactivo 360°"
              className="absolute top-3.5 left-3.5 z-30 flex flex-col items-center justify-center bg-white/95 hover:bg-white text-slate-800 shadow-xs border border-gray-200/80 rounded-xl px-2 py-1 transition-all cursor-pointer group"
            >
              <span className="text-[11px] font-black leading-none tracking-tight">3D</span>
              <svg className="w-5 h-2.5 text-slate-700 group-hover:text-black mt-0.5" viewBox="0 0 24 12" fill="none">
                <path d="M2 7 C2 12 22 12 22 7 C22 3 13 3 7 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 3 L8 5.5 L4.5 8" fill="currentColor" />
              </svg>
            </button>

            {/* Bottom-Left Floating Zoom & Color Bar matching Pacdora */}
            <div className="absolute bottom-3.5 left-3.5 z-30 flex items-center space-x-2 bg-white/95 backdrop-blur-md border border-gray-200 shadow-md px-2.5 py-1 rounded-2xl text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-base transition-all cursor-pointer"
                title="Acercar zoom"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold text-base transition-all cursor-pointer"
                title="Alejar zoom"
              >
                −
              </button>

              <div className="h-3.5 w-px bg-gray-200" />

              {/* Garment Color Swatch with Ring */}
              <div
                className="w-5 h-5 rounded-full border border-gray-300 ring-2 ring-purple-400 ring-offset-1 shadow-2xs"
                style={{ backgroundColor: configuration.garmentColor || '#F3E8FF' }}
                title={`Color actual: ${configuration.garmentColor || '#F3E8FF'}`}
              />

              {/* Rainbow Conic-Gradient Color Picker Trigger */}
              <label
                className="w-5 h-5 rounded-full p-[2px] cursor-pointer hover:scale-110 transition-transform relative block shadow-2xs"
                style={{
                  background: 'conic-gradient(from 0deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)',
                }}
                title="Elegir cualquier color personalizado para la prenda"
              >
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-black text-slate-700 leading-none">
                  +
                </div>
                <input
                  type="color"
                  value={configuration.garmentColor || '#F3E8FF'}
                  onChange={(e) => setGarmentColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Realistic 3D Garment Mockup with Children Stage */}
            <RealisticGarmentMockup
              productId={configuration.productId}
              garmentColor={configuration.garmentColor || '#F3E8FF'}
              activeSide={currentActiveSide}
              hasElements={filteredElements.length > 0}
              onUploadClick={() => document.getElementById('canvas-textil-file-input')?.click()}
              width={textileMockupW}
              height={textileMockupH}
            >
              <Stage
                ref={stageRef}
                width={canvasWidthPx}
                height={canvasHeightPx}
                onMouseDown={handleStageClick}
                onTouchStart={handleStageClick}
              >
                {/* Konva Stage for Elements */}
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
                          onDragMove={handleElementDragMove}
                          onDragEnd={(e) => handleElementDragEnd(e, textEl.id)}
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
                    } else if (el.type === 'shape') {
                      const shapeEl = el as ShapeCanvasElement;
                      return (
                        <RenderableShape
                          key={shapeEl.id}
                          element={shapeEl}
                          scaleFactor={scaleFactor}
                          onSelect={() => selectElement(shapeEl.id)}
                          onDragMove={handleElementDragMove}
                          onDragEnd={(e) => handleElementDragEnd(e, shapeEl.id)}
                          onChange={(newAttrs) => updateElement(shapeEl.id, newAttrs)}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Alignment guides to shape and canvas */}
                  {renderAlignmentGuides()}

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
            </RealisticGarmentMockup>

            {/* Hidden File Input for Direct Upload */}
            <input
              id="canvas-textil-file-input"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>
        ) : (
          /* --- STANDARD SIGNAGE / CARTELERIA CANVAS --- */
          <div className="relative transition-all duration-200 flex items-center justify-center p-2">
            <Stage
              ref={stageRef}
              width={canvasWidthPx}
              height={canvasHeightPx}
              onMouseDown={handleStageClick}
              onTouchStart={handleStageClick}
            >
              {/* Layer 1: Product Physical Background & Shape Edge */}
              <Layer>
                {(() => {
                  const shapeMargin = 10;
                  const shapeW = canvasWidthPx - shapeMargin * 2;
                  const shapeH = canvasHeightPx - shapeMargin * 2;

                  if (configuration.shape === 'circular') {
                    return (
                      <Circle
                        name="product-bg"
                        x={canvasWidthPx / 2}
                        y={canvasHeightPx / 2}
                        radius={Math.min(shapeW, shapeH) / 2}
                        {...cartelBgFill}
                        stroke="#CBD5E1"
                        strokeWidth={2}
                        shadowColor="rgba(15, 23, 42, 0.22)"
                        shadowBlur={18}
                        shadowOffset={{ x: 0, y: 8 }}
                      />
                    );
                  } else if (configuration.shape === 'ovalado') {
                    return (
                      <Ellipse
                        name="product-bg"
                        x={canvasWidthPx / 2}
                        y={canvasHeightPx / 2}
                        radiusX={shapeW / 2}
                        radiusY={shapeH / 2}
                        {...cartelBgFill}
                        stroke="#CBD5E1"
                        strokeWidth={2}
                        shadowColor="rgba(15, 23, 42, 0.22)"
                        shadowBlur={18}
                        shadowOffset={{ x: 0, y: 8 }}
                      />
                    );
                  } else if (configuration.shape === 'escudo') {
                    return (
                      <Path
                        name="product-bg"
                        x={shapeMargin}
                        y={shapeMargin}
                        data={getShapeSvgPath('escudo', shapeW, shapeH)}
                        {...cartelBgFill}
                        stroke="#CBD5E1"
                        strokeWidth={2}
                        shadowColor="rgba(15, 23, 42, 0.22)"
                        shadowBlur={18}
                        shadowOffset={{ x: 0, y: 8 }}
                      />
                    );
                  } else {
                    return (
                      <Rect
                        name="product-bg"
                        x={shapeMargin}
                        y={shapeMargin}
                        width={shapeW}
                        height={shapeH}
                        {...cartelBgFill}
                        stroke={configuration.shape === 'troquelado' ? '#0284C7' : '#94A3B8'}
                        strokeWidth={2}
                        dash={configuration.shape === 'troquelado' ? [6, 4] : undefined}
                        cornerRadius={configuration.shape === 'troquelado' ? 24 : 6}
                        shadowColor="rgba(15, 23, 42, 0.22)"
                        shadowBlur={18}
                        shadowOffset={{ x: 0, y: 8 }}
                      />
                    );
                  }
                })()}
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
                        onDragMove={handleElementDragMove}
                        onDragEnd={(e) => handleElementDragEnd(e, textEl.id)}
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
                  } else if (el.type === 'shape') {
                    const shapeEl = el as ShapeCanvasElement;
                    return (
                      <RenderableShape
                        key={shapeEl.id}
                        element={shapeEl}
                        scaleFactor={scaleFactor}
                        onSelect={() => selectElement(shapeEl.id)}
                        onDragMove={handleElementDragMove}
                        onDragEnd={(e) => handleElementDragEnd(e, shapeEl.id)}
                        onChange={(newAttrs) => updateElement(shapeEl.id, newAttrs)}
                      />
                    );
                  }
                  return null;
                })}

                {/* Alignment guides to shape and page/canvas */}
                {renderAlignmentGuides()}

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
        )}

        {/* Empty Canvas Overlay Guidance for non-textile */}
        {!isTextil && elements.length === 0 && (
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
            {isTextil
              ? `Vista ${currentActiveSide.toUpperCase()}`
              : 'Escala 1:1'}
          </span>
        </div>
      </div>
    </div>
  );
};
