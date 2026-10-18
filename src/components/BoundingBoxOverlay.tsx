import React from 'react';
import { BoundingBox } from '../types';

interface BoundingBoxOverlayProps {
  boundingBoxes: BoundingBox[];
  visible: boolean;
  imageWidth?: number;
  imageHeight?: number;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  boundingBoxes,
  visible
}) => {
  if (!visible || !boundingBoxes || boundingBoxes.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        {boundingBoxes.map((box, idx) => {
          const [ymin, xmin, ymax, xmax] = box.box_2d;
          const width = Math.max(20, xmax - xmin);
          const height = Math.max(20, ymax - ymin);

          // Colors based on index
          const colors = [
            { stroke: '#EF4444', fill: 'rgba(239, 68, 68, 0.15)', textBg: '#DC2626' },
            { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.15)', textBg: '#D97706' },
            { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.15)', textBg: '#0891B2' }
          ];
          const color = colors[idx % colors.length];

          return (
            <g key={idx}>
              {/* Outer Glow */}
              <rect
                x={xmin}
                y={ymin}
                width={width}
                height={height}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth="4"
                strokeDasharray="6 3"
                rx="6"
              />
              {/* Corner brackets */}
              <path
                d={`M ${xmin} ${ymin + 24} L ${xmin} ${ymin} L ${xmin + 24} ${ymin}`}
                fill="none"
                stroke={color.stroke}
                strokeWidth="6"
              />
              <path
                d={`M ${xmax - 24} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + 24}`}
                fill="none"
                stroke={color.stroke}
                strokeWidth="6"
              />
              <path
                d={`M ${xmin} ${ymax - 24} L ${xmin} ${ymax} L ${xmin + 24} ${ymax}`}
                fill="none"
                stroke={color.stroke}
                strokeWidth="6"
              />
              <path
                d={`M ${xmax - 24} ${ymax} L ${xmax} ${ymax} L ${xmax} ${ymax - 24}`}
                fill="none"
                stroke={color.stroke}
                strokeWidth="6"
              />

              {/* Tag Label */}
              <rect
                x={xmin}
                y={Math.max(10, ymin - 38)}
                width={Math.min(320, width + 40)}
                height="32"
                fill={color.textBg}
                rx="4"
              />
              <text
                x={xmin + 10}
                y={Math.max(10, ymin - 38) + 21}
                fill="#ffffff"
                fontSize="18"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                {box.label} ({Math.round(box.confidence * 100)}%)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
