import React, { useState, useEffect } from 'react';
import {
  X, CloudSun, MapPin, Laugh, Languages, Sparkles, Image, Plus,
  Copy, Loader2, RefreshCw, Rocket, Globe, Droplets, Wind
} from 'lucide-react';
import { MediaItem } from '../types';
import { copyToClipboard } from '../utils/storage';
import {
  getEnglishJoke, getHindiJoke, getNasaApod, getUnsplashPhoto,
  getRandomWallpaper, searchGiphy, getIpAndWeather, WeatherData, IpData, NasaData, UnsplashData
} from '../utils/apiService';

interface DiscoverPanelProps {
  onClose: () => void;
  onAddMedia: (item: MediaItem) => void;
  isDark: boolean;
}

export const DiscoverPanel: React.FC<DiscoverPanelProps> = ({ onClose, onAddMedia, isDark }) => {
  const [activeTab, setActiveTab] = useState('api');

  // States
  const [loading, setLoading] = useState<string | null>(null);
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [englishJoke, setEnglishJoke] = useState('Click refresh to load joke.');
  const [hindiJoke, setHindiJoke] = useState(getHindiJoke());
  const [nasa, setNasa] = useState<NasaData | null>(null);
  const [wallpaper, setWallpaper] = useState(getRandomWallpaper());
  const [unsplashQuery, setUnsplashQuery] = useState('nature');
  const [unsplash, setUnsplash] = useState<UnsplashData | null>(null);
  const [gifQuery, setGifQuery] = useState('funny');
  const [gifUrls, setGifUrls] = useState<string[]>([]);

  // Load IP + Weather on mount
  useEffect(() => {
    fetchIpWeather();
    fetchGifs();
  }, []);

  const fetchIpWeather = async () => {
    setLoading('ipweather');
    try {
      const result = await getIpAndWeather();
      setIpData(result.ip);
      setWeather(result.weather);
    } catch { }
    setLoading(null);
  };

  const fetchEnglishJoke = async () => {
    setLoading('joke-en');
    const data = await getEnglishJoke();
    setEnglishJoke(data.joke || `${data.setup} ${data.punchline}`);
    setLoading(null);
  };

  const fetchNasa = async () => {
    setLoading('nasa');
    try { setNasa(await getNasaApod()); } catch { }
    setLoading(null);
  };

  const fetchUnsplash = async () => {
    setLoading('unsplash');
    try { setUnsplash(await getUnsplashPhoto(unsplashQuery)); } catch { }
    setLoading(null);
  };

  const fetchGifs = async () => {
    setLoading('gif');
    try {
      const urls = await searchGiphy(gifQuery, 8);
      setGifUrls(urls);
    } catch { }
    setLoading(null);
  };

  const addToGallery = (title: string, src: string, category: string, desc: string, type: 'image' | 'video' | 'audio' = 'image') => {
    onAddMedia({ id: `api-${Date.now()}-${Math.random().toString(36).slice(2)}`, title, type, src, category, description: desc, addedAt: Date.now() });
  };

  const tabs = [
    { id: 'api', label: 'API Tools', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'weather', label: 'Weather & IP', icon: <CloudSun className="w-4 h-4" /> },
    { id: 'jokes', label: 'Jokes', icon: <Laugh className="w-4 h-4" /> },
    { id: 'wallpaper', label: 'Wallpapers', icon: <Image className="w-4 h-4" /> },
    { id: 'gif', label: 'GIFs', icon: <Globe className="w-4 h-4" /> },
    { id: 'nasa', label: 'NASA', icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <div className="mx-auto max-w-7xl p-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-2xl border border-white/10 bg-gray-900/95 p-4 backdrop-blur-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Discover & Tools</h2>
              <p className="text-xs text-gray-400">Free APIs - GIF, Weather, Jokes, NASA, Wallpapers & More</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'api' && (
          <ApiToolsTab
            ipData={ipData}
            weather={weather}
            loading={loading}
            englishJoke={englishJoke}
            hindiJoke={hindiJoke}
            wallpaper={wallpaper}
            nasa={nasa}
            unsplash={unsplash}
            gifUrls={gifUrls}
            gifQuery={gifQuery}
            unsplashQuery={unsplashQuery}
            setGifQuery={setGifQuery}
            setUnsplashQuery={setUnsplashQuery}
            onFetchJokeEn={fetchEnglishJoke}
            onFetchNasa={fetchNasa}
            onFetchUnsplash={fetchUnsplash}
            onFetchGifs={fetchGifs}
            onRefreshWallpaper={() => setWallpaper(getRandomWallpaper())}
            onHindiJoke={() => setHindiJoke(getHindiJoke())}
            onAdd={addToGallery}
            onCopy={copyToClipboard}
            isDark={isDark}
          />
        )}

        {activeTab === 'weather' && (
          <WeatherTab ipData={ipData} weather={weather} loading={loading} onRefresh={fetchIpWeather} isDark={isDark} />
        )}

        {activeTab === 'jokes' && (
          <JokesTab
            englishJoke={englishJoke}
            hindiJoke={hindiJoke}
            loadingEn={loading === 'joke-en'}
            onFetchEn={fetchEnglishJoke}
            onHindiNext={() => setHindiJoke(getHindiJoke())}
            isDark={isDark}
          />
        )}

        {activeTab === 'wallpaper' && (
          <WallpaperTab
            wallpaper={wallpaper}
            unsplash={unsplash}
            unsplashQuery={unsplashQuery}
            setUnsplashQuery={setUnsplashQuery}
            loading={loading}
            onRefreshWallpaper={() => setWallpaper(getRandomWallpaper())}
            onFetchUnsplash={fetchUnsplash}
            onAdd={addToGallery}
            onCopy={copyToClipboard}
            isDark={isDark}
          />
        )}

        {activeTab === 'gif' && (
          <GifTab
            gifUrls={gifUrls}
            gifQuery={gifQuery}
            setGifQuery={setGifQuery}
            loading={loading}
            onSearch={fetchGifs}
            onAdd={addToGallery}
            onCopy={copyToClipboard}
            isDark={isDark}
          />
        )}

        {activeTab === 'nasa' && (
          <NasaTab
            nasa={nasa}
            loading={loading}
            onFetch={fetchNasa}
            onAdd={addToGallery}
            onCopy={copyToClipboard}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );
};

// ===== API TOOLS OVERVIEW TAB =====
function ApiToolsTab({ ipData, weather, loading, englishJoke, hindiJoke, wallpaper, nasa, onFetchJokeEn, onFetchNasa, onRefreshWallpaper, onHindiJoke, onAdd, onCopy, isDark }: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Weather Card */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50'}`}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-white"><CloudSun className="w-5 h-5 text-blue-400" />Weather</div>
        {weather ? (
          <div>
            <div className="text-4xl mb-2">{weather.icon}</div>
            <div className="text-2xl font-bold text-white">{weather.temp}°C</div>
            <div className="text-sm text-gray-300">{weather.description}</div>
            {ipData && <div className="text-xs text-gray-500 mt-2">📍 {ipData.city}, {ipData.country}</div>}
          </div>
        ) : (
          <div className="text-sm text-gray-400">{loading === 'ipweather' ? 'Loading...' : 'Click Weather tab'}</div>
        )}
      </div>

      {/* IP Info */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-green-500/20 bg-green-500/5' : 'border-green-200 bg-green-50'}`}>
        <div className="flex items-center gap-2 mb-3 font-semibold text-white"><MapPin className="w-5 h-5 text-green-400" />IP Location</div>
        {ipData ? (
          <div className="text-sm text-gray-300 space-y-1">
            <p>🌐 IP: <span className="text-white font-mono">{ipData.ip}</span></p>
            <p>📍 {ipData.city}, {ipData.region}, {ipData.country}</p>
            <p>🏢 {ipData.org}</p>
          </div>
        ) : <p className="text-sm text-gray-400">Loading...</p>}
      </div>

      {/* English Joke */}
      <MiniCard icon={<Laugh />} title="English Joke" btn="Next" loading={loading === 'joke-en'} onBtn={onFetchJokeEn} isDark={isDark}>
        <p className="text-sm text-gray-300">{englishJoke}</p>
      </MiniCard>

      {/* Hindi Joke */}
      <MiniCard icon={<Languages />} title="Hindi Joke" btn="Next" onBtn={onHindiJoke} isDark={isDark}>
        <p className="text-sm text-gray-300">Q: {hindiJoke.q}</p>
        <p className="text-sm text-yellow-300 mt-1">A: {hindiJoke.a}</p>
      </MiniCard>

      {/* Random Wallpaper */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-pink-500/20 bg-pink-500/5' : 'border-pink-200 bg-pink-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-white"><Image className="w-5 h-5 text-pink-400" />Wallpaper</div>
          <button onClick={onRefreshWallpaper} className="text-xs bg-pink-600 px-3 py-1.5 rounded-lg hover:bg-pink-500 text-white">New</button>
        </div>
        <img src={wallpaper} alt="Wallpaper" className="w-full h-32 object-cover rounded-xl mb-3" loading="lazy" />
        <div className="flex gap-2">
          <button onClick={() => onCopy(wallpaper)} className="flex-1 text-xs bg-white/10 py-2 rounded-lg hover:bg-white/20 text-white flex items-center justify-center gap-1"><Copy className="w-3 h-3" />Copy</button>
          <button onClick={() => onAdd('Random Wallpaper', wallpaper, 'wallpaper', 'Random wallpaper from Picsum')} className="flex-1 text-xs bg-green-600 py-2 rounded-lg hover:bg-green-500 text-white flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Add</button>
        </div>
      </div>

      {/* NASA */}
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-white"><Rocket className="w-5 h-5 text-indigo-400" />NASA APOD</div>
          <button onClick={onFetchNasa} className="text-xs bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-500 text-white">{loading === 'nasa' ? '...' : 'Load'}</button>
        </div>
        {nasa?.url ? (
          <>
            <img src={nasa.url} alt={nasa.title} className="w-full h-32 object-cover rounded-xl mb-3" loading="lazy" />
            <p className="text-xs text-gray-300 mb-2 truncate">{nasa.title}</p>
            <button onClick={() => onAdd(nasa.title, nasa.url, 'nasa', nasa.explanation)} className="w-full text-xs bg-green-600 py-2 rounded-lg hover:bg-green-500 text-white flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Add to Gallery</button>
          </>
        ) : <p className="text-sm text-gray-400">Load NASA Astronomy Picture of the Day</p>}
      </div>
    </div>
  );
}

// ===== WEATHER TAB =====
function WeatherTab({ ipData, weather, onRefresh, isDark }: any) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`rounded-2xl border p-8 ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50'}`}>
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{weather?.icon || '🌡️'}</div>
          <div className="text-5xl font-bold text-white">{weather?.temp || '--'}°C</div>
          <div className="text-lg text-gray-300 mt-2">{weather?.description || 'Loading...'}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{weather?.humidity || '--'}%</div>
            <div className="text-xs text-gray-400">Humidity</div>
          </div>
          <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <Wind className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">{weather?.wind || '--'} km/h</div>
            <div className="text-xs text-gray-400">Wind Speed</div>
          </div>
        </div>
        {ipData && (
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-400"><MapPin className="w-4 h-4 inline mr-1" />{ipData.city}, {ipData.region}, {ipData.country}</p>
            <p className="text-xs text-gray-500 mt-1">IP: {ipData.ip} • {weather?.source === 'location' ? 'GPS Location' : 'IP-based Location'}</p>
          </div>
        )}
        <button onClick={onRefresh} className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
          <RefreshCw className="w-4 h-4" />Refresh Weather
        </button>
      </div>
    </div>
  );
}

