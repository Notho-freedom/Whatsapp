import { useState, useRef, useEffect, useCallback } from 'react';

export default function Splitter({ 
  onResize, 
  minWidth = 300, 
  maxWidth = 600, 
  initialWidth = 400,
  direction = 'horizontal' 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(initialWidth);
  const splitterRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));
    
    setWidth(newWidth);
    onResize?.(newWidth);
  }, [isDragging, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={splitterRef}
      className={`splitter relative select-none ${
        direction === 'horizontal' ? 'w-1' : 'h-1'
      }`}
      onMouseDown={handleMouseDown}
      style={{
        cursor: 'col-resize',
        zIndex: 10
      }}
    >
      {/* Indicateur visuel du splitter */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-0.5 h-8 bg-[#8696a0] rounded-full opacity-50" />
      </div>
      
      {/* Zone de drag étendue pour faciliter la saisie */}
      <div className="absolute inset-0" />
      
      {/* Overlay pendant le drag */}
      {isDragging && (
        <div className="fixed inset-0 bg-transparent z-50" style={{ cursor: 'col-resize' }} />
      )}
    </div>
  );
}
