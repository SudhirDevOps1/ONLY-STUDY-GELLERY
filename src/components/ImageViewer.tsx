import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Maximize, Minimize } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt: string;
  fallbackUrl?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, fallbackUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.25, 5)), []);
  const handleZoomOut = useCallback(() => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 0.5);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);
  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

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

  // Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  }, [isDragging, zoom]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta));
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  // Double click
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoom === 1) {
      setZoom(2);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({
          x: -((e.clientX - rect.left - rect.width / 2) * 0.5),
          y: -((e.clientY - rect.top - rect.height / 2) * 0.5)
        });
      }
    } else {
      handleReset();
    }
  }, [zoom, handleReset]);

  // Image load
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (imageRef.current) {
      setImageSize({ width: imageRef.current.naturalWidth, height: imageRef.current.naturalHeight });
    }
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

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
      container.addEventListener('wheel', handleWheel, { passive: false });
      show();
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', show);
        container.removeEventListener('wheel', handleWheel);
      }
      clearTimeout(timeout);
    };
  }, [handleWheel]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Loading spinner */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Error - redirect to source webpage */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 p-4 text-center">
          <svg className="w-16 h-16 mb-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-white font-semibold mb-1">Image cannot be displayed here</p>
          <p className="text-gray-400 text-sm mb-4">It may be protected or require login. Open it directly:</p>
          <a
            href={fallbackUrl || src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm"
          >
            🔗 Open on Source Website
          </a>
        </div>
      )}

      {/* Image - FULL size with proper constraints */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`select-none transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transitionDuration: isDragging ? '0ms' : '200ms',
          cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'zoom-in',
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={false}
      />

      {/* Zoom Controls */}
      <div
        className={`absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-2 bg-black/80 backdrop-blur-md rounded-full px-2 sm:px-4 py-1.5 sm:py-2 z-10 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
          <span className="text-white text-xs sm:text-sm font-mono min-w-[40px] sm:min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          {zoom > 1 && (
            <span className="hidden sm:flex text-[10px] text-gray-400 items-center gap-1">
              <Move className="w-3 h-3" />
              Drag to pan
            </span>
          )}
        </div>

        <button
          onClick={handleZoomIn}
          disabled={zoom >= 5}
          className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

        <button onClick={handleReset} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Reset">
          <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-white/20 mx-0.5 sm:mx-1" />

        <button onClick={toggleFullscreen} className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full text-white transition-colors" title="Fullscreen">
          {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>

      {/* Info overlay */}
      {imageLoaded && imageSize.width > 0 && (
        <div
          className={`absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/60 backdrop-blur-md rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-white text-[10px] sm:text-xs transition-opacity duration-300 ${
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

export default ImageViewer;
