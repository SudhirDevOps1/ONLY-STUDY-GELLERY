import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sun, Moon, BarChart3, Keyboard, SortAsc, SortDesc, Heart,
  SlidersHorizontal, Search, Filter, Grid3x3, List, Image as ImageIcon, Film, Music,
  Wrench, CloudSun, Calculator, Laugh, Newspaper, DollarSign, GraduationCap,
  Code, Utensils, Gamepad2, Database, Users, BookOpen, Sparkles,
  Globe, MessageSquare, Menu, X
} from 'lucide-react';
import { MediaItem, SortBy, SortOrder, ViewMode, Theme } from './types';
import mediaData from '../public/data/media.json';
import { MediaCard } from './components/MediaCard';
import { Lightbox } from './components/Lightbox';
import { StatsDashboard } from './components/StatsDashboard';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { ToastContainer, useToast } from './components/Toast';
import { storage } from './utils/storage';
import { PlaylistView, PlaylistDetail } from './components/PlaylistView';
import { Playlist } from './utils/playlistEngine';

// Section imports
import { ToolsSection } from './components/sections/ToolsSection';
import { WeatherSection } from './components/sections/WeatherSection';
import { CalculatorSection } from './components/sections/CalculatorSection';
import { FunSection } from './components/sections/FunSection';
import { FinanceSection } from './components/sections/FinanceSection';
import {
  NewsSection, EducationSection, DeveloperSection, FoodSection,
  PokemonSection, WellnessSection, WorldSection, SocialSection,
  NamePredictorSection, AnimeSection, CountriesSection, ReadingSection, ColorSection,
  DogBreedsSection, BooksSection, ArtGallerySection, SpaceXSection, MusicSearchSection
} from './components/sections/MoreSections';
import { GroupsSection } from './components/sections/GroupsSection';

// Sidebar sections config
const SECTIONS = [
  { id: 'gallery', name: 'Gallery', icon: Grid3x3, color: 'blue', desc: 'Media library' },
  { id: 'groups', name: 'Image Groups', icon: ImageIcon, color: 'pink', desc: 'Pexels search' },
  { id: 'tools', name: 'Tools', icon: Wrench, color: 'cyan', desc: '8+ free tools' },
  { id: 'weather', name: 'Weather', icon: CloudSun, color: 'yellow', desc: 'Live weather' },
  { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'green', desc: '20+ formulas' },
  { id: 'fun', name: 'Fun Zone', icon: Laugh, color: 'pink', desc: 'Jokes & trivia' },
  { id: 'news', name: 'News', icon: Newspaper, color: 'orange', desc: 'World news' },
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'emerald', desc: 'Crypto/currency' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'indigo', desc: 'Universities' },
  { id: 'developer', name: 'Dev Tools', icon: Code, color: 'violet', desc: 'QR/UUID/Pass' },
  { id: 'food', name: 'Food', icon: Utensils, color: 'amber', desc: 'Recipes' },
  { id: 'pokemon', name: 'Pokemon', icon: Gamepad2, color: 'rose', desc: '1000+ Pokemon' },
  { id: 'anime', name: 'Anime', icon: Sparkles, color: 'pink', desc: 'MyAnimeList' },
  { id: 'wellness', name: 'Wellness', icon: Heart, color: 'red', desc: 'Health calcs' },
  { id: 'countries', name: 'Countries', icon: Globe, color: 'lime', desc: '250 countries' },
  { id: 'world', name: 'World Clock', icon: Globe, color: 'cyan', desc: 'Timezones' },
  { id: 'social', name: 'Social', icon: Users, color: 'fuchsia', desc: 'Random users' },
  { id: 'predictor', name: 'Predictor', icon: Database, color: 'purple', desc: 'Age/Gender' },
  { id: 'reading', name: 'Reading', icon: BookOpen, color: 'sky', desc: 'Posts/Lorem' },
  { id: 'colors', name: 'Colors', icon: MessageSquare, color: 'purple', desc: 'Palettes' },
  { id: 'dogbreeds', name: 'Dog Breeds', icon: Heart, color: 'amber', desc: 'All breeds' },
  { id: 'books', name: 'Books', icon: BookOpen, color: 'indigo', desc: 'Open Library' },
  { id: 'art', name: 'Art Gallery', icon: Sparkles, color: 'violet', desc: 'Met Museum' },
  { id: 'spacex', name: 'SpaceX', icon: Globe, color: 'blue', desc: 'Launches' },
  { id: 'music', name: 'Music', icon: Music, color: 'green', desc: 'iTunes Search' },
];

