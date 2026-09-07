import * as THREE from 'three';
import type { CanvasShape } from '../types';

/**
 * Returns SVG Path string for 2D Konva rendering of custom product shapes.
 */
export function getShapeSvgPath(
  shape: CanvasShape,
  w: number,
  h: number
): string {
  if (shape === 'escudo') {
    // Heraldic Shield / Badge SVG Path
    return `M 0,0 
            L ${w},0 
            L ${w},${h * 0.55} 
            C ${w},${h * 0.88} ${w * 0.7},${h} ${w / 2},${h} 
            C ${w * 0.3},${h} 0,${h * 0.88} 0,${h * 0.55} 
            Z`;
  }

  if (shape === 'ovalado') {
    // SVG Ellipse Path
    const rx = w / 2;
    const ry = h / 2;
    return `M 0,${ry} 
            a ${rx},${ry} 0 1,0 ${w},0 
            a ${rx},${ry} 0 1,0 -${w},0`;
  }

  if (shape === 'circular') {
    const r = Math.min(w, h) / 2;
    const cx = w / 2;
    const cy = h / 2;
    return `M ${cx - r},${cy} 
            a ${r},${r} 0 1,0 ${r * 2},0 
            a ${r},${r} 0 1,0 -${r * 2},0`;
  }

  // Default rectangle
  return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
}

/**
 * Builds a 3D Three.js Shape centered at (0,0) matching the product contour.
 */
export function create3DShape(
  shape: CanvasShape,
  w3D: number,
  h3D: number
): THREE.Shape {
  const threeShape = new THREE.Shape();
  const hw = w3D / 2;
  const hh = h3D / 2;

  if (shape === 'escudo') {
    // Shield 3D Shape centered at (0,0)
    threeShape.moveTo(-hw, hh);
    threeShape.lineTo(hw, hh);
    threeShape.lineTo(hw, -hh * 0.1);
    threeShape.quadraticCurveTo(hw, -hh * 0.75, 0, -hh);
    threeShape.quadraticCurveTo(-hw, -hh * 0.75, -hw, -hh * 0.1);
    threeShape.closePath();
  } else if (shape === 'ovalado') {
    // Oval / Ellipse 3D Shape
    threeShape.absellipse(0, 0, hw, hh, 0, Math.PI * 2, false, 0);
  } else if (shape === 'circular') {
    // Circle 3D Shape
    const r = Math.min(hw, hh);
    threeShape.absarc(0, 0, r, 0, Math.PI * 2, false);
  } else if (shape === 'troquelado') {
    // Rounded Die-Cut 3D Shape
    const radius = Math.min(hw, hh) * 0.2;
    threeShape.moveTo(-hw + radius, hh);
    threeShape.lineTo(hw - radius, hh);
    threeShape.quadraticCurveTo(hw, hh, hw, hh - radius);
    threeShape.lineTo(hw, -hh + radius);
    threeShape.quadraticCurveTo(hw, -hh, hw - radius, -hh);
    threeShape.lineTo(-hw + radius, -hh);
    threeShape.quadraticCurveTo(-hw, -hh, -hw, -hh + radius);
    threeShape.lineTo(-hw, hh - radius);
    threeShape.quadraticCurveTo(-hw, hh, -hw + radius, hh);
  } else {
    // Standard Rectangular 3D Shape
    threeShape.moveTo(-hw, hh);
    threeShape.lineTo(hw, hh);
    threeShape.lineTo(hw, -hh);
    threeShape.lineTo(-hw, -hh);
    threeShape.closePath();
  }

  return threeShape;
}
