import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Grid3x3, 
  List, 
  Sun, 
  Moon, 
  BarChart3, 
  Keyboard, 
  Sparkles,
  SortAsc, 
  SortDesc, 
  Heart, 
  SlidersHorizontal,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { MediaItem, SortBy, SortOrder, ViewMode, Theme } from '../types';
import { MediaCard } from './MediaCard';
import { Lightbox } from './Lightbox';
import { StatsDashboard } from './StatsDashboard';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { DiscoverPanel } from './DiscoverPanel';
import { WeatherWidget } from './WeatherWidget';
import { ToastContainer, useToast } from './Toast';
import { storage } from '../utils/storage';
import { isYouTubeUrl } from '../utils/mediaUtils';

interface GalleryProps {
  items: MediaItem[];
  onRefresh?: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ items, onRefresh }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDiscover, setShowDiscover] = useState(false);
  const [extraItems, setExtraItems] = useState<MediaItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { toasts, showToast, dismissToast } = useToast();

  const allItems = useMemo(() => [...items, ...extraItems], [items, extraItems]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = storage.getSettings();
    if (savedSettings) {
      setTheme(savedSettings.theme || 'dark');
      setViewMode(savedSettings.viewMode || 'grid');
      setSortBy(savedSettings.sortBy || 'title');
      setSortOrder(savedSettings.sortOrder || 'asc');
      setShowFavoritesOnly(savedSettings.showFavoritesOnly || false);
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    storage.setSettings({
      theme,
      viewMode,
      sortBy,
      sortOrder,
      showFavoritesOnly
    });
  }, [theme, viewMode, sortBy, sortOrder, showFavoritesOnly]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const categories = useMemo(() => {
    const cats = new Set(allItems.map(item => item.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [allItems]);

  const playlistGroups = useMemo(() => {
    const groups = new Map<string, MediaItem[]>();
    allItems.filter(item => item.type === 'video' && isYouTubeUrl(item.src)).forEach(item => {
      const normalized = item.title
        .replace(/day\s*\d+/i, '')
        .replace(/part\s*\d+/i, '')
        .replace(/class\s*\d+/i, '')
        .trim();
      const key = item.category || normalized || 'YouTube Playlist';
      groups.set(key, [...(groups.get(key) || []), item]);
    });
    return Array.from(groups.entries()).filter(([, group]) => group.length >= 2);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let result = allItems.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchType = filterType === 'all' || item.type === filterType;
      const matchCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchFavorites = !showFavoritesOnly || storage.isFavorite(item.id);

      return matchSearch && matchType && matchCategory && matchFavorites;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'recent':
          comparison = storage.getViewCount(b.id) - storage.getViewCount(a.id);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allItems, searchTerm, filterType, filterCategory, sortBy, sortOrder, showFavoritesOnly, refreshKey]);

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex < filteredItems.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
    }
  }, [selectedItemIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  }, [selectedItemIndex]);

  const handleClose = useCallback(() => {
    setSelectedItemIndex(null);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

      if (e.key === '?' && !showShortcuts) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  const handleToggleFavorite = (id: string | number) => {
    const isFav = storage.isFavorite(id);
    showToast('info', isFav ? 'Added to favorites' : 'Removed from favorites');
    setRefreshKey(prev => prev + 1);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header & Controls */}
      <div className={`sticky top-0 z-30 backdrop-blur-md border-b p-4 md:px-8 shadow-md transition-colors ${
        isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                MediaCloud
              </h1>
              {onRefresh && (
                <button 
                  onClick={onRefresh} 
                  className={`p-2 ml-2 rounded-full transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                  title="Reload Data"
                >
                  <RefreshCw className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              )}
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search media..."
                className={`w-full rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-white border border-gray-300 text-gray-900'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Type Filter */}
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <select
                  className={`rounded-lg pl-9 pr-8 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isDark 
                      ? 'bg-gray-800 border border-gray-700 text-white' 
                      : 'bg-white border border-gray-300 text-gray-900'
                  }`}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="audio">Audio</option>
                </select>
              </div>

              {/* Category Filter */}
              <select
                className={`rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 text-white' 
                    : 'bg-white border border-gray-300 text-gray-900'
                }`}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map((cat: any) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <div className="relative">
                <SlidersHorizontal className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <select
                  className={`rounded-lg pl-9 pr-8 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                    isDark 
                      ? 'bg-gray-800 border border-gray-700 text-white' 
                      : 'bg-white border border-gray-300 text-gray-900'
                  }`}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                >
                  <option value="title">Sort: Title</option>
                  <option value="category">Sort: Category</option>
                  <option value="type">Sort: Type</option>
                  <option value="recent">Sort: Most Viewed</option>
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                }`}
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>

              {/* Favorites Filter */}
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  showFavoritesOnly 
                    ? 'bg-pink-500 text-white' 
                    : isDark 
                      ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300' 
                      : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                }`}
                title={showFavoritesOnly ? 'Show all' : 'Show favorites only'}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium hidden sm:inline">
                  {showFavoritesOnly ? 'Favorites' : 'All'}
                </span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center">
              {/* View Mode Toggle */}
              <div className={`flex rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Grid view"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : isDark 
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-yellow-400' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                }`}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Stats */}
              <button
                onClick={() => setShowStats(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                }`}
                title="View statistics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              {/* Open API Discover */}
              <button
                onClick={() => setShowDiscover(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-purple-300' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100 text-purple-700'
                }`}
                title="Open API tools"
              >
                <Sparkles className="w-4 h-4" />
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShowShortcuts(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700'
                }`}
                title="Keyboard shortcuts (?)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className={`mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Showing {filteredItems.length} of {allItems.length} items
            {searchTerm && ` matching "${searchTerm}"`}
            {filterType !== 'all' && ` in ${filterType}s`}
            {filterCategory !== 'all' && ` under ${filterCategory}`}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Top Section: Weather + Quick Stats */}
        {!searchTerm && filterType === 'all' && !showFavoritesOnly && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <WeatherWidget />
            <div className={`rounded-2xl border p-5 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-3 font-semibold"><ImageIcon className="w-5 h-5 text-blue-400" />Images Section</div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allItems.filter(i => i.type === 'image').length}</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total images in gallery</p>
              <button onClick={() => setFilterType('image')} className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors">View All Images</button>
            </div>
            <div className={`rounded-2xl border p-5 ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 mb-3 font-semibold"><Film className="w-5 h-5 text-purple-400" />Videos & Audio</div>
              <div className="flex gap-4">
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allItems.filter(i => i.type === 'video').length}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Videos</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{allItems.filter(i => i.type === 'audio').length}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Audio</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setFilterType('video')} className="flex-1 text-xs bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg transition-colors">Videos</button>
                <button onClick={() => setFilterType('audio')} className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition-colors">Audio</button>
              </div>
            </div>
          </div>
        )}

        {playlistGroups.length > 0 && !searchTerm && filterType === 'all' && !showFavoritesOnly && (
          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Auto YouTube Playlists</h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Same category or Day 1, Day 2 style videos are grouped automatically.</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {playlistGroups.map(([name, group]) => (
                <button
                  key={name}
                  onClick={() => {
                    setFilterType('video');
                    setFilterCategory(group[0].category || 'all');
                    showToast('info', `${name} playlist opened (${group.length} videos)`);
                  }}
                  className={`rounded-xl border p-3 text-left transition-colors ${isDark ? 'border-gray-700 bg-gray-800/70 hover:bg-gray-800' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-black">
                      <img src={`https://img.youtube.com/vi/${isYouTubeUrl(group[0].src) ? group[0].src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] : ''}/mqdefault.jpg`} alt={group[0].title} className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">{group.length}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold capitalize">{name}</p>
                      <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{group.length} YouTube videos</p>
                      <p className="mt-1 truncate text-xs text-blue-400">{group[0].title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl">🔍</div>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No media found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
                setShowFavoritesOnly(false);
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                viewMode="grid"
                onClick={() => setSelectedItemIndex(index)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, index) => (
              <MediaCard
                key={item.id}
                item={item}
                viewMode="list"
                onClick={() => setSelectedItemIndex(index)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItemIndex !== null && (
        <Lightbox
          item={filteredItems[selectedItemIndex]}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {/* Stats Dashboard Modal */}
      {showStats && (
        <StatsDashboard items={allItems} onClose={() => setShowStats(false)} />
      )}

      {showDiscover && (
        <DiscoverPanel
          onClose={() => setShowDiscover(false)}
          onAddMedia={(item) => {
            setExtraItems(prev => [item, ...prev]);
            setShowDiscover(false);
            showToast('success', `${item.title} added to gallery preview`);
          }}
          isDark={isDark}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};
