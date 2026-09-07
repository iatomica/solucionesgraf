import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Calculator, Tag, Send } from 'lucide-react';
import { useQuoteStore } from '../../stores/useQuoteStore';
import { useProductStore } from '../../stores/useProductStore';
import { getProductById } from '../../products/productDefinitions';

interface QuoteSummaryCardProps {
  onRequestQuote: () => void;
}

export const QuoteSummaryCard: React.FC<QuoteSummaryCardProps> = ({
  onRequestQuote,
}) => {
  const { quote } = useQuoteStore();
  const { configuration } = useProductStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const productDef = getProductById(configuration.productId);
  const materialDef = productDef.materials.find(
    (m) => m.id === configuration.materialId
  );
  const printDef = productDef.printMethods.find(
    (p) => p.id === configuration.printMethodId
  );
  const finishDef = productDef.finishes.find(
    (f) => f.id === configuration.finishId
  );

  return (
    <div className="fixed bottom-4 left-72 z-30 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden select-none transition-all duration-200">
      {/* Header bar (Click to toggle detailed breakdown) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold tracking-wide">
            Estimación en Tiempo Real
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-blue-400">
            {quote.formatted.total}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Main summary view */}
      <div className="p-3 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Producto</span>
          <span className="font-medium text-slate-900">{productDef.name}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Medida</span>
          <span className="font-medium text-slate-900">
            {configuration.widthCm} × {configuration.heightCm} cm
          </span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Superficie</span>
          <span className="font-medium text-slate-900">{quote.formatted.area}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Cantidad</span>
          <span className="font-semibold text-slate-900">
            {configuration.quantity} {configuration.quantity > 1 ? 'unidades' : 'unidad'}
          </span>
        </div>

        {/* Detailed Breakdown Accordion */}
        {isExpanded && (
          <div className="pt-2 mt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg">
            <div className="flex justify-between">
              <span>Material ({materialDef?.thickness || ''})</span>
              <span>{quote.formatted.materialCost}</span>
            </div>

            <div className="flex justify-between">
              <span>Impresión ({printDef?.name || ''})</span>
              <span>{quote.formatted.printCost}</span>
            </div>

            {finishDef && finishDef.id !== 'sin-terminacion' && (
              <div className="flex justify-between">
                <span>Terminación ({finishDef.name})</span>
                <span>{quote.formatted.finishCost}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Preparación de trabajo</span>
              <span>{quote.formatted.setupCost}</span>
            </div>

            {quote.volumeDiscountPercentage > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600 pt-1 border-t border-emerald-100">
                <span className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>Descuento ({quote.volumeDiscountPercentage}%)</span>
                </span>
                <span>-{quote.formatted.volumeDiscountAmount}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
          <span className="text-xs font-bold text-slate-700">TOTAL ESTIMADO</span>
          <span className="text-base font-extrabold text-blue-600">
            {quote.formatted.total}
          </span>
        </div>

        <button
          onClick={onRequestQuote}
          className="w-full mt-2 flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Solicitar presupuesto</span>
        </button>
      </div>
    </div>
  );
};
