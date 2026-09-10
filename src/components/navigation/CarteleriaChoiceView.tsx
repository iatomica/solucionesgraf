import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CarteleriaChoiceViewProps {
  onBack: () => void;
  onSelectOption: (option: 'gallery' | 'custom') => void;
}

export const CarteleriaChoiceView: React.FC<CarteleriaChoiceViewProps> = ({
  onBack,
  onSelectOption,
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between p-6 select-none font-sans antialiased">
      {/* Top Back Nav */}
      <div className="max-w-2xl mx-auto w-full pt-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </button>
      </div>

      {/* Main Choice Cards */}
      <div className="max-w-2xl mx-auto w-full my-auto py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Cartelería
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Elegí una opción para continuar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Option 1: Elegir diseños ya hechos */}
          <button
            onClick={() => onSelectOption('gallery')}
            className="bg-white hover:bg-slate-50/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-7 text-left transition-all duration-200 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-300 group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Opción 01
              </span>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                Elegir diseños ya hechos
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Accedé al catálogo de modelos de carteles con fotos de referencia y medidas preconfiguradas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-slate-600 group-hover:text-slate-900">
              <span>Abrir catálogo →</span>
            </div>
          </button>

          {/* Option 2: Diseña tu propio diseño */}
          <button
            onClick={() => onSelectOption('custom')}
            className="bg-white hover:bg-slate-50/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl p-7 text-left transition-all duration-200 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-300 group flex flex-col justify-between min-h-[170px]"
          >
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Opción 02
              </span>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-950 transition-colors">
                Diseña tu propio diseño
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Comenzá desde cero en el editor interactivo: configurá medidas exactas, materiales y formas.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-slate-600 group-hover:text-slate-900">
              <span>Diseñar en blanco →</span>
            </div>
          </button>
        </div>
      </div>

      <div className="py-4" />
    </div>
  );
};
