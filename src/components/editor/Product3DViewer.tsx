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
    scene.background = isTextil ? null : new T.Color('#0F172A'); // Transparent for textile, deep slate for signage

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

      // Anatomical body curvature displacement on chest and torso
      const applyTorsoCurvature = (geo: any, maxDisplacement: number = 0.038) => {
        const pos = geo.attributes.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          const z = pos.getZ(i);

          const normX = Math.min(1, Math.abs(x) / (hw * 1.3));
          const archFactor = Math.max(0, 1 - normX * normX);
          const normY = Math.max(0, Math.min(1, (y + hh) / (2 * hh)));
          const chestFactor = Math.sin(normY * Math.PI * 0.85);
          const deltaZ = archFactor * chestFactor * maxDisplacement;

          if (z > 0.001) {
            pos.setZ(i, z + deltaZ);
          } else if (z < -0.001) {
            pos.setZ(i, z - deltaZ * 0.7);
          }
        }
        geo.computeVertexNormals();
      };

      const garmentShape = new T.Shape();

      if (productId === 'textil-hoodie') {
        // --- REALISTIC 3D HOODIE MESH ASSEMBLY ---
        const bodyDepth = 0.09;

        // Bottom hem with natural curve
        garmentShape.moveTo(hw * 1.02, -hh);
        garmentShape.quadraticCurveTo(0, -hh * 1.025, -hw * 1.02, -hh);
        // Left hip to underarm with slight waist taper
        garmentShape.quadraticCurveTo(-hw * 0.96, -hh * 0.2, -hw * 1.02, hh * 0.25);
        // Left underarm curve to long sleeve cuff (hanging naturally downward)
        garmentShape.quadraticCurveTo(-hw * 1.15, hh * 0.1, -hw * 1.38, -hh * 0.28);
        // Left sleeve cuff opening
        garmentShape.quadraticCurveTo(-hw * 1.48, -hh * 0.20, -hw * 1.52, -hh * 0.12);
        // Left outer sleeve curve up to deltoid/shoulder
        garmentShape.quadraticCurveTo(-hw * 1.46, hh * 0.38, -hw * 0.96, hh * 0.76);
        // Left shoulder slope to hood neckline
        garmentShape.quadraticCurveTo(-hw * 0.65, hh * 0.86, -hw * 0.36, hh * 0.84);
        // Volumetric hood top dome
        garmentShape.quadraticCurveTo(-hw * 0.30, hh * 1.30, 0, hh * 1.35);
        garmentShape.quadraticCurveTo(hw * 0.30, hh * 1.30, hw * 0.36, hh * 0.84);
        // Right shoulder slope to deltoid
        garmentShape.quadraticCurveTo(hw * 0.65, hh * 0.86, hw * 0.96, hh * 0.76);
        // Right outer sleeve down
        garmentShape.quadraticCurveTo(hw * 1.46, hh * 0.38, hw * 1.52, -hh * 0.12);
        // Right sleeve cuff opening
        garmentShape.quadraticCurveTo(hw * 1.48, -hh * 0.20, hw * 1.38, -hh * 0.28);
        // Right underarm curve into torso
        garmentShape.quadraticCurveTo(hw * 1.15, hh * 0.1, hw * 1.02, hh * 0.25);
        // Right torso waist to bottom hem
        garmentShape.quadraticCurveTo(hw * 0.96, -hh * 0.2, hw * 1.02, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 4,
          bevelSize: 0.02,
          bevelThickness: 0.02,
        });
        applyTorsoCurvature(geometry, 0.04);
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // 3D Kangaroo Pouch Pocket mounted on front lower torso
        const pocketShape = new T.Shape();
        const pw = hw * 0.62;
        const ph = hh * 0.35;
        pocketShape.moveTo(pw, -hh + 0.03);
        pocketShape.lineTo(pw * 0.72, -hh + ph);
        pocketShape.quadraticCurveTo(0, -hh + ph + 0.02, -pw * 0.72, -hh + ph);
        pocketShape.lineTo(-pw, -hh + 0.03);
        pocketShape.quadraticCurveTo(0, -hh + 0.01, pw, -hh + 0.03);
        pocketShape.closePath();

        const pocketGeo = new T.ExtrudeGeometry(pocketShape, {
          depth: 0.022,
          bevelEnabled: true,
          bevelSegments: 3,
          bevelSize: 0.008,
          bevelThickness: 0.008,
        });
        applyTorsoCurvature(pocketGeo, 0.03);
        const pocketMesh = new T.Mesh(pocketGeo, garmentMaterial);
        pocketMesh.position.set(0, 0, bodyDepth / 2 + 0.01);
        pocketMesh.castShadow = true;
        boardGroup.add(pocketMesh);

        // 3D Hood Dome Shell on back collar
        const hoodShellGeo = new T.SphereGeometry(hw * 0.40, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
        const hoodShellMesh = new T.Mesh(hoodShellGeo, garmentMaterial);
        hoodShellMesh.position.set(0, hh * 0.88, -bodyDepth / 2 - 0.04);
        hoodShellMesh.rotation.x = -Math.PI / 4;
        hoodShellMesh.scale.set(1, 1.15, 0.95);
        hoodShellMesh.castShadow = true;
        boardGroup.add(hoodShellMesh);

        frontZPos = bodyDepth / 2 + 0.045;
        backZPos = -bodyDepth / 2 - 0.035;

      } else if (productId === 'textil-pulover') {
        // --- REALISTIC 3D SWEATER / PULOVER MESH ASSEMBLY ---
        const bodyDepth = 0.075;

        // Bottom hem
        garmentShape.moveTo(hw * 0.96, -hh);
        garmentShape.quadraticCurveTo(0, -hh * 1.025, -hw * 0.96, -hh);
        // Left hip to waist to underarm
        garmentShape.quadraticCurveTo(-hw * 0.90, -hh * 0.2, -hw * 0.98, hh * 0.26);
        // Left underarm to long sleeve cuff
        garmentShape.quadraticCurveTo(-hw * 1.12, hh * 0.1, -hw * 1.36, -hh * 0.24);
        // Left sleeve cuff
        garmentShape.quadraticCurveTo(-hw * 1.45, -hh * 0.16, -hw * 1.48, -hh * 0.08);
        // Left outer sleeve up to shoulder/deltoid
        garmentShape.quadraticCurveTo(-hw * 1.42, hh * 0.42, -hw * 0.94, hh * 0.78);
        // Left shoulder slope to collar
        garmentShape.quadraticCurveTo(-hw * 0.65, hh * 0.90, -hw * 0.34, hh * 0.86);
        // V-Neck collar notch down to center
        garmentShape.lineTo(0, hh * 0.48);
        // V-Neck collar notch up to right collar
        garmentShape.lineTo(hw * 0.34, hh * 0.86);
        // Right shoulder slope to deltoid
        garmentShape.quadraticCurveTo(hw * 0.65, hh * 0.90, hw * 0.94, hh * 0.78);
        // Right outer sleeve down
        garmentShape.quadraticCurveTo(hw * 1.42, hh * 0.42, hw * 1.48, -hh * 0.08);
        // Right sleeve cuff
        garmentShape.quadraticCurveTo(hw * 1.45, -hh * 0.16, hw * 1.36, -hh * 0.24);
        // Right underarm to torso
        garmentShape.quadraticCurveTo(hw * 1.12, hh * 0.1, hw * 0.98, hh * 0.26);
        // Right torso to bottom hem
        garmentShape.quadraticCurveTo(hw * 0.90, -hh * 0.2, hw * 0.96, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 4,
          bevelSize: 0.018,
          bevelThickness: 0.018,
        });
        applyTorsoCurvature(geometry, 0.038);
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // V-Neck 3D Trim Rib Band
        const vTrimShape = new T.Shape();
        vTrimShape.moveTo(-hw * 0.34, hh * 0.86);
        vTrimShape.lineTo(0, hh * 0.48);
        vTrimShape.lineTo(hw * 0.34, hh * 0.86);
        vTrimShape.lineTo(hw * 0.38, hh * 0.86);
        vTrimShape.lineTo(0, hh * 0.43);
        vTrimShape.lineTo(-hw * 0.38, hh * 0.86);
        vTrimShape.closePath();

        const vTrimGeo = new T.ExtrudeGeometry(vTrimShape, {
          depth: 0.018,
          bevelEnabled: true,
          bevelSegments: 2,
          bevelSize: 0.005,
          bevelThickness: 0.005,
        });
        applyTorsoCurvature(vTrimGeo, 0.038);
        const vTrimMesh = new T.Mesh(vTrimGeo, garmentMaterial);
        vTrimMesh.position.set(0, 0, bodyDepth / 2 + 0.006);
        boardGroup.add(vTrimMesh);

        frontZPos = bodyDepth / 2 + 0.045;
        backZPos = -bodyDepth / 2 - 0.035;

      } else {
        // --- REALISTIC 3D REMERA (T-SHIRT) MESH ASSEMBLY ---
        const bodyDepth = 0.075;

        // Bottom hem with natural curve
        garmentShape.moveTo(hw * 0.96, -hh);
        garmentShape.quadraticCurveTo(0, -hh * 1.025, -hw * 0.96, -hh);
        // Left hip to waist to underarm
        garmentShape.quadraticCurveTo(-hw * 0.90, -hh * 0.2, -hw * 0.96, hh * 0.28);
        // Left underarm curve to sleeve cuff inner (hanging naturally downward)
        garmentShape.quadraticCurveTo(-hw * 1.06, hh * 0.24, -hw * 1.28, hh * 0.02);
        // Left sleeve cuff opening (soft curve)
        garmentShape.quadraticCurveTo(-hw * 1.38, hh * 0.12, -hw * 1.44, hh * 0.24);
        // Left outer sleeve up to shoulder/deltoid
        garmentShape.quadraticCurveTo(-hw * 1.35, hh * 0.52, -hw * 0.94, hh * 0.78);
        // Left shoulder slope to collar
        garmentShape.quadraticCurveTo(-hw * 0.65, hh * 0.90, -hw * 0.35, hh * 0.85);
        // Crewneck scoop collar curve
        garmentShape.quadraticCurveTo(0, hh * 0.52, hw * 0.35, hh * 0.85);
        // Right shoulder slope to deltoid
        garmentShape.quadraticCurveTo(hw * 0.65, hh * 0.90, hw * 0.94, hh * 0.78);
        // Right outer sleeve down
        garmentShape.quadraticCurveTo(hw * 1.35, hh * 0.52, hw * 1.44, hh * 0.24);
        // Right sleeve cuff opening
        garmentShape.quadraticCurveTo(hw * 1.38, hh * 0.12, hw * 1.28, hh * 0.02);
        // Right underarm curve to torso
        garmentShape.quadraticCurveTo(hw * 1.06, hh * 0.24, hw * 0.96, hh * 0.28);
        // Right torso waist to bottom hem
        garmentShape.quadraticCurveTo(hw * 0.90, -hh * 0.2, hw * 0.96, -hh);
        garmentShape.closePath();

        geometry = new T.ExtrudeGeometry(garmentShape, {
          depth: bodyDepth,
          bevelEnabled: true,
          bevelSegments: 5,
          steps: 4,
          bevelSize: 0.02,
          bevelThickness: 0.02,
        });
        applyTorsoCurvature(geometry, 0.038);
        mainMesh = new T.Mesh(geometry, garmentMaterial);
        mainMesh.position.z = -bodyDepth / 2;

        // 3D Crewneck Collar Ring
        const collarGeo = new T.TorusGeometry(hw * 0.34, 0.015, 16, 48, Math.PI * 1.2);
        const collarMesh = new T.Mesh(collarGeo, garmentMaterial);
        collarMesh.position.set(0, hh * 0.68, bodyDepth / 2 + 0.025);
        collarMesh.rotation.x = Math.PI * 0.60;
        boardGroup.add(collarMesh);

        frontZPos = bodyDepth / 2 + 0.045;
        backZPos = -bodyDepth / 2 - 0.035;
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
      opacity: 1.0,
      depthWrite: false,
      alphaTest: 0.05,
    });

    const backImprintMaterial = new T.MeshBasicMaterial({
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      alphaTest: 0.05,
    });

    let frontPlane: any = null;
    let backPlane: any = null;

    if (isTextil) {
      const hh = h3D / 2;
      // Chest print area matching 2D safe area aspect ratio (170x255 => 2:3)
      const imprintW = w3D * 0.48;
      const imprintH = imprintW * 1.5;
      const imprintGeo = new T.PlaneGeometry(imprintW, imprintH);

      // Front Imprint Plane (Chest Area)
      frontPlane = new T.Mesh(imprintGeo, frontImprintMaterial);
      frontPlane.position.set(0, hh * 0.02, frontZPos);
      frontPlane.visible = false;
      boardGroup.add(frontPlane);

      // Back Imprint Plane (Dorsal Area)
      backPlane = new T.Mesh(imprintGeo, backImprintMaterial);
      backPlane.position.set(0, hh * 0.02, backZPos);
      backPlane.rotation.y = Math.PI;
      backPlane.visible = false;
      boardGroup.add(backPlane);

    } else {
      // Single Front Imprint Plane for Signage / Stickers
      const imprintGeo = new T.PlaneGeometry(w3D, h3D);
      frontPlane = new T.Mesh(imprintGeo, frontImprintMaterial);
      frontPlane.position.set(0, 0, frontZPos);
      frontPlane.visible = false;
      boardGroup.add(frontPlane);
    }

    // Capture Front & Back Konva Stage Textures
    const stage = stageRef.current;
    if (stage) {
      try {
        const bgNodes = stage.find('.product-bg');
        bgNodes.forEach((node: any) => node.hide());

        // Hide transformers and alignment guides so they don't get printed on 3D mesh
        const transformers = stage.find('Transformer');
        transformers.forEach((node: any) => node.hide());
        const guides = stage.find('.alignment-guides-layer');
        guides.forEach((node: any) => node.hide());

        const loader = new T.TextureLoader();

        if (isTextil) {
          const frontElements = elements.filter(
            (el) => (el.side || 'frente') === 'frente' || el.side === 'ambos'
          );
          const backElements = elements.filter(
            (el) => el.side === 'espalda' || el.side === 'ambos'
          );

          // 1. Capture Front Side Elements only if they exist
          if (frontElements.length > 0) {
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
              if (frontPlane) frontPlane.visible = true;
            });
          } else {
            if (frontPlane) frontPlane.visible = false;
          }

          // 2. Capture Back Side Elements only if they exist
          if (backElements.length > 0) {
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
              if (backPlane) backPlane.visible = true;
            });
          } else {
            if (backPlane) backPlane.visible = false;
          }

          // Restore node visibility
          bgNodes.forEach((node: any) => node.show());
          transformers.forEach((node: any) => node.show());
          guides.forEach((node: any) => node.show());
          elements.forEach((el) => {
            const node = stage.findOne('#' + el.id);
            if (node) node.show();
          });

        } else {
          // Capture All Elements for General Products / Adhesivos
          if (elements.length > 0) {
            const dataUrl = stage.toDataURL({ pixelRatio: 2 });
            loader.load(dataUrl, (tex: any) => {
              tex.colorSpace = T.SRGBColorSpace;
              tex.needsUpdate = true;
              frontImprintMaterial.map = tex;
              frontImprintMaterial.needsUpdate = true;
              if (frontPlane) frontPlane.visible = true;
            });
          } else {
            if (frontPlane) frontPlane.visible = false;
          }

          bgNodes.forEach((node: any) => node.show());
          transformers.forEach((node: any) => node.show());
          guides.forEach((node: any) => node.show());
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

  if (isTextil) {
    return (
      <div
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
              ¡Soltá tu imagen aquí para estampar en la superficie 3D!
            </span>
          </div>
        )}

        {/* Textile Card Frame matching Pacdora */}
        <div className="relative w-[640px] max-w-[90vw] aspect-[4/3] rounded-[28px] border border-gray-300 shadow-xl overflow-hidden bg-white flex items-center justify-center">
          {/* Background Checkerboard Transparency Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:14px_14px] bg-[position:0_0,0_7px,7px_-7px,-7px_0px] pointer-events-none" />

          {/* Top-Left 3D Active Badge */}
          <div
            className="absolute top-3.5 left-3.5 z-30 flex flex-col items-center justify-center bg-blue-600 text-white shadow-xs border border-blue-500 rounded-xl px-2 py-1 select-none"
            title="Vista 3D activa (Arrastrá para rotar 360°)"
          >
            <span className="text-[11px] font-black leading-none tracking-tight">3D</span>
            <svg className="w-5 h-2.5 text-white mt-0.5" viewBox="0 0 24 12" fill="none">
              <path d="M2 7 C2 12 22 12 22 7 C22 3 13 3 7 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 3 L8 5.5 L4.5 8" fill="currentColor" />
            </svg>
          </div>

          {/* Three.js Mount Container */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing z-10" />

          {/* Bottom Controls Guidance */}
          <div className="absolute bottom-3 z-20 text-[10px] text-slate-500 font-medium bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-gray-200 flex items-center space-x-1.5 shadow-xs">
            <Info className="w-3 h-3 text-blue-500" />
            <span>Arrastrá para rotar en 3D 360° • Rueda del mouse para zoom</span>
          </div>
        </div>
      </div>
    );
  }

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
