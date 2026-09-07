/**
 * Generates SVG path data strings for 2D Garment Silhouettes (T-Shirt, Hoodie, Sweater)
 * scaled to target canvas width and height.
 */

export function getTShirtPath(w: number, h: number, isBack: boolean = false): string {
  const hw = w / 2;
  const neckW = w * 0.22;
  const neckH = isBack ? h * 0.04 : h * 0.12;
  const shoulderY = h * 0.14;
  const sleeveWidth = w * 0.24;
  const sleeveDrop = h * 0.28;
  const armpitY = h * 0.35;

  return [
    `M ${hw - neckW} 0`,
    `Q ${hw} ${neckH} ${hw + neckW} 0`,
    `L ${w - sleeveWidth * 0.3} ${shoulderY}`,
    `L ${w} ${shoulderY + sleeveDrop * 0.6}`,
    `L ${w - sleeveWidth * 0.4} ${shoulderY + sleeveDrop}`,
    `L ${w * 0.85} ${armpitY}`,
    `L ${w * 0.85} ${h}`,
    `L ${w * 0.15} ${h}`,
    `L ${w * 0.15} ${armpitY}`,
    `L ${sleeveWidth * 0.4} ${shoulderY + sleeveDrop}`,
    `L 0 ${shoulderY + sleeveDrop * 0.6}`,
    `L ${sleeveWidth * 0.3} ${shoulderY}`,
    `Z`,
  ].join(' ');
}

export function getHoodiePath(w: number, h: number, isBack: boolean = false): string {
  const hw = w / 2;
  const hoodW = w * 0.25;
  const hoodTopY = isBack ? -h * 0.11 : -h * 0.08;
  const shoulderY = h * 0.15;
  const sleeveWidth = w * 0.28;
  const sleeveDrop = h * 0.55;
  const armpitY = h * 0.36;

  return [
    `M ${hw - hoodW} ${shoulderY}`,
    `C ${hw - hoodW * 1.2} ${hoodTopY * 1.2}, ${hw + hoodW * 1.2} ${hoodTopY * 1.2}, ${hw + hoodW} ${shoulderY}`,
    `L ${w - sleeveWidth * 0.2} ${shoulderY}`,
    `L ${w} ${shoulderY + sleeveDrop * 0.7}`,
    `L ${w - sleeveWidth * 0.5} ${shoulderY + sleeveDrop}`,
    `L ${w * 0.86} ${armpitY}`,
    `L ${w * 0.86} ${h}`,
    `L ${w * 0.14} ${h}`,
    `L ${w * 0.14} ${armpitY}`,
    `L ${sleeveWidth * 0.5} ${shoulderY + sleeveDrop}`,
    `L 0 ${shoulderY + sleeveDrop * 0.7}`,
    `L ${sleeveWidth * 0.2} ${shoulderY}`,
    `Z`,
  ].join(' ');
}

export function getSweaterPath(w: number, h: number, isBack: boolean = false): string {
  const hw = w / 2;
  const neckW = w * 0.2;
  const neckH = isBack ? h * 0.05 : h * 0.18;
  const shoulderY = h * 0.12;
  const sleeveWidth = w * 0.26;
  const sleeveDrop = h * 0.52;
  const armpitY = h * 0.34;

  return [
    `M ${hw - neckW} 0`,
    `L ${hw} ${neckH}`,
    `L ${hw + neckW} 0`,
    `L ${w - sleeveWidth * 0.2} ${shoulderY}`,
    `L ${w} ${shoulderY + sleeveDrop * 0.7}`,
    `L ${w - sleeveWidth * 0.5} ${shoulderY + sleeveDrop}`,
    `L ${w * 0.85} ${armpitY}`,
    `L ${w * 0.85} ${h}`,
    `L ${w * 0.15} ${h}`,
    `L ${w * 0.15} ${armpitY}`,
    `L ${sleeveWidth * 0.5} ${shoulderY + sleeveDrop}`,
    `L 0 ${shoulderY + sleeveDrop * 0.7}`,
    `L ${sleeveWidth * 0.2} ${shoulderY}`,
    `Z`,
  ].join(' ');
}

export function getKangarooPocketPath(w: number, h: number): string {
  const pw = w * 0.45;
  const ph = h * 0.28;
  const hw = w / 2;
  const bottomY = h * 0.95;
  const topY = bottomY - ph;

  return [
    `M ${hw - pw * 0.5} ${bottomY}`,
    `L ${hw - pw * 0.35} ${topY}`,
    `L ${hw + pw * 0.35} ${topY}`,
    `L ${hw + pw * 0.5} ${bottomY}`,
    `Z`,
  ].join(' ');
}
