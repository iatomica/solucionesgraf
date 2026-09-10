import { useState, useRef } from 'react';
import Konva from 'konva';
import { TopHeader } from './components/layout/TopHeader';
import { ProductSidebar } from './components/configuration/ProductSidebar';
import { CanvasEditor } from './components/editor/CanvasEditor';
import { Product3DViewer } from './components/editor/Product3DViewer';
import { RightPanel } from './components/editor/RightPanel';
import { MainCategorySelector } from './components/navigation/MainCategorySelector';
import { CarteleriaChoiceView } from './components/navigation/CarteleriaChoiceView';
import { WordPressMediaGallery } from './components/gallery/WordPressMediaGallery';
import { useProductStore } from './stores/useProductStore';
import { MonitorX } from 'lucide-react';

export type AppView = 'home' | 'carteleria-choice' | 'carteleria-gallery' | 'editor';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const stageRef = useRef<Konva.Stage | null>(null);

  const { setProduct } = useProductStore();

  // Handle category choice from Main Landing screen
  const handleSelectCategory = (category: 'textil' | 'carteleria') => {
    if (category === 'textil') {
      setProduct('textil-remera');
      setCurrentView('editor');
    } else {
      setCurrentView('carteleria-choice');
    }
  };

  // Handle choice in Cartelería step
  const handleCarteleriaChoice = (option: 'gallery' | 'custom') => {
    if (option === 'gallery') {
      setCurrentView('carteleria-gallery');
    } else {
      setProduct('cartel-pvc');
      setCurrentView('editor');
    }
  };

  // Screen 1: Home Category Selector (Textil vs Cartelería)
  if (currentView === 'home') {
    return <MainCategorySelector onSelectCategory={handleSelectCategory} />;
  }

  // Screen 2: Cartelería Decision (Elegir diseños ya hechos vs Diseña tu propio diseño)
  if (currentView === 'carteleria-choice') {
    return (
      <CarteleriaChoiceView
        onBack={() => setCurrentView('home')}
        onSelectOption={handleCarteleriaChoice}
      />
    );
  }

  // Screen 3: WordPress-Style Media Library (Empty photo boxes, design titles)
  if (currentView === 'carteleria-gallery') {
    return (
      <WordPressMediaGallery
        onBack={() => setCurrentView('carteleria-choice')}
        onOpenBlankDesigner={() => {
          setProduct('cartel-pvc');
          setCurrentView('editor');
        }}
        onSelectDesignTemplate={() => {
          setCurrentView('editor');
        }}
      />
    );
  }

  // Screen 4: Main Interactive Graphic & Textile Editor
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased">
      {/* Top Header with navigation to return to categories or media gallery */}
      <TopHeader
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onNavigateHome={() => setCurrentView('home')}
        onOpenGallery={() => setCurrentView('carteleria-gallery')}
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
          <CanvasEditor
            stageRef={stageRef}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode('3d')}
          />
        )}

        {/* Right Inspector & Tools Panel */}
        <RightPanel />
      </div>
    </div>
  );
}

export default App;
