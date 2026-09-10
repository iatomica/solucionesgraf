import React from 'react';
import { Shirt } from 'lucide-react';

interface MainCategorySelectorProps {
  onSelectCategory: (category: 'textil' | 'carteleria') => void;
}

export const MainCategorySelector: React.FC<MainCategorySelectorProps> = ({
  onSelectCategory,
}) => {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 select-none font-sans antialiased">
      {/* Brand Header with Space for Brand Logo */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Cuadrado Troquelado para el Logo */}
        <div className="mb-4 flex items-center justify-center">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white/80 hover:border-slate-400 flex items-center justify-center shadow-2xs transition-colors">
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
              logo
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Soluciones Gráficas
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Elegí una opción para comenzar
        </p>
      </div>

      {/* Two Minimalist Boxes: Textil & Cartelería with Centered Drawings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg">
        {/* Box Textil */}
        <button
          onClick={() => onSelectCategory('textil')}
          className="bg-white hover:bg-slate-50/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl h-48 sm:h-52 flex flex-col items-center justify-center p-6 transition-all duration-200 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-300 group gap-3.5"
        >
          {/* Simple T-Shirt Drawing */}
          <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <Shirt className="w-8 h-8 text-slate-500 group-hover:text-slate-800 transition-colors stroke-[1.75]" />
          </div>

          {/* Centered Text */}
          <span className="text-xl font-semibold text-slate-700 group-hover:text-slate-950 transition-colors text-center">
            Textil
          </span>
        </button>

        {/* Box Cartelería */}
        <button
          onClick={() => onSelectCategory('carteleria')}
          className="bg-white hover:bg-slate-50/80 active:bg-slate-100 border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-2xl h-48 sm:h-52 flex flex-col items-center justify-center p-6 transition-all duration-200 cursor-pointer shadow-xs focus:outline-hidden focus:ring-2 focus:ring-slate-300 group gap-3.5"
        >
          {/* Simple Signboard / Cartel Drawing */}
          <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
            <svg
              className="w-8 h-8 text-slate-500 group-hover:text-slate-800 transition-colors stroke-[1.75]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Signboard frame with hanging posts */}
              <rect x="3" y="6" width="18" height="14" rx="2" />
              <path d="M7 2v4" />
              <path d="M17 2v4" />
              <path d="M7 13h10" />
            </svg>
          </div>

          {/* Centered Text */}
          <span className="text-xl font-semibold text-slate-700 group-hover:text-slate-950 transition-colors text-center">
            Cartelería
          </span>
        </button>
      </div>
    </div>
  );
};