// ===== JOKES TAB =====
function JokesTab({ englishJoke, hindiJoke, loadingEn, onFetchEn, onHindiNext, isDark }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
      <div className={`rounded-2xl border p-6 ${isDark ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-yellow-200 bg-yellow-50'}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Laugh className="w-5 h-5 text-yellow-400" />English Joke</h3>
        <div className={`min-h-[100px] p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className="text-gray-200 leading-relaxed">{englishJoke}</p>
        </div>
        <button onClick={onFetchEn} disabled={loadingEn} className="mt-4 w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-60 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
          {loadingEn ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Get Another Joke
        </button>
      </div>

      <div className={`rounded-2xl border p-6 ${isDark ? 'border-orange-500/20 bg-orange-500/5' : 'border-orange-200 bg-orange-50'}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Languages className="w-5 h-5 text-orange-400" />Hindi Joke 😂</h3>
        <div className={`min-h-[100px] p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className="text-gray-200 mb-2">Q: {hindiJoke.q}</p>
          <p className="text-yellow-300 font-medium">A: {hindiJoke.a}</p>
        </div>
        <button onClick={onHindiNext} className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />Aur Ek Joke! 😂
        </button>
      </div>
    </div>
  );
}

// ===== WALLPAPER TAB =====
function WallpaperTab({ wallpaper, unsplash, unsplashQuery, setUnsplashQuery, loading, onRefreshWallpaper, onFetchUnsplash, onAdd, onCopy, isDark }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-5xl mx-auto">
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-pink-500/20 bg-pink-500/5' : 'border-pink-200 bg-pink-50'}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Image className="w-5 h-5 text-pink-400" />Random Wallpaper</h3>
        <img src={wallpaper} alt="Wallpaper" className="w-full h-48 object-cover rounded-xl mb-4" loading="lazy" />
        <div className="flex gap-2">
          <button onClick={onRefreshWallpaper} className="flex-1 bg-pink-600 hover:bg-pink-500 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-1"><RefreshCw className="w-4 h-4" />New</button>
          <button onClick={() => onCopy(wallpaper)} className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl"><Copy className="w-4 h-4" /></button>
          <button onClick={() => onAdd('Random Wallpaper', wallpaper, 'wallpaper', 'Random wallpaper')} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-1"><Plus className="w-4 h-4" />Add</button>
        </div>
      </div>

      <div className={`rounded-2xl border p-5 ${isDark ? 'border-violet-500/20 bg-violet-500/5' : 'border-violet-200 bg-violet-50'}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Sparkles className="w-5 h-5 text-violet-400" />Unsplash Search</h3>
        <div className="flex gap-2 mb-4">
          <input value={unsplashQuery} onChange={e => setUnsplashQuery(e.target.value)} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500" placeholder="Search topic..." />
          <button onClick={onFetchUnsplash} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm">{loading === 'unsplash' ? '...' : 'Search'}</button>
        </div>
        {unsplash && (
          <>
            <img src={unsplash.url} alt={unsplash.description} className="w-full h-48 object-cover rounded-xl mb-3" loading="lazy" />
            <p className="text-xs text-gray-400 mb-3">📸 {unsplash.author} • {unsplash.description}</p>
            <div className="flex gap-2">
              <button onClick={() => onCopy(unsplash.url)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl text-xs flex items-center justify-center gap-1"><Copy className="w-3 h-3" />Copy</button>
              <button onClick={() => onAdd(`Unsplash: ${unsplashQuery}`, unsplash.url, 'unsplash', `By ${unsplash.author}`)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl text-xs flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== GIF TAB =====
function GifTab({ gifUrls, gifQuery, setGifQuery, loading, onSearch, onAdd, onCopy, isDark }: any) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className={`rounded-2xl border p-5 ${isDark ? 'border-pink-500/20 bg-pink-500/5' : 'border-pink-200 bg-pink-50'}`}>
        <div className="flex gap-2 mb-4">
          <input value={gifQuery} onChange={e => setGifQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSearch()} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-pink-500" placeholder="Search GIFs..." />
          <button onClick={onSearch} className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2">
            {loading === 'gif' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gifUrls.map((url: string, i: number) => (
            <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
              <img src={url} alt={`GIF ${i + 1}`} className="w-full h-32 object-cover" loading="lazy" />
              <div className="flex gap-1 p-2">
                <button onClick={() => onCopy(url)} className="flex-1 bg-white/10 hover:bg-white/20 text-white py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"><Copy className="w-3 h-3" /></button>
                <button onClick={() => onAdd(`GIF: ${gifQuery}`, url, 'gif', `GIF search: ${gifQuery}`)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          {gifUrls.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Search for GIFs above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== NASA TAB =====
function NasaTab({ nasa, loading, onFetch, onAdd, onCopy, isDark }: any) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className={`rounded-2xl border p-6 ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
        <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4"><Rocket className="w-5 h-5 text-indigo-400" />NASA Astronomy Picture of the Day</h3>
        {!nasa?.url ? (
          <div className="text-center py-10">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-indigo-400/50" />
            <p className="text-gray-400 mb-4">Click below to load today's NASA picture</p>
            <button onClick={onFetch} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 mx-auto">
              {loading === 'nasa' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Load NASA APOD
            </button>
          </div>
        ) : (
          <>
            <img src={nasa.url} alt={nasa.title} className="w-full rounded-xl mb-4 max-h-96 object-cover" loading="lazy" />
            <h4 className="text-xl font-bold text-white mb-2">{nasa.title}</h4>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{nasa.explanation?.substring(0, 300)}...</p>
            <p className="text-xs text-gray-500 mb-4">📅 {nasa.date}</p>
            <div className="flex gap-2">
              <button onClick={onFetch} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-1"><RefreshCw className="w-4 h-4" />Refresh</button>
              <button onClick={() => onCopy(nasa.url)} className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl"><Copy className="w-4 h-4" /></button>
              <button onClick={() => onAdd(nasa.title, nasa.url, 'nasa', nasa.explanation)} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-1"><Plus className="w-4 h-4" />Add to Gallery</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== MINI CARD =====
function MiniCard({ icon, title, btn, loading, onBtn, children, isDark }: any) {
  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-yellow-200 bg-yellow-50'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold text-white">{icon}{title}</div>
        <button onClick={onBtn} className="text-xs bg-yellow-600 px-3 py-1.5 rounded-lg hover:bg-yellow-500 text-white">
          {loading ? '...' : btn}
        </button>
      </div>
      {children}
    </div>
  );
}
