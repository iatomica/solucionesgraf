import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  Upload,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Check,
  X,
  PenTool,
} from 'lucide-react';
import { useProductStore } from '../../stores/useProductStore';
import type { CanvasShape, StructureType } from '../../types';

export interface CartelDesignTemplate {
  id: string;
  title: string;
  category: 'pvc' | 'acrilico' | 'senaletica' | 'corporativo' | 'gastronomia';
  categoryLabel: string;
  productId: 'cartel-pvc' | 'cartel-acrilico';
  widthCm: number;
  heightCm: number;
  shape: CanvasShape;
  materialId: string;
  materialName: string;
  finishId: string;
  finishName: string;
  structureId: StructureType;
  description: string;
  imageUrl?: string; // Initially undefined - empty boxes as requested!
  dateAdded: string;
}

const INITIAL_DESIGNS: CartelDesignTemplate[] = [
  {
    id: 'des-1',
    title: 'Cartel Comercial Marquesina PVC Espumado',
    category: 'pvc',
    categoryLabel: 'Cartel PVC',
    productId: 'cartel-pvc',
    widthCm: 200,
    heightCm: 100,
    shape: 'rectangular',
    materialId: 'pvc-5mm',
    materialName: 'PVC Espumado 5 mm',
    finishId: 'laminado-mate',
    finishName: 'Laminado Protección Mate',
    structureId: 'bastidor-hierro',
    description: 'Cartel frontal para locales comerciales y fachadas de alto tránsito.',
    dateAdded: 'Septiembre 2026',
  },
  {
    id: 'des-2',
    title: 'Placa Profesional Acrílico Cristal con Distanciadores',
    category: 'acrilico',
    categoryLabel: 'Acrílico Cristal',
    productId: 'cartel-acrilico',
    widthCm: 60,
    heightCm: 40,
    shape: 'rectangular',
    materialId: 'acrilico-5mm',
    materialName: 'Acrílico Transparente 5 mm',
    finishId: 'distanciadores',
    finishName: 'Kit 4 Distanciadores Metálicos',
    structureId: 'ninguna',
    description: 'Elegancia y distinción para estudios jurídicos, médicos y empresas.',
    dateAdded: 'Septiembre 2026',
  },
  {
    id: 'des-3',
    title: 'Cartel Inmobiliario Resistente para Intemperie',
    category: 'pvc',
    categoryLabel: 'Cartel PVC',
    productId: 'cartel-pvc',
    widthCm: 120,
    heightCm: 80,
    shape: 'rectangular',
    materialId: 'pvc-3mm',
    materialName: 'PVC Espumado 3 mm',
    finishId: 'sin-terminacion',
    finishName: 'Sin terminación',
    structureId: 'ninguna',
    description: 'Cartel de venta o alquiler con tintas UV resistentes al sol y la lluvia.',
    dateAdded: 'Septiembre 2026',
  },
  {
    id: 'des-4',
    title: 'Cartel Señalética de Seguridad y Evacuación',
    category: 'senaletica',
    categoryLabel: 'Señalética',
    productId: 'cartel-pvc',
    widthCm: 40,
    heightCm: 25,
    shape: 'rectangular',
    materialId: 'pvc-3mm',
    materialName: 'PVC Espumado 3 mm',
    finishId: 'laminado-mate',
    finishName: 'Laminado Protección Mate',
    structureId: 'ninguna',
    description: 'Señalética reglamentaria industrial y comercial de salida o matafuegos.',
    dateAdded: 'Agosto 2026',
  },
  {
    id: 'des-5',
    title: 'Cartel Escudo / Badge Institucional Troquelado',
    category: 'pvc',
    categoryLabel: 'Cartel PVC',
    productId: 'cartel-pvc',
    widthCm: 90,
    heightCm: 90,
    shape: 'escudo',
    materialId: 'pvc-10mm',
    materialName: 'PVC Espumado 10 mm',
    finishId: 'corte-cnc',
    finishName: 'Corte de Contorno CNC Router',
    structureId: 'ninguna',
    description: 'Silueta recortada con fresadora CNC para marcas con logotipo heráldico.',
    dateAdded: 'Agosto 2026',
  },
  {
    id: 'des-6',
    title: 'Menú Board Gastronómico para Mostrador o Cafetería',
    category: 'gastronomia',
    categoryLabel: 'Pizarras & Menús',
    productId: 'cartel-pvc',
    widthCm: 150,
    heightCm: 70,
    shape: 'rectangular',
    materialId: 'pvc-5mm',
    materialName: 'PVC Espumado 5 mm',
    finishId: 'laminado-mate',
    finishName: 'Laminado Protección Mate',
    structureId: 'patas-aluminio',
    description: 'Panel horizontal para exhibición de precios, cafeterías y locales gastronómicos.',
    dateAdded: 'Julio 2026',
  },
  {
    id: 'des-7',
    title: 'Placa Institucional de Recepción con Fondo Blanco',
    category: 'acrilico',
    categoryLabel: 'Acrílico Cristal',
    productId: 'cartel-acrilico',
    widthCm: 100,
    heightCm: 60,
    shape: 'rectangular',
    materialId: 'acrilico-5mm',
    materialName: 'Acrílico Transparente 5 mm',
    finishId: 'distanciadores',
    finishName: 'Kit 4 Distanciadores Metálicos',
    structureId: 'ninguna',
    description: 'Montaje flotante sobre pared con impresión reversa UV de alta resolución.',
    dateAdded: 'Julio 2026',
  },
  {
    id: 'des-8',
    title: 'Cartel Circular Troquelado para Tienda Comercial',
    category: 'pvc',
    categoryLabel: 'Cartel PVC',
    productId: 'cartel-pvc',
    widthCm: 80,
    heightCm: 80,
    shape: 'circular',
    materialId: 'pvc-5mm',
    materialName: 'PVC Espumado 5 mm',
    finishId: 'corte-cnc',
    finishName: 'Corte de Contorno CNC Router',
    structureId: 'ninguna',
    description: 'Formato disco circular moderno para vidrieras o interiores de franquicias.',
    dateAdded: 'Junio 2026',
  },
];

