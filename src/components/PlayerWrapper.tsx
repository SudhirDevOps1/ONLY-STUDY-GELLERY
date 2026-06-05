import React from 'react';
import { MediaItem } from '../types';
import { getCloudInfo } from '../utils/mediaUtils';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface PlayerWrapperProps {
  item: MediaItem;
  isPlaying?: boolean;
  isMuted?: boolean;
}

export const PlayerWrapper: React.FC<PlayerWrapperProps> = ({ item, isPlaying = true, isMuted = false }) => {
  const info = getCloudInfo(item.src, item.type);

  // Special handling for Mega.nz CORS issues
  if (info.provider === 'mega-warning' || info.provider === 'mega') {
    return (
      <div className="w-full h-full min-h-[60vh] flex items-center justify-center bg-black p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Mega.nz Embedding Restricted</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Browsers block direct embedding from Mega.nz due to <span className="text-amber-400 font-semibold">CORS security policies</span>.
              Mega uses encrypted links that require their own player.
            </p>
            
            <div className="bg-black/50 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-400 mb-2 font-mono">Current URL:</p>
              <p className="text-xs text-gray-500 break-all font-mono">{item.src}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={item.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Open in Mega.nz
              </a>
              <button
                onClick={() => {
                  // Try to convert to embed URL
                  let embedUrl = item.src;
                  if (embedUrl.includes('/file/')) {
                    embedUrl = embedUrl.replace('/file/', '/embed/');
                  }
                  window.open(embedUrl, '_blank');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/20"
              >
                <ExternalLink className="w-5 h-5" />
                Try Embed Link
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-gray-500">
                💡 <strong className="text-gray-400">Solution:</strong> Use Mega's embed URL format: <br/>
                <code className="text-amber-400">https://mega.nz/embed/FILE_ID#KEY</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (info.type === 'image') {
    return (
      <div className="relative">
        <img 
          src={info.originalUrl} 
          alt={item.title} 
          className="max-w-full max-h-[85vh] object-contain mx-auto"
          onError={(e) => {
            // Handle image load errors (CORS, etc.)
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-[60vh] flex items-center justify-center bg-black p-8">
                  <div class="text-center">
                    <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">Failed to Load Image</h3>
                    <p class="text-gray-400 mb-4">This image may be blocked by CORS policy or require authentication.</p>
                    <a href="${item.src}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
                      Open Original
                    </a>
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  if (info.provider === 'html5' || info.provider === 'html5-video' || info.provider === 'html5-audio') {
    if (info.type === 'audio') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-black min-h-[60vh]">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-6">{item.title}</h3>
          <audio controls className="w-full max-w-2xl" src={info.embedUrl} autoPlay={isPlaying} muted={isMuted}>
            Your browser does not support the audio element.
          </audio>
          <p className="text-sm text-gray-500 mt-4">Provider: {info.provider}</p>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <video 
          controls 
          className="w-full h-full max-h-[85vh]" 
          src={info.embedUrl} 
          autoPlay={isPlaying}
          muted={isMuted}
          onError={(e) => {
            console.error('Video load error:', e);
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  // Handle various iframes (YouTube, Google Drive, etc.)
  return (
    <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-black relative">
      <iframe
        src={info.provider === 'youtube' ? `${info.embedUrl}${info.embedUrl.includes('?') ? '&' : '?'}controls=1&fs=1&iv_load_policy=3&cc_load_policy=0&enablejsapi=1&modestbranding=1&rel=0&showinfo=1&color=white` : info.embedUrl}
        className="w-full h-[80vh] border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={item.title}
        onError={() => {
          console.error('Iframe load error for:', info.embedUrl);
        }}
      />
      {/* Provider badge */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs text-white/80 border border-white/10">
        {info.provider.toUpperCase()}
      </div>
    </div>
  );
};