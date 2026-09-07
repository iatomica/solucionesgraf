import { useState, useRef } from 'react';
import Konva from 'konva';
import { TopHeader } from './components/layout/TopHeader';
import { ProductSidebar } from './components/configuration/ProductSidebar';
import { CanvasEditor } from './components/editor/CanvasEditor';
import { Product3DViewer } from './components/editor/Product3DViewer';
import { RightPanel } from './components/editor/RightPanel';
import { MonitorX } from 'lucide-react';

export function App() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased">
      {/* Ultra Minimal Top Header */}
      <TopHeader
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Viewport Notice overlay for small mobile screens */}
        <div className="md:hidden absolute inset-0 z-40 bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <MonitorX className="w-12 h-12 text-blue-400 mb-3" />
          <h2 className="text-base font-bold mb-1">
            Pantalla Recomendada: Escritorio o Tablet
          </h2>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Para diseñar tu producto gráfico con precisión y usar el lienzo interactivo,
            te recomendamos acceder desde una computadora o pantalla más grande.
          </p>
        </div>

        {/* Left Sidebar (Product configuration) */}
        <ProductSidebar />

        {/* Central Visual Canvas Area: Switch between 2D Konva & 3D Viewer */}
        {viewMode === '3d' ? (
          <Product3DViewer stageRef={stageRef} />
        ) : (
          <CanvasEditor stageRef={stageRef} />
        )}

        {/* Right Inspector & Tools Panel */}
        <RightPanel />
      </div>
    </div>
  );
}

export default App;
