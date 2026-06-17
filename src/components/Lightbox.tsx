import React, { useEffect, useState, useCallback } from 'react';
import {
  X, ChevronLeft, ChevronRight, Download, Heart, Share2, Copy,
  Maximize, Minimize, Info, ExternalLink, Tag, Eye, Music
} from 'lucide-react';
import { MediaItem } from '../types';
import { getYoutubeId } from '../utils/playlistEngine';
import { storage, copyToClipboard, formatNumber } from '../utils/storage';
import { downloadMedia } from '../utils/download';
import { resolveUrl } from '../utils/urlResolver';
import { ImageViewer } from './ImageViewer';

interface LightboxProps {
  item: MediaItem;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ item, onClose, onNext, onPrev }) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [downloadMessage, setDownloadMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(item.id));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false); // Click-to-open
  const [showControls, setShowControls] = useState(true);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    storage.incrementViewCount(item.id);
    storage.addToRecentViews(item.id);
    setViewCount(storage.getViewCount(item.id));
    setShowInfo(false);
  }, [item.id]);

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
      try { await navigator.share({ title: item.title, text: item.description, url: item.src }); }
      catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleToggleFavorite = () => {
    const newState = storage.toggleFavorite(item.id);
    setIsFavorite(newState);
  };

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) { console.error(e); }
  }, []);

  // Smart URL resolution (YouTube, Drive, Mega, etc.)
  const resolved = resolveUrl(item.src, item.type);
  const youtubeId = getYoutubeId(item.src);
  // embedUrl: YouTube OR any iframe-type provider (Drive, Vimeo, etc.)
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&controls=1&fs=1&enablejsapi=1`
    : resolved.type === 'iframe'
    ? resolved.url
    : null;
  // Redirect providers (Mega, Pinterest) - show open button
  const isRedirectOnly = resolved.type === 'redirect';

  // Get extension
  const getExtension = () => {
    const match = item.src.match(/\.([a-zA-Z0-9]+)(?:\?|$)/i);
    return match ? match[1].toUpperCase() : item.type.toUpperCase();
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': onPrev?.(); break;
        case 'ArrowRight': onNext?.(); break;
        case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
        case 'd': case 'D': e.preventDefault(); handleDownload(); break;
        case 'c': case 'C': if (!e.ctrlKey) { e.preventDefault(); handleCopyLink(); } break;
        case 'i': case 'I': e.preventDefault(); setShowInfo(p => !p); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrev, toggleFullscreen, item.id]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const reset = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 4000);
    };
    const move = () => reset();
    window.addEventListener('mousemove', move);
    reset();
    return () => { window.removeEventListener('mousemove', move); clearTimeout(timeout); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className={`transition-all duration-300 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-gradient-to-b from-black/90 via-black/60 to-transparent p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 max-w-[1800px] mx-auto">
            {/* Title */}
            <div className="flex items-center gap-2 sm:gap-3 text-white min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-bold truncate">{item.title}</h2>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-300 mt-0.5 sm:mt-1 flex-wrap">
                  {item.category && (
                    <span className="flex items-center gap-1 bg-blue-500/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {item.category}
                    </span>
                  )}
                  <span className="capitalize bg-gray-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="bg-gray-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">{getExtension()}</span>
                  {viewCount > 0 && (
                    <span className="flex items-center gap-1 bg-gray-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">
                      <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {formatNumber(viewCount)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button onClick={handleToggleFavorite} className={`p-2 rounded-lg ${isFavorite ? 'bg-pink-500' : 'bg-white/10 hover:bg-white/20'}`} title="Favorite">
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button onClick={handleCopyLink} className={`p-2 rounded-lg ${copied ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'}`} title="Copy">
                {copied ? <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <button onClick={handleShare} className="hidden sm:block p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Share">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={handleDownload} className={`p-2 rounded-lg ${downloadStatus === 'success' ? 'bg-green-500' : downloadStatus === 'error' ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'}`} title="Download">
                {downloadStatus === 'loading' ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : downloadStatus === 'success' ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <button onClick={toggleFullscreen} className="hidden sm:block p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Fullscreen">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button onClick={() => setShowInfo(!showInfo)} className={`p-2 rounded-lg ${showInfo ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'}`} title="Info (I)">
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-red-500" title="Close (Esc)">
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          {/* Download message */}
          {downloadStatus !== 'idle' && downloadMessage && (
            <div className={`mt-2 px-3 py-2 rounded-lg text-xs sm:text-sm inline-flex items-center gap-2 ${
              downloadStatus === 'success' ? 'bg-green-500/90' : downloadStatus === 'error' ? 'bg-red-500/90' : 'bg-blue-500/90'
            } text-white animate-slide-in`}>
              {downloadStatus === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              {downloadStatus === 'error' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
              {downloadMessage}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      {onPrev && (
        <button onClick={onPrev} className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white z-40 transition-all ${showControls ? 'opacity-100' : 'opacity-0'}`} aria-label="Previous">
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}
      {onNext && (
        <button onClick={onNext} className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-4 bg-white/10 hover:bg-white/20 rounded-full text-white z-40 transition-all ${showControls ? 'opacity-100' : 'opacity-0'}`} aria-label="Next">
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {isRedirectOnly ? (
          /* Mega/Pinterest etc - CORS blocked, redirect to source */
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-lg">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center mb-6">
              <ExternalLink className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{resolved.provider} Link</h3>
            <p className="text-gray-400 mb-6 text-sm">
              {resolved.provider} content cannot be embedded directly due to security policy. Click below to open it in a new tab.
            </p>
            <a
              href={resolved.fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
            >
              <ExternalLink className="w-5 h-5" /> Open in {resolved.provider}
            </a>
          </div>
        ) : item.type === 'image' ? (
          <ImageViewer src={resolved.url} alt={item.title} fallbackUrl={resolved.fallbackUrl} />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={item.title}
            style={{ border: 'none' }}
          />
        ) : item.type === 'video' ? (
          <video
            src={resolved.url}
            controls
            autoPlay
            className="max-w-full max-h-full"
            style={{ width: '100%', height: '100%', maxHeight: '100vh' }}
            onError={() => window.open(resolved.fallbackUrl, '_blank')}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              video.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
            }}
          />
        ) : item.type === 'audio' ? (
          <div className="flex flex-col items-center justify-center p-6 sm:p-8 w-full h-full bg-gradient-to-br from-gray-900 to-black">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 sm:mb-8 shadow-2xl">
              <Music className="w-16 h-16 sm:w-24 sm:h-24 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center px-4">{item.title}</h3>
            <audio src={resolved.url} controls className="w-full max-w-2xl" autoPlay />
          </div>
        ) : (
          <div className="text-white text-center p-4">
            <ExternalLink className="w-12 h-12 mx-auto mb-2" />
            <p>Unsupported media type</p>
            <a href={item.src} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Open source</a>
          </div>
        )}
      </div>

      {/* Info Sidebar - click to open, slide from right */}
      <div className={`absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-40 overflow-y-auto transition-transform duration-300 ${showInfo ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Details</h3>
            <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">{item.title}</h4>
            {item.description && <p className="text-sm text-gray-400 mt-2">{item.description}</p>}
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-sm"><span className="text-gray-400">Type</span><span className="text-white capitalize">{item.type}</span></div>
            {item.category && <div className="flex justify-between text-sm"><span className="text-gray-400">Category</span><span className="text-white capitalize">{item.category}</span></div>}
            <div className="flex justify-between text-sm"><span className="text-gray-400">Views</span><span className="text-white">{formatNumber(viewCount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-400">Format</span><span className="text-white">{getExtension()}</span></div>
          </div>
          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">SOURCE URL</h4>
            <div className="text-xs text-gray-500 break-all font-mono bg-gray-800 rounded p-2 max-h-24 overflow-y-auto">
              {item.src}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleCopyLink} className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Copy className="w-3 h-3" /> Copy
              </button>
              <a href={item.src} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <ExternalLink className="w-3 h-3" /> Open
              </a>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <button onClick={handleDownload} disabled={downloadStatus === 'loading'} className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              {downloadStatus === 'loading' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
              Download
            </button>
            <button onClick={handleToggleFavorite} className={`w-full px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${isFavorite ? 'bg-pink-600 hover:bg-pink-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
