import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Sparkles,
  Box,
  MessageCircle,
} from 'lucide-react';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useProductStore } from '../../stores/useProductStore';
import { useQuoteStore } from '../../stores/useQuoteStore';
import { openWhatsAppUrl } from '../../utils/whatsapp';

interface TopHeaderProps {
  viewMode: '2d' | '3d';
  onToggleViewMode: () => void;
  onOpenTemplates?: () => void;
  onRequestQuote?: () => void;
  onExportPng?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  viewMode,
  onToggleViewMode,
}) => {
  const [designName, setDesignName] = useState('Soluciones Gráficas');

  const { canUndo, canRedo, undo, redo } = useHistoryStore();
  const {
    showBleed,
    showSafeArea,
    previewMode,
    toggleBleed,
    toggleSafeArea,
    setPreviewMode,
    elements,
  } = useCanvasStore();

  const { configuration } = useProductStore();
  const { quote } = useQuoteStore();

  const handleSendWhatsApp = () => {
    openWhatsAppUrl(configuration, quote, elements);
  };

  return (
    <header className="h-16 bg-slate-50/80 backdrop-blur-md px-6 flex items-center justify-between text-slate-800 shrink-0 z-30 select-none border-b border-slate-200/60">
      {/* Left section: Brand Pill & Editable Design Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>SOLUCIONES GRÁFICAS</span>
        </div>

        <div className="h-4 w-px bg-slate-300/60" />

        <input
          type="text"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          className="text-xs font-semibold text-slate-900 bg-transparent hover:bg-white/60 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1 outline-none transition-all w-48 truncate"
          title="Editar nombre del proyecto"
        />
      </div>

      {/* Center section: Floating Pill for View Modes & History */}
      <div className="flex items-center space-x-1.5 bg-white border border-slate-200/80 p-1 rounded-full shadow-2xs">
        {/* 2D / 3D Mode Switcher */}
        <button
          onClick={onToggleViewMode}
          className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded-full font-semibold transition-all ${
            viewMode === '3d'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>{viewMode === '3d' ? 'Vista 3D' : 'Cambiar a 3D'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Deshacer (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Rehacer (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {viewMode === '2d' && (
          <>
            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={toggleBleed}
              className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-all ${
                showBleed
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Sangrado
            </button>

            <button
              onClick={toggleSafeArea}
              className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-all ${
                showSafeArea
                  ? 'bg-blue-50 text-blue-900 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Área Segura
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded-full font-medium transition-all ${
                previewMode
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {previewMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-blue-400" />
                  <span>Editor</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vista Previa</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Right section: Direct WhatsApp Action */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSendWhatsApp}
          className="flex items-center space-x-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-full transition-all shadow-sm cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Enviar Pedido por WhatsApp</span>
        </button>
      </div>
    </header>
  );
};