interface WordPressMediaGalleryProps {
  onBack: () => void;
  onOpenBlankDesigner: () => void;
  onSelectDesignTemplate: (template: CartelDesignTemplate) => void;
}

export const WordPressMediaGallery: React.FC<WordPressMediaGalleryProps> = ({
  onBack,
  onOpenBlankDesigner,
  onSelectDesignTemplate,
}) => {
  const { setProduct, setDimensions, setMaterial, setFinish, setStructure, setShape } =
    useProductStore();

  const [designs, setDesigns] = useState<CartelDesignTemplate[]>(INITIAL_DESIGNS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDesign, setSelectedDesign] = useState<CartelDesignTemplate | null>(null);

  // File upload input ref for simulating adding real photos to the slots
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);

  // Handle loading design into the editor
  const handleApplyDesign = (design: CartelDesignTemplate) => {
    setProduct(design.productId);
    setDimensions(design.widthCm, design.heightCm);
    setMaterial(design.materialId);
    setFinish(design.finishId);
    setStructure(design.structureId);
    setShape(design.shape);
    onSelectDesignTemplate(design);
  };

  // Upload an image to a cartel slot or add new
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      if (uploadTargetId) {
        // Assign to existing cartel box
        setDesigns((prev) =>
          prev.map((d) => (d.id === uploadTargetId ? { ...d, imageUrl: resultUrl } : d))
        );
        if (selectedDesign && selectedDesign.id === uploadTargetId) {
          setSelectedDesign((prev) => (prev ? { ...prev, imageUrl: resultUrl } : null));
        }
        setUploadTargetId(null);
      } else {
        // Add new cartel design card with this photo
        const newDesign: CartelDesignTemplate = {
          id: `des-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: 'pvc',
          categoryLabel: 'Cartel PVC',
          productId: 'cartel-pvc',
          widthCm: 150,
          heightCm: 100,
          shape: 'rectangular',
          materialId: 'pvc-5mm',
          materialName: 'PVC Espumado 5 mm',
          finishId: 'laminado-mate',
          finishName: 'Laminado Protección Mate',
          structureId: 'ninguna',
          description: 'Diseño cargado por el usuario a la biblioteca de medios.',
          imageUrl: resultUrl,
          dateAdded: 'Hoy',
        };
        setDesigns((prev) => [newDesign, ...prev]);
        setSelectedDesign(newDesign);
      }
    };
    reader.readAsDataURL(file);
  };

  // Filtered designs
  const filteredDesigns = designs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'all' || d.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-[#F0F0F1] text-[#2C3338] flex flex-col font-sans select-none overflow-hidden">
      {/* WordPress Media Library Top Bar / Admin Bar */}
      <header className="bg-white border-b border-[#DCDCDE] px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs z-20">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-1 text-xs font-semibold text-[#2271B1] hover:text-[#135E96] bg-[#F6F7F7] hover:bg-[#F0F0F1] border border-[#C3C4C7] rounded px-3 py-1.5 transition-colors cursor-pointer"
            title="Volver a las opciones de cartelería"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Opciones</span>
          </button>

          <div className="h-4 w-px bg-[#DCDCDE]" />

          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-[#1D2327]">
              Biblioteca de medios
            </h1>
            <span className="text-xs text-[#646970] bg-[#F0F0F1] px-2 py-0.5 rounded-full font-medium">
              Diseños de Carteles
            </span>
          </div>
        </div>

        {/* Action Buttons: Add Media & Blank Designer */}
        <div className="flex items-center space-x-2">
          {/* Native Hidden File Input */}
          <input
            type="file"
            ref={uploadInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => {
              setUploadTargetId(null);
              uploadInputRef.current?.click();
            }}
            className="flex items-center space-x-1.5 text-xs font-semibold text-[#2271B1] hover:text-[#135E96] bg-[#F6F7F7] hover:bg-white border border-[#2271B1] rounded px-3 py-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Añadir nuevo medio</span>
          </button>

          <button
            onClick={onOpenBlankDesigner}
            className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#2271B1] hover:bg-[#135E96] active:bg-[#0A4B78] rounded px-3.5 py-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Diseñar en blanco</span>
          </button>
        </div>
      </header>

      {/* WordPress Media Library Sub-Filter Bar */}
      <div className="bg-white border-b border-[#DCDCDE] px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle (Grid / List) */}
          <div className="flex items-center border border-[#8C8F94] rounded bg-white overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-[#2271B1] text-white'
                  : 'text-[#50575E] hover:bg-[#F0F0F1]'
              } transition-colors`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 border-l border-[#8C8F94] ${
                viewMode === 'list'
                  ? 'bg-[#2271B1] text-white'
                  : 'text-[#50575E] hover:bg-[#F0F0F1]'
              } transition-colors`}
              title="Vista de lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category Filter dropdown */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white border border-[#8C8F94] rounded px-2.5 py-1 text-xs text-[#2C3338] font-medium focus:border-[#2271B1] focus:outline-hidden cursor-pointer"
          >
            <option value="all">Todos los medios / categorías</option>
            <option value="pvc">Carteles PVC Espumado</option>
            <option value="acrilico">Placas Acrílico Cristal</option>
            <option value="senaletica">Señalética de Seguridad</option>
            <option value="gastronomia">Gastronomía & Menú Boards</option>
          </select>

          {/* Status counter */}
          <span className="text-[11px] text-[#646970] font-medium ml-2">
            Mostrando {filteredDesigns.length} modelos de carteles
          </span>
        </div>

        {/* Search Media Input */}
        <div className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar medios..."
            className="w-full bg-white border border-[#8C8F94] rounded px-2.5 py-1 pl-7 text-xs text-[#2C3338] placeholder-[#8C8F94] focus:border-[#2271B1] focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2 top-2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-[#8C8F94] hover:text-[#1D2327]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Media Grid Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Grid or List of Media Items */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {filteredDesigns.length === 0 ? (
            <div className="bg-white rounded border border-[#C3C4C7] p-12 text-center max-w-md mx-auto mt-12">
              <ImageIcon className="w-12 h-12 text-[#A7AAAD] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#1D2327]">No se encontraron diseños</h3>
              <p className="text-xs text-[#646970] mt-1">
                Probá con otra búsqueda o añadí un nuevo medio con el botón superior.
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            /* WordPress Media Grid: 4 columns */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {filteredDesigns.map((item) => {
                const isSelected = selectedDesign?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDesign(item)}
                    className={`group relative bg-white border rounded transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-2xs ${
                      isSelected
                        ? 'border-[#2271B1] ring-2 ring-[#2271B1] shadow-md'
                        : 'border-[#DCDCDE] hover:border-[#8C8F94]'
                    }`}
                  >
                    {/* Photo Box: Empty by default per user requirement */}
                    <div className="relative aspect-square w-full bg-[#F6F7F7] border-b border-[#DCDCDE] flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        /* Empty State Photo Box with dashed placeholder */
                        <div className="w-full h-full border border-dashed border-[#C3C4C7] rounded bg-[#FAFAFA] flex flex-col items-center justify-center p-2 text-center group-hover:border-[#2271B1] transition-colors">
                          <ImageIcon className="w-7 h-7 text-[#A7AAAD] group-hover:text-[#2271B1] mb-1.5 transition-colors" />
                          <span className="text-[10px] font-semibold text-[#8C8F94] group-hover:text-[#2271B1] leading-tight">
                            Sin imagen
                          </span>
                          <span className="text-[9px] text-[#A7AAAD] mt-0.5">
                            Caja de foto vacía
                          </span>
                        </div>
                      )}

                      {/* Dimensions pill */}
                      <span className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {item.widthCm}×{item.heightCm} cm
                      </span>

                      {/* Selected checkmark indicator */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#2271B1] rounded-full flex items-center justify-center text-white shadow-xs">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata: Cartel Title & Category */}
                    <div className="p-2.5">
                      <h4 className="text-[11px] font-bold text-[#1D2327] line-clamp-2 leading-snug group-hover:text-[#2271B1] transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-[#646970]">
                        <span>{item.categoryLabel}</span>
                        <span className="font-semibold text-[#2271B1]">Elegir →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* WordPress List View */
            <div className="bg-white border border-[#DCDCDE] rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCDCDE] bg-[#F6F7F7] text-[11px] font-bold text-[#2C3338]">
                    <th className="p-2.5 w-16">Foto</th>
                    <th className="p-2.5">Título del Cartel</th>
                    <th className="p-2.5">Categoría / Material</th>
                    <th className="p-2.5">Dimensiones</th>
                    <th className="p-2.5">Acabado</th>
                    <th className="p-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigns.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedDesign(item)}
                      className={`border-b border-[#DCDCDE] hover:bg-[#F0F0F1] cursor-pointer transition-colors ${
                        selectedDesign?.id === item.id ? 'bg-[#F0F6FC]' : ''
                      }`}
                    >
                      <td className="p-2">
                        <div className="w-12 h-12 bg-[#F6F7F7] border border-dashed border-[#C3C4C7] rounded flex items-center justify-center overflow-hidden">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-[#A7AAAD]" />
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 font-bold text-[#1D2327]">{item.title}</td>
                      <td className="p-2.5 text-[#50575E]">{item.materialName}</td>
                      <td className="p-2.5 font-mono text-[#50575E]">
                        {item.widthCm} × {item.heightCm} cm
                      </td>
                      <td className="p-2.5 text-[#50575E]">{item.finishName}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyDesign(item);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-[#2271B1] hover:text-white hover:bg-[#2271B1] border border-[#2271B1] rounded transition-all cursor-pointer"
                        >
                          Diseñar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* WordPress "Detalles del adjunto" Side Panel / Modal Drawer */}
        {selectedDesign && (
          <aside className="w-[320px] md:w-[360px] bg-white border-l border-[#DCDCDE] flex flex-col h-full shrink-0 shadow-lg z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-3.5 border-b border-[#DCDCDE] flex items-center justify-between bg-[#F6F7F7]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1D2327]">
                Detalles del adjunto
              </h3>
              <button
                onClick={() => setSelectedDesign(null)}
                className="text-[#646970] hover:text-[#1D2327] p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 flex-1">
              {/* Photo Box in Details Drawer */}
              <div className="aspect-4/3 w-full bg-[#F6F7F7] border border-[#DCDCDE] rounded flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                {selectedDesign.imageUrl ? (
                  <img
                    src={selectedDesign.imageUrl}
                    alt={selectedDesign.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#E0E0E0] flex items-center justify-center mb-2">
                      <ImageIcon className="w-6 h-6 text-[#8C8F94]" />
                    </div>
                    <span className="text-xs font-bold text-[#2C3338]">
                      Caja de foto vacía
                    </span>
                    <p className="text-[11px] text-[#646970] max-w-[200px] mt-1">
                      Espacio reservado para que subas la foto de ejemplo ya hecha.
                    </p>
                    <button
                      onClick={() => {
                        setUploadTargetId(selectedDesign.id);
                        uploadInputRef.current?.click();
                      }}
                      className="mt-3 flex items-center space-x-1.5 text-xs font-semibold text-[#2271B1] hover:text-[#135E96] bg-white border border-[#2271B1] px-3 py-1 rounded shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto de ejemplo</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Title and Specs */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#646970] mb-1">
                  Título del Cartel
                </label>
                <h2 className="text-sm font-bold text-[#1D2327]">
                  {selectedDesign.title}
                </h2>
                <p className="text-xs text-[#646970] mt-1 leading-relaxed">
                  {selectedDesign.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#DCDCDE] text-xs">
                <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                  <span className="text-[#646970]">Categoría:</span>
                  <span className="font-semibold text-[#1D2327]">
                    {selectedDesign.categoryLabel}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                  <span className="text-[#646970]">Dimensiones sugeridas:</span>
                  <span className="font-mono font-bold text-[#1D2327]">
                    {selectedDesign.widthCm} × {selectedDesign.heightCm} cm
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                  <span className="text-[#646970]">Material base:</span>
                  <span className="font-semibold text-[#1D2327]">
                    {selectedDesign.materialName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                  <span className="text-[#646970]">Terminación / Acabado:</span>
                  <span className="font-semibold text-[#1D2327]">
                    {selectedDesign.finishName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0F0F1]">
                  <span className="text-[#646970]">Forma del cartel:</span>
                  <span className="capitalize font-semibold text-[#1D2327]">
                    {selectedDesign.shape}
                  </span>
                </div>
              </div>

              {/* Primary Action to Open and Design in the Editor */}
              <div className="pt-3">
                <button
                  onClick={() => handleApplyDesign(selectedDesign)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#2271B1] hover:bg-[#135E96] active:bg-[#0A4B78] text-white font-bold text-xs rounded transition-all shadow-sm cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Comenzar a Diseñar este Cartel</span>
                </button>
                <p className="text-[10px] text-center text-[#646970] mt-1.5">
                  Carga estas medidas y material directo en el lienzo interactivo.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
