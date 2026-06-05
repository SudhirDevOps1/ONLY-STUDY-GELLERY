import React, { useState } from 'react';
import { Play, Image as ImageIcon, Music, ExternalLink, Download, Check, Loader2, Heart, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { getThumbnail } from '../utils/mediaUtils';
import { storage, formatNumber } from '../utils/storage';
import { downloadMedia } from '../utils/download';

interface MediaCardProps {
  item: MediaItem;
  viewMode?: 'grid' | 'list';
  onClick: () => void;
  onToggleFavorite?: (id: string | number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, viewMode = 'grid', onClick, onToggleFavorite }) => {
  const thumbnail = getThumbnail(item.src, item.type);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(item.id));
  const viewCount = storage.getViewCount(item.id);

  const getIcon = () => {
    switch (item.type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item?.src) return;

    setDownloadStatus('loading');
    const result = await downloadMedia(item);
    setDownloadStatus(result.success ? 'success' : 'idle');
    setTimeout(() => setDownloadStatus('idle'), 2200);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = storage.toggleFavorite(item.id);
    setIsFavorite(newState);
    onToggleFavorite?.(item.id);
  };

  // List view mode
  if (viewMode === 'list') {
    return (
      <div 
        className="group flex items-center gap-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:bg-gray-800"
        onClick={onClick}
      >
        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img 
            src={thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-1 left-1 p-1 bg-black/70 rounded flex items-center gap-1 text-white text-[10px]">
            {getIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold truncate">{item.title}</h3>
              {item.description && (
                <p className="text-gray-400 text-xs truncate mt-0.5">{item.description}</p>
              )}
            </div>
            {item.category && (
              <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 whitespace-nowrap">
                {item.category}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(viewCount)}
              </span>
            )}
            <span className="capitalize">{item.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:bg-gray-700 hover:text-pink-400'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className={`p-2 rounded-lg transition-colors ${
              downloadStatus === 'success' 
                ? 'text-green-400 bg-green-500/10' 
                : downloadStatus === 'loading'
                ? 'text-white bg-gray-700 cursor-wait'
                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title="Download"
          >
            {downloadStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloadStatus === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    );
  }

  // Grid view mode (default)
  return (
    <div 
      className="group relative bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        <img 
          src={thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1.5 text-white/90 text-xs font-medium border border-white/10">
          {getIcon()}
          <span className="capitalize">{item.type}</span>
        </div>

        {/* View Count Badge */}
        {viewCount > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-1 text-white/90 text-xs border border-white/10">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(viewCount)}</span>
          </div>
        )}

        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-all duration-300 backdrop-blur-md ${
              isFavorite 
                ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/50' 
                : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className={`p-2 rounded-lg transition-all duration-300 backdrop-blur-md ${
              downloadStatus === 'success' 
                ? 'bg-green-500 text-white' 
                : downloadStatus === 'loading'
                ? 'bg-gray-700 text-white cursor-wait opacity-100'
                : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80'
            }`}
            title="Download"
          >
            {downloadStatus === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloadStatus === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* View Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 transform scale-75 group-hover:scale-100 transition-transform">
            <ExternalLink className="text-white w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-semibold truncate text-sm flex-1">{item.title}</h3>
          {item.category && (
            <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 whitespace-nowrap">
              {item.category}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-gray-400 text-xs line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
};
