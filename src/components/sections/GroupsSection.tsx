import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, X, ExternalLink, Camera, AlertCircle, Download, Plus, RefreshCw } from 'lucide-react';
import { SectionHeader } from './SectionBase';
import { MediaItem } from '../../types';
// Unsplash used directly - no API key needed

// ============================================================
// U N S P L A S H   I M A G E   G R O U P S
// Free, no API key required (source.unsplash.com works directly)
// ============================================================

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  url: string;
  thumb: string;
  small: string;
  regular: string;
  full: string;
  fallbackThumb: string;
  fallbackRegular: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  query: string;
}

interface Group {
  id: string;
  name: string;
  icon: string;
  defaultQuery: string;
  color: string;
}

const GROUPS: Group[] = [
  { id: 'animals', name: 'Animals', icon: '🦁', defaultQuery: 'animal,dog', color: 'orange' },
  { id: 'flowers', name: 'Flowers', icon: '🌹', defaultQuery: 'flower,rose', color: 'pink' },
  { id: 'nature', name: 'Nature', icon: '🏞️', defaultQuery: 'nature,mountain', color: 'green' },
  { id: 'cars', name: 'Cars', icon: '🚗', defaultQuery: 'car,sports-car', color: 'red' },
  { id: 'food', name: 'Food', icon: '🍕', defaultQuery: 'food,pizza', color: 'amber' },
  { id: 'travel', name: 'Travel', icon: '✈️', defaultQuery: 'travel,beach', color: 'cyan' },
];

const colorMap: Record<string, { border: string; bg: string; btn: string; text: string }> = {
  orange: { border: 'border-orange-500/30', bg: 'from-orange-500/10 to-amber-500/5', btn: 'bg-orange-600 hover:bg-orange-500', text: 'text-orange-400' },
  pink: { border: 'border-pink-500/30', bg: 'from-pink-500/10 to-rose-500/5', btn: 'bg-pink-600 hover:bg-pink-500', text: 'text-pink-400' },
  green: { border: 'border-green-500/30', bg: 'from-green-500/10 to-emerald-500/5', btn: 'bg-green-600 hover:bg-green-500', text: 'text-green-400' },
  red: { border: 'border-red-500/30', bg: 'from-red-500/10 to-pink-500/5', btn: 'bg-red-600 hover:bg-red-500', text: 'text-red-400' },
  amber: { border: 'border-amber-500/30', bg: 'from-amber-500/10 to-yellow-500/5', btn: 'bg-amber-600 hover:bg-amber-500', text: 'text-amber-400' },
  cyan: { border: 'border-cyan-500/30', bg: 'from-cyan-500/10 to-blue-500/5', btn: 'bg-cyan-600 hover:bg-cyan-500', text: 'text-cyan-400' },
};

function fallbackImage(query: string, index: number, width: number, height: number) {
  const normalized = encodeURIComponent(query.replace(/\s+/g, ','));
  return `https://loremflickr.com/${width}/${height}/${normalized}?lock=${index + 101}`;
}

function lastFallbackImage(query: string, index: number, width: number, height: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(query)}-${index}/${width}/${height}`;
}

interface GroupsSectionProps {
  onAddMedia?: (item: MediaItem) => void;
  isDark?: boolean;
}

export const GroupsSection: React.FC<GroupsSectionProps> = ({ onAddMedia }) => {
  const [modalPhoto, setModalPhoto] = useState<UnsplashPhoto | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8">
      <SectionHeader icon="🖼️" title="Image Groups (Unsplash)" description="Search free stock photos by category. Each group loads default images automatically. Powered by Unsplash Source API (no key required)." />

      {/* Note */}
      <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-blue-200 flex items-start gap-2">
          <Camera className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>📸 Images from <strong>Unsplash</strong>. No API key needed. Each group defaults to a keyword (e.g. "dog", "rose"). You can search any keyword you like!</span>
        </p>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map(group => (
          <GroupCard key={group.id} group={group} onPhotoClick={setModalPhoto} onAddMedia={onAddMedia} />
        ))}
      </div>

      {/* Image Modal */}
      {modalPhoto && <ImageModal photo={modalPhoto} onClose={() => setModalPhoto(null)} onAddMedia={onAddMedia} />}
    </div>
  );
};

// ============================================================
// Fetch images from Unsplash Source API (free, no key)
// ============================================================
async function fetchUnsplashImages(query: string, count: number = 10): Promise<UnsplashPhoto[]> {
  const results: UnsplashPhoto[] = [];
  const queries = query.split(',').map(q => q.trim()).filter(Boolean);
  const primaryQuery = queries[0] || query;

  // Unsplash Source allows direct image URL
  for (let i = 0; i < count; i++) {
    const url = `https://source.unsplash.com/800x600/?${encodeURIComponent(primaryQuery)}&sig=${i}`;
    const thumbUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(primaryQuery)}&sig=${i}`;
    const regularUrl = `https://source.unsplash.com/1200x800/?${encodeURIComponent(primaryQuery)}&sig=${i}`;
    const fullUrl = `https://source.unsplash.com/1600x1200/?${encodeURIComponent(primaryQuery)}&sig=${i}`;
    
    results.push({
      id: `unsplash-${primaryQuery}-${i}`,
      width: 800,
      height: 600,
      url: url,
      thumb: thumbUrl,
      small: thumbUrl,
      regular: regularUrl,
      full: fullUrl,
      fallbackThumb: fallbackImage(primaryQuery, i, 400, 300),
      fallbackRegular: fallbackImage(primaryQuery, i, 1200, 800),
      photographer: 'Unsplash',
      photographerUrl: `https://unsplash.com/s/photos/${encodeURIComponent(primaryQuery)}`,
      alt: `${primaryQuery} image ${i + 1}`,
      query: primaryQuery,
    });
  }

  // Also try the Unsplash API for photographer info (free tier)
  try {
    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(primaryQuery)}&per_page=${count}&client_id=demo`;
    const res = await fetch(apiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        data.results.forEach((photo: any, idx: number) => {
          if (results[idx]) {
            results[idx].photographer = photo.user?.name || 'Unsplash';
            results[idx].photographerUrl = photo.user?.links?.html || `https://unsplash.com/@${photo.user?.username || 'unsplash'}`;
            results[idx].alt = photo.alt_description || `${primaryQuery} image ${idx + 1}`;
            results[idx].thumb = photo.urls?.thumb || results[idx].thumb;
            results[idx].small = photo.urls?.small || results[idx].small;
            results[idx].regular = photo.urls?.regular || results[idx].regular;
            results[idx].full = photo.urls?.full || results[idx].full;
            results[idx].width = photo.width || 800;
            results[idx].height = photo.height || 600;
          }
        });
      }
    }
  } catch {
    // Fallback to source.unsplash.com - works fine without API
  }

  return results;
}

