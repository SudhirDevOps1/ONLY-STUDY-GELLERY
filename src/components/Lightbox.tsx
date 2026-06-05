import React, { useEffect, useState, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Heart, 
  Share2, 
  Copy, 
  Maximize, 
  Minimize,
  Info,
  ExternalLink,
  Calendar,
  Tag,
  Eye
} from 'lucide-react';
import { MediaItem } from '../types';
import { PlayerWrapper } from './PlayerWrapper';
import { ImageViewer } from './ImageViewer';
import { storage, copyToClipboard, formatNumber } from '../utils/storage';
import { downloadMedia } from '../utils/download';

interface LightboxProps {
  item: MediaItem;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ 
  item, 
  onClose, 
  onNext, 
  onPrev,
}) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(item.id));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false); // Fixed: Info panel closed by default, opens only on click
  const [showControls, setShowControls] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Track view count
  useEffect(() => {
    storage.incrementViewCount(item.id);
    storage.addToRecentViews(item.id);
    setViewCount(storage.getViewCount(item.id));
    setZoom(1);
  }, [item.id]);

  // Handle download
  const handleDownload = async () => {
    setDownloadStatus('loading');
    const result = await downloadMedia(item);
    setDownloadStatus(result.success ? 'success' : 'error');
    setDownloadMessage(result.message);
    setTimeout(() => setDownloadStatus('idle'), 3000);
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(item.src);
    setCopied(success);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: item.title, 
          text: item.description,
          url: item.src 
        });
      } catch {
        // User cancelled
      }
    } else {
      await handleCopyLink();
    }
  };

  const handleToggleFavorite = () => {
    const newState = storage.toggleFavorite(item.id);
    setIsFavorite(newState);
  };

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          handleDownload();
          break;
        case 'c':
        case 'C':
          if (!e.ctrlKey) {
            e.preventDefault();
            handleCopyLink();
          }
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowInfo(prev => !prev);
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev, toggleFullscreen, zoom]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 4000);
    };
    
    const handleMouseMove = () => resetTimer();
    window.addEventListener('mousemove', handleMouseMove);
    resetTimer();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Get file extension
  const getExtension = () => {
    const match = item.src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/i);
    return match ? match[1].toUpperCase() : item.type.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Top Bar */}
      <div 
        className={`absolute top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4">
          <div className="flex items-center justify-between max-w-[1800px] mx-auto">
            {/* Title & Meta */}
            <div className="flex items-center gap-4 text-white min-w-0 flex-1">
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{item.title}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                  {item.category && (
                    <span className="flex items-center gap-1 bg-blue-500/30 px-2 py-0.5 rounded-full">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  )}
                  <span className="capitalize bg-gray-700/50 px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="bg-gray-700/50 px-2 py-0.5 rounded-full">{getExtension()}</span>
                  {viewCount > 0 && (
                    <span className="flex items-center gap-1 bg-gray-700/50 px-2 py-0.5 rounded-full">
                      <Eye className="w-3 h-3" />
                      {formatNumber(viewCount)} views
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ActionButton
                onClick={handleToggleFavorite}
                active={isFavorite}
                activeClass="bg-pink-500"
                title={isFavorite ? 'Remove favorite' : 'Add favorite'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </ActionButton>

              <ActionButton
                onClick={handleCopyLink}
                active={copied}
                activeClass="bg-green-500"
                title="Copy link"
              >
                {copied ? <CheckIcon /> : <Copy className="w-5 h-5" />}
              </ActionButton>

              <ActionButton
                onClick={handleShare}
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </ActionButton>

              <ActionButton
                onClick={handleDownload}
                loading={downloadStatus === 'loading'}
                success={downloadStatus === 'success'}
                error={downloadStatus === 'error'}
                title="Download"
              >
                {downloadStatus === 'loading' ? (
                  <LoadingIcon />
                ) : downloadStatus === 'success' ? (
                  <CheckIcon />
                ) : downloadStatus === 'error' ? (
                  <ErrorIcon />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </ActionButton>

              <ActionButton
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </ActionButton>

              <ActionButton
                onClick={onClose}
                className="hover:bg-red-500/80"
                title="Close"
              >
                <X className="w-5 h-5" />
              </ActionButton>
            </div>
          </div>

          {/* Download message */}
          {downloadStatus !== 'idle' && downloadMessage && (
            <div className={`mt-2 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 ${
              downloadStatus === 'success' ? 'bg-green-500/90' : 
              downloadStatus === 'error' ? 'bg-red-500/90' : 'bg-blue-500/90'
            } text-white animate-slide-in`}>
              {downloadStatus === 'success' && <CheckIcon />}
              {downloadStatus === 'error' && <ErrorIcon />}
              {downloadMessage}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {onPrev && (
        <button
          onClick={onPrev}
          className={`absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-[60] hover:scale-110 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {onNext && (
        <button
          onClick={onNext}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all z-[60] hover:scale-110 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Main Content Area */}
      <div 
        className="w-full h-full flex items-center justify-center p-4 sm:p-20 overflow-hidden"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {item.type === 'image' ? (
          <ImageViewer src={item.src} alt={item.title} onZoomChange={setZoom} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayerWrapper item={item} isPlaying={isPlaying} isMuted={isMuted} />
          </div>
        )}
      </div>

      {/* Info Sidebar */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-[55] overflow-y-auto transition-transform duration-300 ${
          showInfo ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            {item.description && (
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Meta Info */}
          <div className="space-y-3">
            <InfoRow icon={<Tag className="w-4 h-4" />} label="Type" value={item.type} />
            <InfoRow icon={<Tag className="w-4 h-4" />} label="Category" value={item.category || 'Uncategorized'} />
            <InfoRow icon={<Eye className="w-4 h-4" />} label="Views" value={formatNumber(viewCount)} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Format" value={getExtension()} />
          </div>

          {/* Source URL */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Source URL</h4>
            <div className="text-xs text-gray-500 break-all font-mono bg-gray-900 rounded p-2 max-h-24 overflow-y-auto">
              {item.src}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => window.open(item.src, '_blank')}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              disabled={downloadStatus === 'loading'}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-green-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {downloadStatus === 'loading' ? (
                <LoadingIcon />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download
            </button>
            
            <button
              onClick={handleToggleFavorite}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isFavorite 
                  ? 'bg-pink-600 hover:bg-pink-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>

          {/* Keyboard Help */}
          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Keyboard Shortcuts</h4>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between"><span>← →</span><span>Navigate</span></div>
              <div className="flex justify-between"><span>Wheel</span><span>Zoom image</span></div>
              <div className="flex justify-between"><span>D</span><span>Download</span></div>
              <div className="flex justify-between"><span>C</span><span>Copy</span></div>
              <div className="flex justify-between"><span>F</span><span>Fullscreen</span></div>
              <div className="flex justify-between"><span>I</span><span>Toggle info</span></div>
              <div className="flex justify-between"><span>ESC</span><span>Close</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Toggle Button */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className={`absolute right-4 top-24 p-3 rounded-full backdrop-blur-md transition-all z-[60] ${
          showInfo ? 'bg-blue-500 text-white' : 'bg-black/50 text-white hover:bg-black/70'
        } ${showControls ? 'opacity-100' : 'opacity-0'}`}
        title="Toggle info panel"
      >
        <Info className="w-5 h-5" />
      </button>

      {/* Progress indicator for gallery */}
      {onNext && onPrev && (
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/60 text-sm z-[60] transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <span>Use ← → to navigate</span>
        </div>
      )}
    </div>
  );
};

// Helper Components
const ActionButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  activeClass?: string;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  className?: string;
  title?: string;
}> = ({ onClick, children, active, activeClass, loading, success, error, className, title }) => {
  let bgClass = 'bg-white/10 hover:bg-white/20';
  if (active && activeClass) bgClass = activeClass;
  else if (active) bgClass = 'bg-blue-500 hover:bg-blue-400';
  if (success) bgClass = 'bg-green-500 hover:bg-green-400';
  if (error) bgClass = 'bg-red-500 hover:bg-red-400';
  if (loading) bgClass = 'bg-white/20 cursor-wait';

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`p-2.5 rounded-lg text-white transition-all ${bgClass} ${className || ''}`}
      title={title}
    >
      {children}
    </button>
  );
};

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-white font-medium capitalize">{value}</span>
  </div>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const LoadingIcon = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
