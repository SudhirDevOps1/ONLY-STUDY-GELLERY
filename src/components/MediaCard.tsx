import React, { useState } from 'react';
import { Play, Image as ImageIcon, Music, Download, Heart, Eye, ExternalLink, FileImage, FileVideo, FileAudio, Check, Loader2 } from 'lucide-react';
import { MediaItem } from '../types';
import { getYoutubeThumbnail } from '../utils/playlistEngine';
import { storage, formatNumber } from '../utils/storage';
import { downloadMedia } from '../utils/download';
import { resolveUrl } from '../utils/urlResolver';

interface MediaCardProps {
  item: MediaItem;
  viewMode?: 'grid' | 'list';
  onClick: () => void;
  onToggleFavorite?: (id: string | number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, viewMode = 'grid', onClick, onToggleFavorite }) => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [isFavorite, setIsFavorite] = useState(storage.isFavorite(item.id));
  const viewCount = storage.getViewCount(item.id);
  // Smart thumbnail: YouTube → thumbnail, image → resolved URL (Drive/imgur work)
  const thumbnail = item.type === 'image'
    ? resolveUrl(item.src, 'image').url
    : (getYoutubeThumbnail(item.src) || '');

  const getIcon = () => {
    switch (item.type) {
      case 'video': return <FileVideo className="w-3 h-3" />;
      case 'audio': return <FileAudio className="w-3 h-3" />;
      default: return <FileImage className="w-3 h-3" />;
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // List view
  if (viewMode === 'list') {
    return (
      <div
        className="group flex items-center gap-3 sm:gap-4 bg-gray-800/50 rounded-xl p-2.5 sm:p-3 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:bg-gray-800"
        onClick={onClick}
      >
        <div className="relative w-20 h-12 sm:w-24 sm:h-16 flex-shrink-0 overflow-hidden rounded-lg bg-black/30">
          {thumbnail ? (
            <img src={thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              {item.type === 'video' ? <Play className="w-5 h-5 text-purple-400" /> : item.type === 'audio' ? <Music className="w-5 h-5 text-green-400" /> : <ImageIcon className="w-5 h-5 text-blue-400" />}
            </div>
          )}
          <div className="absolute top-1 left-1 p-1 bg-black/70 rounded text-white">{getIcon()}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-white truncate">{item.title}</h3>
              {item.description && <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
            </div>
            {item.category && (
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-blue-400 font-bold px-1.5 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 whitespace-nowrap">
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-400">
            {viewCount > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(viewCount)}</span>}
            <span className="capitalize">{item.type}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isFavorite ? 'text-pink-500 bg-pink-500/10' : 'text-gray-400 hover:bg-gray-700 hover:text-pink-400'}`}
            title={isFavorite ? 'Remove' : 'Add favorite'}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              downloadStatus === 'success' ? 'text-green-400 bg-green-500/10' :
              downloadStatus === 'loading' ? 'text-white bg-gray-700' :
              'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
            title="Download"
          >
            {downloadStatus === 'loading' ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> :
             downloadStatus === 'success' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> :
             <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="group relative bg-gray-800/50 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-blue-500/10 hover:scale-[1.02] active:scale-95"
      onClick={onClick}
    >
      <div className="aspect-[16/10] overflow-hidden relative bg-black/30">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            {item.type === 'video' ? <Play className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400" /> : item.type === 'audio' ? <Music className="w-10 h-10 sm:w-12 sm:h-12 text-green-400" /> : <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Type Badge */}
        <div className="absolute top-2 left-2 px-1.5 sm:px-2 py-1 bg-black/60 backdrop-blur-md rounded-md sm:rounded-lg flex items-center gap-1 text-white text-[10px] sm:text-xs font-medium border border-white/10">
          {getIcon()}
          <span className="capitalize">{item.type}</span>
        </div>

        {/* View Count */}
        {viewCount > 0 && (
          <div className="absolute bottom-2 left-2 px-1.5 py-1 bg-black/60 backdrop-blur-md rounded-md flex items-center gap-1 text-white text-[10px] border border-white/10">
            <Eye className="w-2.5 h-2.5" />
            {formatNumber(viewCount)}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all backdrop-blur-md ${
              isFavorite ? 'bg-pink-500 text-white' : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80'
            }`}
            title="Favorite"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all backdrop-blur-md ${
              downloadStatus === 'success' ? 'bg-green-500 text-white' :
              downloadStatus === 'loading' ? 'bg-gray-700 text-white cursor-wait opacity-100' :
              'bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80'
            }`}
            title="Download"
          >
            {downloadStatus === 'loading' ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> :
             downloadStatus === 'success' ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> :
             <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 transform scale-75 group-hover:scale-100 transition-transform">
            <ExternalLink className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      <div className="p-2.5 sm:p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
          <h3 className="text-white font-semibold truncate text-xs sm:text-sm flex-1">{item.title}</h3>
          {item.category && (
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-blue-400 font-bold px-1.5 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 whitespace-nowrap flex-shrink-0">
              {item.category}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-gray-400 text-[10px] sm:text-xs line-clamp-2">{item.description}</p>
        )}
      </div>
    </div>
  );
};
