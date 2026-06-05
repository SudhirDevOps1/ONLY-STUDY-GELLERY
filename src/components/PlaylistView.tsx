import React, { useMemo, useState } from 'react';
import { Play, ChevronRight, ListMusic, Film, Image, Music, BookOpen, ArrowRight } from 'lucide-react';
import { MediaItem } from '../types';
import { generatePlaylists, Playlist, getYoutubeThumbnail } from '../utils/playlistEngine';
import { isYouTubeUrl } from '../utils/mediaUtils';

interface PlaylistViewProps {
  items: MediaItem[];
  onOpenPlaylist: (playlist: Playlist) => void;
  isDark: boolean;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ items, onOpenPlaylist, isDark }) => {
  const playlists = useMemo(() => generatePlaylists(items), [items]);

  const [expanded, setExpanded] = useState(true);

  if (playlists.length === 0) return null;

  return (
    <div className={`rounded-2xl border ${isDark ? 'border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5' : 'border-blue-200 bg-blue-50'}`}>
      <div className="p-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smart Playlists</h2>
              <p className="text-xs text-gray-400">{playlists.length} playlists from {items.length} items</p>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {expanded && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => {
              const firstItem = playlist.items[0];
              const ytThumbnail = firstItem && isYouTubeUrl(firstItem.src) ? getYoutubeThumbnail(firstItem.src) : null;
              const imgThumbnail = firstItem?.type === 'image' ? firstItem.src : null;
              const types = [...new Set(playlist.items.map(i => i.type))];

              return (
                <button
                  key={playlist.id}
                  onClick={() => onOpenPlaylist(playlist)}
                  className={`group relative rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'} p-3 text-left transition-all hover:scale-[1.02] hover:shadow-xl`}
                  style={{ borderColor: playlist.color + '40' }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 rounded-xl opacity-5" style={{ background: `linear-gradient(135deg, ${playlist.color}20, transparent)` }} />

                  <div className="relative z-10">
                    {/* Thumbnail */}
                    <div className="relative w-full h-20 rounded-lg overflow-hidden mb-3 bg-black/30">
                      {ytThumbnail ? (
                        <img src={ytThumbnail} alt="" className="w-full h-full object-cover" />
                      ) : imgThumbnail ? (
                        <img src={imgThumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: playlist.color + '20' }}>
                          <span className="text-3xl">{playlist.icon}</span>
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {playlist.count}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-white truncate">{playlist.name}</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {playlist.count} {playlist.count > 1 ? 'items' : 'item'} • {types.join(', ')}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: playlist.color + '30' }}>
                        <Play className="w-4 h-4" style={{ color: playlist.color }} />
                      </div>
                    </div>

                    {/* Sequence items */}
                    <div className="mt-2 space-y-0.5">
                      {playlist.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-400 truncate">
                          {item.type === 'video' ? <Film className="w-3 h-3 flex-shrink-0" /> : item.type === 'audio' ? <Music className="w-3 h-3 flex-shrink-0" /> : <Image className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}
                      {playlist.items.length > 3 && (
                        <p className="text-[10px] text-blue-400 mt-0.5">+{playlist.items.length - 3} more</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[10px] text-gray-500 flex items-center gap-2">
            <BookOpen className="w-3 h-3" />
            💡 <strong>Tip:</strong> JSON mein koi bhi same category/title daalo → auto playlist ban jaayega!
          </p>
        </div>
      </div>
    </div>
  );
};

// Individual playlist detail view
interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onSelectItem: (index: number) => void;
  isDark: boolean;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist, onBack, onSelectItem, isDark }) => (
  <div>
    {/* Header */}
    <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
      <ArrowRight className="w-4 h-4 rotate-180" /> Back to Playlists
    </button>

    <div className="flex items-center gap-4 mb-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: playlist.color + '20' }}>
        {playlist.icon}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white">{playlist.name}</h2>
        <p className="text-sm text-gray-400">{playlist.count} items</p>
      </div>
    </div>

    {/* Items list */}
    <div className="space-y-2">
      {playlist.items.map((item, index) => {
        const ytThumbnail = isYouTubeUrl(item.src) ? getYoutubeThumbnail(item.src) : null;
        return (
          <button
            key={item.id}
            onClick={() => onSelectItem(index)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'} transition-colors`}
          >
            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
              {ytThumbnail ? (
                <img src={ytThumbnail} alt="" className="w-full h-full object-cover" />
              ) : item.type === 'image' ? (
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  {item.type === 'video' ? <Film className="w-5 h-5 text-purple-400" /> : item.type === 'audio' ? <Music className="w-5 h-5 text-green-400" /> : <Image className="w-5 h-5 text-blue-400" />}
                </div>
              )}
              <div className="absolute top-0.5 right-0.5 bg-black/80 text-white text-[8px] px-1 rounded">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-400 truncate">{item.description}</p>
            </div>
            <Play className="w-5 h-5 text-blue-400 flex-shrink-0" />
          </button>
        );
      })}
    </div>
  </div>
);
