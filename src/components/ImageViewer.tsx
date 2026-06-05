import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Maximize, Minimize } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  onZoomChange?: (zoom: number) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onZoomChange }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });

  // Update parent component with zoom level
  useEffect(() => {
    onZoomChange?.(zoom);
  }, [zoom, onZoomChange]);

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.min(prev + 0.25, 5);
      return newZoom;
    });
  }, []);

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Reset zoom and position
  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Mouse down - start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      lastPosition.current = { ...position };
    }
  }, [zoom, position]);

  // Mouse move - drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      // Limit pan boundaries
      const maxX = (imageSize.width * (zoom - 1)) / 2;
      const maxY = (imageSize.height * (zoom - 1)) / 2;
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      });
    }
  }, [isDragging, zoom, imageSize]);

  // Mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta));
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Image load handler
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
    }
  }, []);

  // Double click to zoom
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (zoom === 1) {
      // Zoom in to 2x at click position
      setZoom(2);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - rect.width / 2) * 0.5;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.5;
        setPosition({ x: -x, y: -y });
      }
    } else {
      handleReset();
    }
  }, [zoom, handleReset]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const show = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', show);
      show();
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', show);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* Loading spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`max-w-none max-h-none object-contain transition-transform duration-100 select-none ${
          isDragging ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          width: 'auto',
          height: 'auto',
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
        onLoad={handleImageLoad}
        draggable={false}
      />

      {/* Zoom Controls */}
      <div 
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/80 backdrop-blur-md rounded-full px-4 py-2 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ControlButton 
          onClick={handleZoomOut} 
          disabled={zoom <= 0.5}
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5" />
        </ControlButton>

        <div className="flex items-center gap-2 px-3">
          <span className="text-white text-sm font-mono min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          {zoom > 1 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Move className="w-3 h-3" />
              Drag to pan
            </span>
          )}
        </div>

        <ControlButton 
          onClick={handleZoomIn} 
          disabled={zoom >= 5}
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5" />
        </ControlButton>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ControlButton onClick={handleReset} title="Reset">
          <RotateCcw className="w-5 h-5" />
        </ControlButton>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <ControlButton onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </ControlButton>
      </div>

      {/* Info overlay */}
      {imageLoaded && (
        <div 
          className={`absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 text-white text-xs transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div>{imageSize.width} × {imageSize.height}</div>
          <div className="text-gray-400">Double-click to {zoom === 1 ? 'zoom' : 'reset'}</div>
        </div>
      )}
    </div>
  );
};

// Control button component
const ControlButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}> = ({ onClick, children, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    title={title}
  >
    {children}
  </button>
);

export default ImageViewer;