// ============================================================
// GROUP CARD
// ============================================================
interface GroupCardProps {
  group: Group;
  onPhotoClick: (photo: UnsplashPhoto) => void;
  onAddMedia?: (item: MediaItem) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, onPhotoClick }) => {
  const [query, setQuery] = useState(group.defaultQuery);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const colors = colorMap[group.color];
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchImages = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');

    try {
      const results = await fetchUnsplashImages(searchQuery, 10);
      if (results.length > 0) {
        setPhotos(results);
      } else {
        setError('No images found. Try another keyword.');
        setPhotos([]);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch images');
      setPhotos([]);
    }
    setLoading(false);
    setInitialLoad(false);
  }, []);

  // Auto-load default on mount
  useEffect(() => {
    fetchImages(group.defaultQuery);
  }, [fetchImages, group.defaultQuery]);

  const handleSearch = () => fetchImages(query);

  return (
    <div className={`rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-4 sm:p-5`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{group.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{group.name}</h3>
          <p className="text-xs text-gray-400">
            {loading ? 'Loading...' : `${photos.length} images`}
          </p>
        </div>
        <button
          onClick={() => fetchImages(query)}
          disabled={loading}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search ${group.name.toLowerCase()}...`}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`${colors.btn} text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-3 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Images Grid */}
      {loading && initialLoad ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map(photo => (
            <button
              key={photo.id}
              onClick={() => onPhotoClick(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 hover:ring-2 hover:ring-blue-500 transition-all active:scale-95"
            >
              <img
                src={photo.thumb}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = photo.fallbackThumb;
                  } else if (img.dataset.fallback === '1') {
                    img.dataset.fallback = '2';
                    img.src = lastFallbackImage(photo.query, photo.id.length, 400, 300);
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                <p className="text-[8px] text-white truncate w-full">{photo.photographer}</p>
              </div>
            </button>
          ))}
        </div>
      ) : initialLoad ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">No images found for "{query}". Try another search.</div>
      )}
    </div>
  );
};

// ============================================================
// IMAGE MODAL
// ============================================================
interface ImageModalProps {
  photo: UnsplashPhoto;
  onClose: () => void;
  onAddMedia?: (item: MediaItem) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ photo, onClose, onAddMedia }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const [imgLoaded, setImgLoaded] = useState(false);
  const [modalSrc, setModalSrc] = useState(photo.regular);
  const [fallbackStage, setFallbackStage] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full bg-gray-900 rounded-2xl overflow-hidden max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white hover:scale-110 transition-transform">
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="bg-black flex items-center justify-center min-h-[200px] max-h-[65vh] overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
          <img
            src={modalSrc}
            alt={photo.alt}
            className={`max-w-full max-h-[65vh] object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (fallbackStage === 0) {
                setFallbackStage(1);
                setModalSrc(photo.fallbackRegular);
              } else if (fallbackStage === 1) {
                setFallbackStage(2);
                setModalSrc(lastFallbackImage(photo.query, photo.id.length, 1200, 800));
              }
            }}
          />
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Camera className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 whitespace-nowrap">Photo by</span>
              <a
                href={photo.photographerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 font-semibold hover:underline truncate flex items-center gap-1"
              >
                {photo.photographer}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
            <div className="flex gap-2">
              <a
                href={photo.full}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Download
              </a>
              {onAddMedia && (
                <button
                  onClick={() => {
                    onAddMedia({
                      id: `unsplash-${Date.now()}`,
                      title: photo.alt || 'Unsplash Photo',
                      type: 'image',
                      src: photo.regular,
                      category: 'unsplash',
                      description: `Photo by ${photo.photographer} on Unsplash`
                    });
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{photo.width} × {photo.height} px • {photo.alt}</p>
        </div>
      </div>
    </div>
  );
};