const App: React.FC = () => {
  const [items] = useState<MediaItem[]>(mediaData as MediaItem[]);
  const [extraItems, setExtraItems] = useState<MediaItem[]>([]);
  const allItems = useMemo(() => [...items, ...extraItems], [items, extraItems]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [activeSection, setActiveSection] = useState('gallery');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  const { toasts, showToast, dismissToast } = useToast();
  const isDark = theme === 'dark';

  const categories = useMemo(() => {
    const s = new Set<string>();
    allItems.forEach(i => { if (i.category) s.add(i.category); });
    return ['all', ...Array.from(s)];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let result = allItems.filter(i => {
      const ms = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || (i.description?.toLowerCase().includes(searchTerm.toLowerCase()));
      return ms && (filterType === 'all' || i.type === filterType) && (filterCategory === 'all' || i.category === filterCategory) && (!showFavoritesOnly || storage.isFavorite(i.id));
    });
    result.sort((a, b) => {
      let c = 0;
      if (sortBy === 'title') c = a.title.localeCompare(b.title);
      else if (sortBy === 'category') c = (a.category || '').localeCompare(b.category || '');
      else if (sortBy === 'type') c = a.type.localeCompare(b.type);
      else c = storage.getViewCount(b.id) - storage.getViewCount(a.id);
      return sortOrder === 'asc' ? c : -c;
    });
    return result;
  }, [allItems, searchTerm, filterType, filterCategory, sortBy, sortOrder, showFavoritesOnly, refreshKey]);

  // Smart Playlists now handled by playlistEngine - playlistGroups removed

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex < filteredItems.length - 1) setSelectedItemIndex(selectedItemIndex + 1);
  }, [selectedItemIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) setSelectedItemIndex(selectedItemIndex - 1);
  }, [selectedItemIndex]);

  const addToGallery = (item: MediaItem) => {
    setExtraItems(prev => [item, ...prev]);
    showToast('success', `${item.title} added to gallery!`);
  };

  const toggleFavorite = (id: string | number) => {
    const wasAdded = storage.toggleFavorite(id);
    showToast('info', wasAdded ? 'Added to favorites ❤️' : 'Removed from favorites');
    setRefreshKey(p => p + 1);
  };

  useEffect(() => { storage.setSettings({ theme, viewMode, sortBy, sortOrder, showFavoritesOnly }); }, [theme, viewMode, sortBy, sortOrder, showFavoritesOnly]);
  useEffect(() => {
    const saved = storage.getSettings();
    if (saved) {
      setTheme(saved.theme || 'dark');
      setViewMode(saved.viewMode || 'grid');
      setSortBy(saved.sortBy || 'title');
      setSortOrder(saved.sortOrder || 'asc');
      setShowFavoritesOnly(saved.showFavoritesOnly || false);
    }
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '?') { e.preventDefault(); setShowShortcuts(p => !p); }
      if (e.key === 'Escape') { setShowStats(false); setShowShortcuts(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Color map
  const colors: Record<string, string> = {
    blue: 'text-blue-400', cyan: 'text-cyan-400', yellow: 'text-yellow-400', green: 'text-green-400',
    pink: 'text-pink-400', orange: 'text-orange-400', emerald: 'text-emerald-400', indigo: 'text-indigo-400',
    violet: 'text-violet-400', amber: 'text-amber-400', rose: 'text-rose-400', red: 'text-red-400',
    lime: 'text-lime-400', fuchsia: 'text-fuchsia-400', purple: 'text-purple-400', sky: 'text-sky-400'
  };

  const colorsBg: Record<string, string> = {
    blue: 'bg-blue-600', cyan: 'bg-cyan-600', yellow: 'bg-yellow-600', green: 'bg-green-600',
    pink: 'bg-pink-600', orange: 'bg-orange-600', emerald: 'bg-emerald-600', indigo: 'bg-indigo-600',
    violet: 'bg-violet-600', amber: 'bg-amber-600', rose: 'bg-rose-600', red: 'bg-red-600',
    lime: 'bg-lime-600', fuchsia: 'bg-fuchsia-600', purple: 'bg-purple-600', sky: 'bg-sky-600'
  };

  // Render section
  const renderSection = () => {
    switch (activeSection) {
      case 'gallery':
        return (
          <div>
            {/* Gallery Top Bar - Fully Responsive */}
            <div className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-gray-800 p-3 sm:p-4 md:px-8">
              <div className="max-w-7xl mx-auto">
                {/* Title + Search */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between mb-3 ml-12 lg:ml-0">
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">📁 Gallery</h1>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                {/* Filters - scroll on mobile */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 overflow-x-auto">
                    <div className="relative">
                      <Filter className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-6 py-1.5 sm:py-2 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer">
                        <option value="all">All</option><option value="image">Images</option><option value="video">Videos</option><option value="audio">Audio</option>
                      </select>
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer max-w-[120px] sm:max-w-none truncate">
                      {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                    </select>
                    <div className="relative">
                      <SlidersHorizontal className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-6 py-1.5 sm:py-2 text-xs sm:text-sm text-white outline-none appearance-none cursor-pointer">
                        <option value="title">Title</option><option value="category">Cat</option><option value="type">Type</option><option value="recent">Views</option>
                      </select>
                    </div>
                    <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="p-1.5 sm:p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700">{sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}</button>
                    <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`p-1.5 sm:p-2 rounded-lg ${showFavoritesOnly ? 'bg-pink-500' : 'bg-gray-800 border border-gray-700'}`}><Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} /></button>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    <div className="flex rounded-lg border border-gray-700 overflow-hidden">
                      <button onClick={() => setViewMode('grid')} className={`p-1.5 sm:p-2 ${viewMode === 'grid' ? 'bg-blue-500' : 'bg-gray-800'}`}><Grid3x3 className="w-4 h-4" /></button>
                      <button onClick={() => setViewMode('list')} className={`p-1.5 sm:p-2 ${viewMode === 'list' ? 'bg-blue-500' : 'bg-gray-800'}`}><List className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className="p-1.5 sm:p-2 rounded-lg bg-gray-800 border border-gray-700 text-yellow-400">{isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
                    <button onClick={() => setShowStats(true)} className="p-1.5 sm:p-2 rounded-lg bg-gray-800 border border-gray-700"><BarChart3 className="w-4 h-4" /></button>
                    <button onClick={() => setShowShortcuts(true)} className="p-1.5 sm:p-2 rounded-lg bg-gray-800 border border-gray-700"><Keyboard className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">Showing {filteredItems.length} of {allItems.length}</p>
              </div>
            </div>

            {/* Gallery Content */}
            <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8">
              {/* Quick guide banner - removed */}

              {/* Top stats */}
              <div className="grid gap-3 sm:gap-4 grid-cols-3 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /><span className="text-xs sm:text-sm font-semibold">Images</span></div>
                  <p className="text-xl sm:text-3xl font-bold text-white">{allItems.filter(i => i.type === 'image').length}</p>
                  <button onClick={() => setFilterType('image')} className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-full sm:w-auto">View</button>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><Film className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /><span className="text-xs sm:text-sm font-semibold">Videos</span></div>
                  <p className="text-xl sm:text-3xl font-bold text-white">{allItems.filter(i => i.type === 'video').length}</p>
                  <button onClick={() => setFilterType('video')} className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-full sm:w-auto">View</button>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-5">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2"><Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /><span className="text-xs sm:text-sm font-semibold">Audio</span></div>
                  <p className="text-xl sm:text-3xl font-bold text-white">{allItems.filter(i => i.type === 'audio').length}</p>
                  <button onClick={() => setFilterType('audio')} className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs bg-green-600 hover:bg-green-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-full sm:w-auto">View</button>
                </div>
              </div>

              {/* SMART PLAYLISTS - Fully Dynamic */}
              {activePlaylist ? (
                <PlaylistDetail
                  playlist={activePlaylist}
                  onBack={() => setActivePlaylist(null)}
                  onSelectItem={(idx) => {
                    const itemFromPlaylist = activePlaylist.items[idx];
                    const globalIdx = filteredItems.findIndex(i => i.id === itemFromPlaylist.id);
                    setSelectedItemIndex(globalIdx >= 0 ? globalIdx : 0);
                  }}
                  isDark={isDark}
                />
              ) : (
                <PlaylistView
                  items={allItems}
                  onOpenPlaylist={(pl) => setActivePlaylist(pl)}
                  onSelectDirectItem={(item) => {
                    const idx = filteredItems.findIndex(i => i.id === item.id);
                    setSelectedItemIndex(idx >= 0 ? idx : 0);
                  }}
                  isDark={isDark}
                />
              )}

              {/* Grid/List */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-20"><p className="text-6xl mb-4">🔍</p><p className="text-gray-400">No items found</p></div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map((item, idx) => <MediaCard key={item.id} item={item} viewMode="grid" onClick={() => setSelectedItemIndex(idx)} onToggleFavorite={toggleFavorite} />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map((item, idx) => <MediaCard key={item.id} item={item} viewMode="list" onClick={() => setSelectedItemIndex(idx)} onToggleFavorite={toggleFavorite} />)}
                </div>
              )}
            </div>

            {selectedItemIndex !== null && (
              <Lightbox item={filteredItems[selectedItemIndex]} onClose={() => setSelectedItemIndex(null)} onNext={handleNext} onPrev={handlePrev} />
            )}
          </div>
        );

      case 'groups': return <GroupsSection onAddMedia={addToGallery} isDark={isDark} />;
      case 'tools': return <ToolsSection onAddMedia={addToGallery} showToast={showToast} />;
      case 'weather': return <WeatherSection />;
      case 'calculator': return <CalculatorSection />;
      case 'fun': return <FunSection />;
      case 'news': return <NewsSection />;
      case 'finance': return <FinanceSection />;
      case 'education': return <EducationSection />;
      case 'developer': return <DeveloperSection />;
      case 'food': return <FoodSection onAddMedia={addToGallery} showToast={showToast} />;
      case 'pokemon': return <PokemonSection />;
      case 'wellness': return <WellnessSection />;
      case 'world': return <WorldSection />;
      case 'social': return <SocialSection />;
      case 'predictor': return <NamePredictorSection />;
      case 'anime': return <AnimeSection onAddMedia={addToGallery} showToast={showToast} />;
      case 'countries': return <CountriesSection />;
      case 'reading': return <ReadingSection />;
      case 'colors': return <ColorSection />;
      case 'dogbreeds': return <DogBreedsSection />;
      case 'books': return <BooksSection onAddMedia={addToGallery} showToast={showToast} />;
      case 'art': return <ArtGallerySection onAddMedia={addToGallery} showToast={showToast} />;
      case 'spacex': return <SpaceXSection />;
      case 'music': return <MusicSearchSection />;
      default: return <div className="p-8 text-center text-gray-400">Section coming soon...</div>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile menu button */}
      <button onClick={() => setSidebarOpen(true)} className="fixed top-4 left-4 z-[60] lg:hidden p-3 bg-gray-800 rounded-xl text-white shadow-xl border border-gray-700">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 bottom-0 z-[58] w-72 bg-gray-950 border-r border-gray-800 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Grid3x3 className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-white">Study Gallery</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">by SudhirDevOps1</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { setActiveSection(s.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  isActive ? `${colorsBg[s.color]} text-white shadow-lg` : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : colors[s.color]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  {!isActive && <p className="text-[10px] text-gray-500 truncate">{s.desc}</p>}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 mt-4 space-y-2">
          <p className="text-xs text-gray-500 text-center">
            ✨ Powered by free public APIs
          </p>
          <p className="text-[10px] text-gray-600 text-center">
            © {new Date().getFullYear()} <span className="text-gray-400 font-semibold">SudhirDevOps1</span>
          </p>
          <a
            href="https://github.com/SudhirDevOps1/ONLY-STUDY-GELLERY"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-blue-400 hover:text-blue-300 text-center truncate"
          >
            ONLY-STUDY-GELLERY
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72">
        {renderSection()}
      </main>

      {/* Modals */}
      {showStats && <StatsDashboard items={allItems} onClose={() => setShowStats(false)} />}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
    </div>
  );
};

export default App;
