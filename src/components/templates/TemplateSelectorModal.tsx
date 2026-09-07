import React from 'react';
import { X, LayoutTemplate, Check } from 'lucide-react';
import { DEMO_TEMPLATES } from '../../templates/demoTemplates';
import { useProductStore } from '../../stores/useProductStore';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useSelectionStore } from '../../stores/useSelectionStore';
import type { TemplateDefinition } from '../../types';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loadConfiguration } = useProductStore();
  const { setElements } = useCanvasStore();
  const { clearHistory } = useHistoryStore();
  const { clearSelection } = useSelectionStore();

  if (!isOpen) return null;

  const handleSelectTemplate = (template: TemplateDefinition) => {
    loadConfiguration(template.design.productConfiguration);
    setElements(template.design.canvasElements);
    clearHistory();
    clearSelection();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutTemplate className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Seleccionar Plantilla Predefinida</h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-500">
            Elegí una plantilla base para comenzar a editar rápidamente tu producto.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(tmpl)}
                className="group border border-gray-200 hover:border-blue-500 bg-slate-50 hover:bg-white rounded-xl p-4 cursor-pointer transition-all duration-150 shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {tmpl.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                    {tmpl.name}
                  </h4>

                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span>
                    {tmpl.design.productConfiguration.widthCm}×
                    {tmpl.design.productConfiguration.heightCm} cm
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:underline flex items-center space-x-0.5">
                    <span>Usar</span>
                    <Check className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
