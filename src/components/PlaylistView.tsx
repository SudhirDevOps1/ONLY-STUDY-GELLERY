import React, { useMemo, useState } from 'react';
import { Play, ChevronRight, ListMusic, Film, Image as ImageIcon, Music, BookOpen, ArrowLeft, Sparkles, Tag, FileImage, FileVideo, FileAudio, Search } from 'lucide-react';
import { MediaItem } from '../types';
import { generatePlaylists, Playlist, getYoutubeThumbnail, getItemThumbnail, getCleanTitle, extractSequenceNumber } from '../utils/playlistEngine';
import { isYouTubeUrl } from './../utils/mediaUtils';

interface PlaylistViewProps {
  items: MediaItem[];
  onOpenPlaylist: (playlist: Playlist) => void;
  onSelectDirectItem: (item: MediaItem) => void;
  isDark: boolean;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ items, onOpenPlaylist, onSelectDirectItem, isDark }) => {
  const { playlists, directItems } = useMemo(() => generatePlaylists(items), [items]);
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');

  const filteredPlaylists = useMemo(() => {
    if (!search.trim()) return playlists;
    const s = search.toLowerCase();
    return playlists.filter(p => p.name.toLowerCase().includes(s) || p.items.some(i => i.title.toLowerCase().includes(s)));
  }, [playlists, search]);

  if (playlists.length === 0 && directItems.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Smart Playlists Section */}
      {playlists.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? 'border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5' : 'border-blue-200 bg-blue-50'}`}>
          <div className="p-4 sm:p-5">
            <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <ListMusic className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Smart Playlists
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs">{filteredPlaylists.length}</span>
                  </h2>
                  <p className="text-xs text-gray-400">Auto-grouped from (tag) prefix or category</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>

            {expanded && (
              <>
                {/* Search inside playlists */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search playlists..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlaylists.map((playlist) => {
                    const firstItem = playlist.items[0];
                    const ytThumbnail = firstItem && isYouTubeUrl(firstItem.src) ? getYoutubeThumbnail(firstItem.src) : null;
                    const imgThumbnail = firstItem?.type === 'image' ? firstItem.src : null;
                    const videoCount = playlist.items.filter(i => i.type === 'video').length;
                    const imgCount = playlist.items.filter(i => i.type === 'image').length;
                    const audioCount = playlist.items.filter(i => i.type === 'audio').length;

                    return (
                      <button
                        key={playlist.id}
                        onClick={() => onOpenPlaylist(playlist)}
                        className="group relative rounded-xl border-2 bg-gray-800/50 hover:bg-gray-800 p-3 text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
                        style={{ borderColor: playlist.color + '40' }}
                      >
                        <div className="absolute inset-0 rounded-xl opacity-5" style={{ background: `linear-gradient(135deg, ${playlist.color}, transparent)` }} />

                        <div className="relative z-10">
                          {/* Thumbnail */}
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 bg-black/30">
                            {ytThumbnail ? (
                              <img src={ytThumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : imgThumbnail ? (
                              <img src={imgThumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: playlist.color + '20' }}>
                                <span className="text-5xl">{playlist.icon}</span>
                              </div>
                            )}
                            {/* Tag badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-white">
                              <Tag className="w-3 h-3" />{playlist.type === 'tag' ? `(${playlist.name.toLowerCase()})` : playlist.type}
                            </div>
                            {/* Count badge */}
                            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-bold">
                              {playlist.count} items
                            </div>
                            {/* Hover play button */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                              <div className="w-14 h-14 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all transform group-hover:scale-100 scale-0">
                                <Play className="w-7 h-7 text-black ml-1" />
                              </div>
                            </div>
                          </div>

                          {/* Info */}
                          <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            <span className="text-base">{playlist.icon}</span>{playlist.name}
                          </h3>
                          <p className="text-[10px] text-gray-400 mt-1 truncate">{playlist.description}</p>

                          {/* Type breakdown */}
                          <div className="flex items-center gap-2 mt-2">
                            {videoCount > 0 && <span className="flex items-center gap-1 text-[10px] text-purple-400"><FileVideo className="w-3 h-3" />{videoCount}</span>}
                            {imgCount > 0 && <span className="flex items-center gap-1 text-[10px] text-blue-400"><FileImage className="w-3 h-3" />{imgCount}</span>}
                            {audioCount > 0 && <span className="flex items-center gap-1 text-[10px] text-green-400"><FileAudio className="w-3 h-3" />{audioCount}</span>}
                          </div>

                          {/* First 2 items preview */}
                          <div className="mt-2 space-y-1">
                            {playlist.items.slice(0, 2).map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500 truncate">
                                <span className="text-blue-400 font-bold">{extractSequenceNumber(item.title) < 9999 ? extractSequenceNumber(item.title) : i + 1}.</span>
                                <span className="truncate">{getCleanTitle(item.title)}</span>
                              </div>
                            ))}
                            {playlist.items.length > 2 && (
                              <p className="text-[10px] text-blue-400 font-semibold">+{playlist.items.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[10px] text-gray-500 flex items-start gap-2">
                    <BookOpen className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-blue-400">💡 Tip:</strong> JSON mein title ke aage <code className="text-yellow-300 bg-gray-800 px-1 rounded">(css)</code>, <code className="text-yellow-300 bg-gray-800 px-1 rounded">(html)</code>, <code className="text-yellow-300 bg-gray-800 px-1 rounded">(english)</code> aise tag daalo → auto playlist banega!
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Direct Items - Items without playlist tag */}
      {directItems.length > 0 && (
        <div className={`rounded-2xl border ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-white'}`}>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Direct Items</h2>
                <p className="text-xs text-gray-400">{directItems.length} items without playlist tag</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {directItems.map((item) => {
                const thumb = getItemThumbnail(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectDirectItem(item)}
                    className="group rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <div className="relative aspect-square bg-black/30">
                      {thumb ? (
                        <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'video' ? <Film className="w-8 h-8 text-purple-400" /> : item.type === 'audio' ? <Music className="w-8 h-8 text-green-400" /> : <ImageIcon className="w-8 h-8 text-blue-400" />}
                        </div>
                      )}
                      <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white capitalize">{item.type}</div>
                    </div>
                    <div className="p-2 text-left">
                      <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                      {item.category && <p className="text-[10px] text-gray-400 truncate">{item.category}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PLAYLIST DETAIL VIEW
// ============================================================
interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
  onSelectItem: (index: number) => void;
  isDark: boolean;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlist, onBack, onSelectItem, isDark }) => (
  <div>
    {/* Back button */}
    <button onClick={onBack} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors">
      <ArrowLeft className="w-4 h-4" /> Back to Playlists
    </button>

    {/* Header */}
    <div className="rounded-2xl border bg-gradient-to-br p-4 sm:p-6 mb-6" style={{ borderColor: playlist.color + '40', background: `linear-gradient(135deg, ${playlist.color}10, transparent)` }}>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0" style={{ background: playlist.color + '30' }}>
          {playlist.icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate flex items-center gap-2">
            <Tag className="w-5 h-5 flex-shrink-0" style={{ color: playlist.color }} />
            {playlist.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 truncate">{playlist.description}</p>
        </div>
      </div>
    </div>

    {/* Items list */}
    <div className="grid gap-2 sm:gap-3">
      {playlist.items.map((item, index) => {
        const ytThumbnail = isYouTubeUrl(item.src) ? getYoutubeThumbnail(item.src) : null;
        const seqNum = extractSequenceNumber(item.title);
        const displayNum = seqNum < 9999 ? seqNum : index + 1;
        return (
          <button
            key={item.id}
            onClick={() => onSelectItem(index)}
            className={`group w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl border ${isDark ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'} transition-all hover:scale-[1.01] active:scale-95`}
          >
            <div className="relative w-16 h-12 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-black/30 flex-shrink-0">
              {ytThumbnail ? (
                <img src={ytThumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : item.type === 'image' ? (
                <img src={item.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  {item.type === 'video' ? <Film className="w-5 h-5 text-purple-400" /> : item.type === 'audio' ? <Music className="w-5 h-5 text-green-400" /> : <ImageIcon className="w-5 h-5 text-blue-400" />}
                </div>
              )}
              <div className="absolute top-0.5 left-0.5 bg-black/80 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 rounded font-bold">
                #{displayNum}
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-semibold text-white truncate flex items-center gap-1.5">
                {item.type === 'video' && <FileVideo className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                {item.type === 'image' && <FileImage className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                {item.type === 'audio' && <FileAudio className="w-3 h-3 text-green-400 flex-shrink-0" />}
                {getCleanTitle(item.title)}
              </p>
              {item.description && <p className="text-[10px] sm:text-xs text-gray-400 truncate mt-0.5">{item.description}</p>}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 group-hover:bg-blue-500 flex items-center justify-center transition-colors flex-shrink-0">
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 group-hover:text-white" />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
