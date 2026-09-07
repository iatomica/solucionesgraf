import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Konva from 'konva';
import { useProductStore } from '../../stores/useProductStore';
import { useCanvasStore } from '../../stores/useCanvasStore';
import { getProductById } from '../../products/productDefinitions';
import { create3DShape } from '../../utils/productShapes';
import { processImageFile } from '../../utils/imageUploader';
import { RotateCcw, Sparkles, Box, Info, UploadCloud } from 'lucide-react';

interface Product3DViewerProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const T: any = THREE;

export const Product3DViewer: React.FC<Product3DViewerProps> = ({ stageRef }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const { configuration } = useProductStore();
  const { elements } = useCanvasStore();

  const productDef = getProductById(configuration.productId);
  const isTextil = productDef.category === 'textil';

  const material =
    productDef.materials.find((m) => m.id === configuration.materialId) ||
    productDef.materials[0];

  const isAcrylic = material.id.includes('acrilico');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const scene: any = new T.Scene();
    scene.background = new T.Color('#0F172A'); // Deep slate studio backdrop

    // 2. Perspective Camera
    const camera: any = new T.PerspectiveCamera(45, width / height, 0.1, 1000);
    const maxDim = Math.max(configuration.widthCm, configuration.heightCm) * 0.03;
    camera.position.set(0, 0, maxDim * 2.4 + 1.2);

    // 3. WebGL Renderer
    const renderer: any = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls: any = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;

    // 5. Studio Lighting
    const ambientLight: any = new T.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1: any = new T.DirectionalLight(0xffffff, 1.8);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2: any = new T.DirectionalLight(0x94a3b8, 0.8);
    dirLight2.position.set(-5, -3, -4);
    scene.add(dirLight2);

    // 6. Scale and Dimensions
    const scale = 0.03;
    const w3D = configuration.widthCm * scale;
    const h3D = configuration.heightCm * scale;

    let thicknessMm = 5;
    if (material.id.includes('3mm')) thicknessMm = 3;
    else if (material.id.includes('5mm')) thicknessMm = 5;
    else if (material.id.includes('10mm')) thicknessMm = 10;
    else if (material.id.includes('15mm')) thicknessMm = 15;
    else if (material.id.includes('20mm')) thicknessMm = 20;
    else if (isTextil) thicknessMm = 1.5;

    const d3D = isTextil ? 0.03 : Math.max(0.04, thicknessMm * scale);

    // Garment color (Default Blanco #F8FAFC)
    const garmentHexStr = configuration.garmentColor || '#F8FAFC';
    const garmentColorHex = parseInt(garmentHexStr.replace('#', '0x'), 16);

    const garmentMaterial: any = new T.MeshStandardMaterial({
      color: garmentColorHex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const sideMaterial: any = new T.MeshStandardMaterial({
      color: isTextil ? garmentColorHex : isAcrylic ? 0xe2e8f0 : 0xf1f5f9,
      roughness: isTextil ? 0.85 : isAcrylic ? 0.1 : 0.4,
      metalness: isTextil ? 0.05 : isAcrylic ? 0.2 : 0.05,
      transparent: isAcrylic,
      opacity: isAcrylic ? 0.75 : 1.0,
    });

    // 7. Physical 3D Mesh Assembly Group
    const boardGroup: any = new T.Group();
    let geometry: any;
    let mainMesh: any;
    let frontZPos = d3D / 2 + 0.005;
    let backZPos = -d3D / 2 - 0.005;

    if (isTextil) {
      const hw = w3D / 2;
      const hh = h3D / 2;
      const productId = configuration.productId;

      const garmentShape = new T.Shape();

      if (productId === 'textil-hoodie') {
        // --- 3D HOODIE MESH ASSEMBLY ---
        const sleeveW = hw * 0.65;
        const bodyDepth = 0.045;

        garmentShape.moveTo(hw * 1.05, -hh);
        garmentShape.lineTo(hw * 1.05, hh * 0.2);
        garmentShape.lineTo(hw + sleeveW, -hh * 0.35);
        garmentShape.lineTo(hw + sleeveW + 0.12, -hh * 0.2);
        garmentShape.lineTo(hw * 0.42, hh * 0.88);
        // Volumetric Hood curve top extending above neck
        garmentShape.quadraticCurveTo(hw * 0.3, hh * 1.35, 0, hh * 1.4);
        garmentShape.quadraticCurveTo(-hw * 0.3, hh * 1.35, -hw * 0.42, hh * 0.88);
        garmentShape.lineTo(-hw - sleeveW - 0.12, -hh * 0.2);
        garmentShape.lineTo(-hw - sleeveW, -hh * 0.35);
        garmentShape.lineTo(-hw * 1.05, hh * 0.2);
        garmentShape.lineTo(-hw * 1.05, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.015,
          bevelThickness: 0.015,
        });
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // 3D Kangaroo Pouch Pocket mounted on front lower torso
        const pocketShape = new T.Shape();
        const pw = hw * 0.65;
        const ph = hh * 0.38;
        pocketShape.moveTo(pw, -hh + 0.02);
        pocketShape.lineTo(pw * 0.72, -hh + ph);
        pocketShape.lineTo(-pw * 0.72, -hh + ph);
        pocketShape.lineTo(-pw, -hh + 0.02);
        pocketShape.closePath();

        const pocketGeo = new T.ExtrudeGeometry(pocketShape, {
          depth: 0.018,
          bevelEnabled: true,
          bevelSize: 0.006,
          bevelThickness: 0.006,
        });
        const pocketMesh = new T.Mesh(pocketGeo, garmentMaterial);
        pocketMesh.position.set(0, 0, bodyDepth / 2);
        pocketMesh.castShadow = true;
        boardGroup.add(pocketMesh);

        // 3D Hood Dome Shell on back collar
        const hoodShellGeo = new T.SphereGeometry(hw * 0.38, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
        const hoodShellMesh = new T.Mesh(hoodShellGeo, garmentMaterial);
        hoodShellMesh.position.set(0, hh * 0.9, -bodyDepth / 2 - 0.02);
        hoodShellMesh.rotation.x = -Math.PI / 4;
        hoodShellMesh.castShadow = true;
        boardGroup.add(hoodShellMesh);

        frontZPos = bodyDepth / 2 + 0.015;
        backZPos = -bodyDepth / 2 - 0.015;

      } else if (productId === 'textil-pulover') {
        // --- 3D SWEATER / PULOVER MESH ASSEMBLY ---
        const sleeveW = hw * 0.6;
        const bodyDepth = 0.035;

        garmentShape.moveTo(hw, -hh);
        garmentShape.lineTo(hw * 1.02, hh * 0.25);
        garmentShape.lineTo(hw + sleeveW, -hh * 0.35);
        garmentShape.lineTo(hw + sleeveW + 0.1, -hh * 0.2);
        garmentShape.lineTo(hw * 0.35, hh * 0.95);
        // V-Neck collar notch
        garmentShape.lineTo(0, hh * 0.55);
        garmentShape.lineTo(-hw * 0.35, hh * 0.95);
        garmentShape.lineTo(-hw - sleeveW - 0.1, -hh * 0.2);
        garmentShape.lineTo(-hw - sleeveW, -hh * 0.35);
        garmentShape.lineTo(-hw * 1.02, hh * 0.25);
        garmentShape.lineTo(-hw, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 4,
          steps: 1,
          bevelSize: 0.012,
          bevelThickness: 0.012,
        });
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // V-Neck Rib Trim Mesh
        const collarRibGeo = new T.BoxGeometry(hw * 0.65, 0.04, 0.04);
        const collarRibMesh = new T.Mesh(collarRibGeo, garmentMaterial);
        collarRibMesh.position.set(0, hh * 0.72, bodyDepth / 2 + 0.005);
        boardGroup.add(collarRibMesh);

        frontZPos = bodyDepth / 2 + 0.012;
        backZPos = -bodyDepth / 2 - 0.012;

      } else {
        // --- 3D REMERA (T-SHIRT) MESH ASSEMBLY ---
        const sleeveW = hw * 0.45;
        const bodyDepth = 0.028;

        garmentShape.moveTo(hw, -hh);
        garmentShape.lineTo(hw, hh * 0.22);
        garmentShape.lineTo(hw + sleeveW, hh * 0.08);
        garmentShape.lineTo(hw + sleeveW + 0.08, hh * 0.45);
        garmentShape.lineTo(hw * 0.38, hh);
        // Crewneck collar curve
        garmentShape.quadraticCurveTo(0, hh * 0.65, -hw * 0.38, hh);
        garmentShape.lineTo(-hw - sleeveW - 0.08, hh * 0.45);
        garmentShape.lineTo(-hw - sleeveW, hh * 0.08);
        garmentShape.lineTo(-hw, hh * 0.22);
        garmentShape.lineTo(-hw, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.01,
          bevelThickness: 0.01,
        });
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // Crewneck Torus Rim
        const neckRimGeo = new T.TorusGeometry(hw * 0.35, 0.02, 16, 32);
        const neckRimMesh = new T.Mesh(neckRimGeo, garmentMaterial);
        neckRimMesh.position.set(0, hh * 0.82, bodyDepth / 2 + 0.005);
        neckRimMesh.rotation.x = Math.PI / 4;
        boardGroup.add(neckRimMesh);

        frontZPos = bodyDepth / 2 + 0.01;
        backZPos = -bodyDepth / 2 - 0.01;
      }
    } else {
      const contour3DShape = create3DShape(configuration.shape || 'rectangular', w3D, h3D);
      geometry = new T.ExtrudeGeometry(contour3DShape, {
        depth: d3D,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.006,
        bevelThickness: 0.006,
      });
      mainMesh = new T.Mesh(geometry, sideMaterial);
      mainMesh.position.z = -d3D / 2;
      frontZPos = d3D / 2 + 0.003;
    }

    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    boardGroup.add(mainMesh);

    // 8. Front and Back Imprint Texture Planes
    const frontImprintMaterial = new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0.99,
      depthWrite: false,
      alphaTest: 0.01,
    });

    const backImprintMaterial = new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0.99,
      depthWrite: false,
      alphaTest: 0.01,
    });

    if (isTextil) {
      const imprintW = w3D * 0.8;
      const imprintH = h3D * 0.8;
      const imprintGeo = new T.PlaneGeometry(imprintW, imprintH);

      // Front Imprint Plane (Chest Area)
      const frontPlane = new T.Mesh(imprintGeo, frontImprintMaterial);
      frontPlane.position.set(0, -h3D * 0.04, frontZPos);
      boardGroup.add(frontPlane);

      // Back Imprint Plane (Dorsal Area)
      const backPlane = new T.Mesh(imprintGeo, backImprintMaterial);
      backPlane.position.set(0, -h3D * 0.04, backZPos);
      backPlane.rotation.y = Math.PI;
      boardGroup.add(backPlane);

    } else {
      // Single Front Imprint Plane for Signage / Stickers
      const imprintGeo = new T.PlaneGeometry(w3D, h3D);
      const frontPlane = new T.Mesh(imprintGeo, frontImprintMaterial);
      frontPlane.position.set(0, 0, frontZPos);
      boardGroup.add(frontPlane);
    }

    // Capture Front & Back Konva Stage Textures
    const stage = stageRef.current;
    if (stage) {
      try {
        const bgNodes = stage.find('.product-bg');
        bgNodes.forEach((node: any) => node.hide());

        const loader = new T.TextureLoader();

        if (isTextil) {
          // 1. Capture Front Side Elements
          elements.forEach((el) => {
            const node = stage.findOne('#' + el.id);
            if (node) {
              const side = el.side || 'frente';
              if (side === 'frente' || side === 'ambos') node.show();
              else node.hide();
            }
          });

          const frontDataUrl = stage.toDataURL({ pixelRatio: 2 });
          loader.load(frontDataUrl, (tex: any) => {
            tex.colorSpace = T.SRGBColorSpace;
            tex.needsUpdate = true;
            frontImprintMaterial.map = tex;
            frontImprintMaterial.needsUpdate = true;
          });

          // 2. Capture Back Side Elements
          elements.forEach((el) => {
            const node = stage.findOne('#' + el.id);
            if (node) {
              const side = el.side || 'frente';
              if (side === 'espalda' || side === 'ambos') node.show();
              else node.hide();
            }
          });

          const backDataUrl = stage.toDataURL({ pixelRatio: 2 });
          loader.load(backDataUrl, (tex: any) => {
            tex.colorSpace = T.SRGBColorSpace;
            tex.needsUpdate = true;
            backImprintMaterial.map = tex;
            backImprintMaterial.needsUpdate = true;
          });

          // Restore node visibility
          bgNodes.forEach((node: any) => node.show());
          elements.forEach((el) => {
            const node = stage.findOne('#' + el.id);
            if (node) node.show();
          });

        } else {
          // Capture All Elements for General Products / Adhesivos
          const dataUrl = stage.toDataURL({ pixelRatio: 2 });
          bgNodes.forEach((node: any) => node.show());

          loader.load(dataUrl, (tex: any) => {
            tex.colorSpace = T.SRGBColorSpace;
            tex.needsUpdate = true;
            frontImprintMaterial.map = tex;
            frontImprintMaterial.needsUpdate = true;
          });
        }
      } catch (err) {
        console.warn('Could not capture dual side stage textures for 3D viewer', err);
      }
    }

    scene.add(boardGroup);

    // 9. Soft Shadow Plane
    const shadowGeo: any = new T.PlaneGeometry(w3D * 2.5 + 2, h3D * 2.5 + 2);
    const shadowMat: any = new T.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane: any = new T.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -h3D / 2 - 0.6;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (geometry) geometry.dispose();
      frontImprintMaterial.dispose();
      backImprintMaterial.dispose();
      renderer.dispose();
    };
  }, [configuration, elements, isAcrylic, isTextil, stageRef, autoRotate]);

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

  const thicknessLabel = isTextil
    ? 'Standard 180g - 320g'
    : material.thickness;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="w-full h-full relative flex-1 flex flex-col items-center justify-center select-none overflow-hidden bg-slate-950"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-4 z-50 bg-blue-950/80 backdrop-blur-md border-4 border-dashed border-blue-500 rounded-2xl flex flex-col items-center justify-center text-white space-y-3 pointer-events-none animate-pulse">
          <div className="p-4 bg-blue-600 rounded-full shadow-lg">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <span className="text-base font-bold tracking-wide">
            ¡Soltá tu imagen aquí para estampar en la superficie 3D!
          </span>
          <span className="text-xs text-blue-300">
            Cara activa: {(configuration.activeSide || 'frente').toUpperCase()} (360° Interactivo)
          </span>
        </div>
      )}

      {/* Top Floating Badge */}
      <div className="absolute top-4 z-20 flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-xs">
        <div className="flex items-center space-x-1.5 font-semibold text-blue-400">
          <Sparkles className="w-4 h-4" />
          <span>Vista 3D Realista</span>
        </div>

        <div className="h-3 w-px bg-slate-700" />

        <span className="text-slate-300 font-medium flex items-center space-x-1">
          <Box className="w-3.5 h-3.5 text-slate-400" />
          <span>Espesor: {thicknessLabel}</span>
        </span>

        <div className="h-3 w-px bg-slate-700" />

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full transition-all text-[11px] font-medium ${
            autoRotate
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'text-slate-400 hover:text-white bg-slate-800'
          }`}
        >
          <RotateCcw className="w-3 h-3" />
          <span>{autoRotate ? 'Rotando' : 'Pausado'}</span>
        </button>
      </div>

      {/* Three.js Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Controls Guidance */}
      <div className="absolute bottom-4 z-20 text-[11px] text-slate-400 font-medium bg-slate-900/60 backdrop-blur-xs px-3.5 py-1 rounded-full border border-slate-800 flex items-center space-x-1.5">
        <Info className="w-3 h-3 text-blue-400" />
        <span>Arrastrá con el mouse para rotar en 3D (360° Frente / Espalda) • Scroll para zoom</span>
      </div>
    </div>
  );
};
