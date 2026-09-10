import React from 'react';

interface RealisticGarmentMockupProps {
  productId: string;
  garmentColor: string;
  activeSide?: 'frente' | 'espalda' | 'ambos';
  children?: React.ReactNode;
  hasElements?: boolean;
  onUploadClick?: () => void;
  width?: number;
  height?: number;
}

export const RealisticGarmentMockup: React.FC<RealisticGarmentMockupProps> = ({
  productId = 'textil-remera',
  garmentColor = '#F3E8FF',
  activeSide = 'frente',
  children,
  hasElements = false,
  onUploadClick,
  width = 540,
  height = 580,
}) => {
  const isBack = activeSide === 'espalda';
  const isHoodie = productId === 'textil-hoodie';
  const isSweater = productId === 'textil-pulover';

  // Compute contrast color for text/guidelines
  const isDarkGarment = ['#000000', '#0F172A', '#1E293B', '#1E3A8A', '#064E3B', '#4C1D95'].includes(
    garmentColor.toUpperCase()
  );

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <svg
        viewBox="0 0 600 640"
        className="w-full h-full drop-shadow-2xl overflow-visible transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Ambient Drop Shadow */}
          <filter id="garmentShadow" x="-10%" y="-10%" width="125%" height="125%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#000000" floodOpacity="0.18" />
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.1" />
          </filter>

          {/* Left / Right 3D Cylindrical Shading Gradients */}
          <linearGradient id="body3DShade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.28" />
            <stop offset="12%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="88%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </linearGradient>

          {/* Sleeve Left Shading */}
          <linearGradient id="leftSleeveGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          {/* Sleeve Right Shading */}
          <linearGradient id="rightSleeveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          {/* Collar Shadow onto Chest */}
          <linearGradient id="collarDropShadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>

          {/* Subtle Fabric Fold Texture Gradient */}
          <linearGradient id="drapeFold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.06" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* 1. Base Garment Silhouette Group with Drop Shadow */}
        <g filter="url(#garmentShadow)">
          {/* Main Torso & Sleeves Path */}
          {isHoodie ? (
            /* Hoodie Silhouette */
            <path
              d="M 210,105 
                 C 235,120 365,120 390,105 
                 L 460,135 L 530,295 L 465,325 L 435,245 L 435,560 
                 Q 300,575 165,560 
                 L 165,245 L 135,325 L 70,295 L 140,135 Z"
              fill={garmentColor}
            />
          ) : isSweater ? (
            /* Sweater Silhouette */
            <path
              d="M 215,95 
                 C 255,108 345,108 385,95 
                 L 455,128 L 520,290 L 460,318 L 430,240 L 430,555 
                 Q 300,570 170,555 
                 L 170,240 L 140,318 L 80,290 L 145,128 Z"
              fill={garmentColor}
            />
          ) : (
            /* Realistic Pacdora T-Shirt Silhouette */
            <path
              d="M 225,92 
                 C 260,112 340,112 375,92 
                 L 440,126 L 505,275 L 445,305 L 418,235 L 418,555 
                 Q 300,572 182,555 
                 L 182,235 L 155,305 L 95,275 L 160,126 Z"
              fill={garmentColor}
            />
          )}

          {/* Contrast White / Draped Sleeves Base (Matching realistic Pacdora look) */}
          {/* Left Sleeve Drape Layer */}
          <path
            d="M 225,92 L 160,126 L 95,275 L 155,305 L 182,235 L 210,130 Z"
            fill="#FFFFFF"
            opacity="0.92"
          />
          {/* Right Sleeve Drape Layer */}
          <path
            d="M 375,92 L 440,126 L 505,275 L 445,305 L 418,235 L 390,130 Z"
            fill="#FFFFFF"
            opacity="0.92"
          />

          {/* Sleeve Shading & Creases */}
          <path
            d="M 225,92 L 160,126 L 95,275 L 155,305 L 182,235 L 210,130 Z"
            fill="url(#leftSleeveGrad)"
          />
          <path
            d="M 375,92 L 440,126 L 505,275 L 445,305 L 418,235 L 390,130 Z"
            fill="url(#rightSleeveGrad)"
          />

          {/* Sleeve Natural Fold Lines */}
          <path
            d="M 125,240 Q 145,230 170,245"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M 115,200 Q 140,190 162,210"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />
          <path
            d="M 475,240 Q 455,230 430,245"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M 485,200 Q 460,190 438,210"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.35"
          />

          {/* Sleeve Cuff Seams */}
          <path
            d="M 98,272 L 153,300"
            stroke="#64748B"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <path
            d="M 502,272 L 447,300"
            stroke="#64748B"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </g>

        {/* 2. Realistic 3D Torso Volume Shading Overlay */}
        <g>
          {/* Cylindrical Torso Shading */}
          <path
            d="M 215,95 L 385,95 L 418,235 L 418,555 Q 300,572 182,555 L 182,235 Z"
            fill="url(#body3DShade)"
            style={{ mixBlendMode: 'multiply' }}
          />

          {/* Soft Vertical Fabric Drapery Folds */}
          <path
            d="M 255,210 Q 248,380 252,558"
            stroke="#000000"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.04"
            filter="blur(4px)"
          />
          <path
            d="M 345,210 Q 352,380 348,558"
            stroke="#000000"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
            opacity="0.04"
            filter="blur(4px)"
          />
          <path
            d="M 300,240 Q 303,400 298,564"
            stroke="#FFFFFF"
            strokeWidth="20"
            strokeLinecap="round"
            fill="none"
            opacity="0.1"
            filter="blur(6px)"
          />

          {/* Bottom Hem Seam Stitching */}
          <path
            d="M 184,545 Q 300,562 416,545"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            fill="none"
            opacity="0.45"
          />
          <path
            d="M 183,550 Q 300,567 417,550"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            fill="none"
            opacity="0.45"
          />
        </g>

        {/* 3. Collar Assembly & Realistic Ribbed Neckline */}
        <g>
          {/* Dark Inner Neck Shadow (inside the shirt) */}
          <path
            d="M 225,92 C 260,65 340,65 375,92 C 340,110 260,110 225,92 Z"
            fill="#3F3F46"
            opacity={isBack ? 0 : 0.85}
          />

          {/* Inside Neck Collar Label / Brand Stitch (faint) */}
          {!isBack && (
            <rect
              x="285"
              y="74"
              width="30"
              height="16"
              rx="2"
              fill="#E4E4E7"
              opacity="0.6"
            />
          )}

          {/* Front Collar Cast Shadow onto Chest */}
          {!isBack && (
            <path
              d="M 225,92 C 260,135 340,135 375,92 C 340,118 260,118 225,92 Z"
              fill="url(#collarDropShadow)"
            />
          )}

          {/* Crewneck Ribbed Band */}
          <path
            d="M 225,92 
               C 260,114 340,114 375,92 
               C 344,124 256,124 225,92 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />

          {/* Inner Collar Stitch Line */}
          <path
            d="M 228,94 C 260,118 340,118 372,94"
            stroke="#94A3B8"
            strokeWidth="1.2"
            strokeDasharray="3,2"
            fill="none"
            opacity="0.6"
          />

          {/* Collar Ribbing Texture Lines */}
          <path
            d="M 250,99 L 248,106 M 270,105 L 269,113 M 290,107 L 290,116 M 310,107 L 310,116 M 330,105 L 331,113 M 350,99 L 352,106"
            stroke="#CBD5E1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Back Collar Rim if Back Side */}
          {isBack && (
            <path
              d="M 225,92 C 260,82 340,82 375,92 C 340,102 260,102 225,92 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />
          )}
        </g>

        {/* 4. Kangaroo Pocket for Hoodie */}
        {isHoodie && !isBack && (
          <g>
            <path
              d="M 215,380 L 385,380 L 405,480 L 195,480 Z"
              fill={garmentColor}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity="0.9"
            />
          </g>
        )}

        {/* 5. Safe Print Area Boundary (Subtle Dashed Guide matching Pacdora) */}
        <rect
          x="215"
          y="180"
          width="170"
          height="255"
          rx="4"
          fill="none"
          stroke={isDarkGarment ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.15)'}
          strokeWidth="1"
          strokeDasharray="4,4"
          className="pointer-events-none"
        />

        {/* 6. Empty State Placeholder text matching Pacdora: 'Sube tu imagen / 789 × 1186 px' */}
        {!hasElements && (
          <g
            className="cursor-pointer transition-opacity hover:opacity-80"
            onClick={onUploadClick}
          >
            <text
              x="300"
              y="295"
              textAnchor="middle"
              className="text-lg font-semibold"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '18px',
                fontWeight: 500,
                fill: isDarkGarment ? '#F8FAFC' : '#1E293B',
              }}
            >
              Sube tu imagen
            </text>
            <text
              x="300"
              y="325"
              textAnchor="middle"
              className="text-sm font-normal"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '15px',
                fontWeight: 400,
                fill: isDarkGarment ? '#94A3B8' : '#475569',
              }}
            >
              789 × 1186 px
            </text>
          </g>
        )}
      </svg>

      {/* 7. Konva Interactive Layer Children (Text, Images, Transformers) */}
      <div
        className="absolute"
        style={{
          left: '35.8%',
          top: '28.1%',
          width: '28.4%',
          height: '39.8%',
        }}
      >
        {children}
      </div>
    </div>
  );
};
