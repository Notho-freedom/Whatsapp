'use client';

import { useCallback } from 'react';

export default function StatusCircle({ statusCircles, size = 'default', children }) {
  // Mémoïsation du composant SegmentedRing (exactement comme dans l'exemple fourni)
  const SegmentedRing = useCallback(({ segments = 1, radius = 24, stroke = 2, color = '#3B82F6', active = true }) => {
    const size = radius * 2 + stroke * 4;
    const circumference = 2 * Math.PI * radius;
    const gap = circumference * 0.02;
    const dashLength = (circumference - gap * segments) / segments;

    return (
      <svg width={size} height={size} className="absolute">
        {Array.from({ length: segments }).map((_, i) => (
          <circle
            key={i}
            r={radius}
            cx={size / 2}
            cy={size / 2}
            fill="none"
            stroke={active ? color : '#b4b4b4'}
            strokeWidth={stroke}
            strokeDasharray={`${dashLength} ${circumference}`}
            strokeDashoffset={-((dashLength + gap) * i)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ))}
      </svg>
    );
  }, []);

  if (!statusCircles || statusCircles.total === 0) {
    // Si pas de statuts, retourner juste les enfants (avatar) sans bordure
    return children || null;
  }

  const { total, viewed, unviewed, hasUnviewed } = statusCircles;
  
  // Tailles des avatars et des cercles
  const avatarSizes = {
    small: 'w-8 h-8',
    default: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  const avatarSize = avatarSizes[size] || avatarSizes.default;
  
  // Dimensions pour le SVG
  const svgSize = size === 'small' ? 40 : size === 'large' ? 72 : 56;
  const radius = (svgSize - 6) / 2; // Rayon pour les arcs
  const strokeWidth = 2.5; // Épaisseur des segments

  // Si un seul statut, utiliser aussi SegmentedRing avec 1 segment
  if (total === 1) {
    return (
      <div className="relative inline-block">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <SegmentedRing
            segments={1}
            radius={radius}
            stroke={strokeWidth}
            color="#1DAA61"
            active={hasUnviewed}
          />
          <div className={`${avatarSize} relative z-10`}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Pour plusieurs statuts, utiliser SegmentedRing (exactement comme dans l'exemple)
  return (
    <div className="relative inline-block">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <SegmentedRing
          segments={total}
          radius={radius}
          stroke={strokeWidth}
          color="#1DAA61"
          active={hasUnviewed}
        />
        <div className={`${avatarSize} relative z-10`}>
          {children}
        </div>
      </div>
    </div>
  );
}
