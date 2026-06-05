import React, { useEffect, useState } from 'react';
import { Search, MapPin, Thermometer, CloudRain } from 'lucide-react';
import { SectionHeader, LoadingSpinner, ErrorBox, StatBlock, ActionButton } from './SectionBase';
import * as api from '../../utils/apis';

export const WeatherSection: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadFromIp = async () => {
    setLoading(true);
    setError('');
    try {
      const ipResult = await api.getIpLocation();
      if (!ipResult.success) throw new Error(ipResult.error);
      const weatherResult = await api.getWeather(ipResult.data.latitude, ipResult.data.longitude);
      if (!weatherResult.success) throw new Error(weatherResult.error);
      setWeather(weatherResult.data);
      setLocation({
        name: ipResult.data.city,
        country: ipResult.data.country_name,
        ip: ipResult.data.ip,
        source: 'ip',
        lat: ipResult.data.latitude,
        lon: ipResult.data.longitude
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load weather');
    }
    setLoading(false);
  };

  const tryGps = async () => {
    if (!navigator.geolocation) return loadFromIp();
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const w = await api.getWeather(pos.coords.latitude, pos.coords.longitude);
          if (!w.success) throw new Error(w.error);
          setWeather(w.data);
          setLocation({
            name: 'Your Location',
            country: '',
            source: 'gps',
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
        } catch (e: any) {
          setError(e.message);
          loadFromIp();
        }
        setLoading(false);
      },
      () => loadFromIp(),
      { timeout: 8000 }
    );
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    const result = await api.searchLocation(searchQuery);
    if (result.success) {
      setSearchResults(result.data || []);
    }
  };

  const selectLocation = async (loc: any) => {
    setLoading(true);
    setSearchResults([]);
    setSearchQuery('');
    const w = await api.getWeather(parseFloat(loc.lat), parseFloat(loc.lon));
    if (w.success) {
      setWeather(w.data);
      setLocation({
        name: loc.display_name.split(',')[0],
        country: loc.address?.country || '',
        source: 'search',
        lat: parseFloat(loc.lat),
        lon: parseFloat(loc.lon)
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    tryGps();
  }, []);

  if (loading && !weather) return <div className="max-w-6xl mx-auto p-4 md:p-8"><SectionHeader icon="🌤️" title="Weather Dashboard" description="Live weather using Open-Meteo (no API key)" /><LoadingSpinner text="Detecting your location..." /></div>;

  const current = weather?.current;
  const daily = weather?.daily;
  const hourly = weather?.hourly;
  const wInfo = current ? api.getWeatherInfo(current.weather_code) : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🌤️" title="Weather Dashboard" description="Live weather, 7-day forecast, search any location worldwide" />

      {error && <ErrorBox message={error} onRetry={tryGps} />}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
              placeholder="Search any city, village, or country..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ActionButton onClick={searchLocation}>Search</ActionButton>
          <ActionButton onClick={tryGps} variant="secondary">
            <MapPin className="w-4 h-4" /> Use GPS
          </ActionButton>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {searchResults.map((r, i) => (
              <button
                key={i}
                onClick={() => selectLocation(r)}
                className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
              >
                <p className="text-white text-sm font-medium">{r.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {weather && location && (
        <>
          {/* Main Weather Card */}
          <div className="bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-purple-600/20 border border-blue-500/30 rounded-3xl p-6 md:p-8 mb-6 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">{location.name}{location.country && `, ${location.country}`}</h2>
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full">via {location.source.toUpperCase()}</span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="text-7xl md:text-8xl">{wInfo?.icon}</div>
                <div>
                  <div className="text-5xl md:text-6xl font-bold text-white">{Math.round(current.temperature_2m)}°C</div>
                  <p className="text-lg text-gray-300">{wInfo?.desc}</p>
                  <p className="text-sm text-gray-400">Feels like {Math.round(current.apparent_temperature)}°C</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <StatBlock label="Humidity" value={`${current.relative_humidity_2m}%`} icon="💧" />
              <StatBlock label="Wind Speed" value={`${current.wind_speed_10m} km/h`} icon="💨" />
              <StatBlock label="Precipitation" value={`${current.precipitation} mm`} icon="🌧️" />
              <StatBlock label="UV Index" value={daily?.uv_index_max?.[0] || '0'} icon="☀️" />
            </div>
          </div>

          {/* Hourly Forecast */}
          {hourly && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5" /> Next 12 Hours
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {hourly.time.slice(0, 12).map((time: string, i: number) => (
                  <div key={i} className="flex-shrink-0 bg-white/5 rounded-xl p-3 text-center min-w-[80px]">
                    <p className="text-xs text-gray-400 mb-1">{new Date(time).getHours()}:00</p>
                    <p className="text-xl font-bold text-white">{Math.round(hourly.temperature_2m[i])}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          {daily && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CloudRain className="w-5 h-5" /> 7-Day Forecast
              </h3>
              <div className="space-y-2">
                {daily.time.map((date: string, i: number) => {
                  const info = api.getWeatherInfo(daily.weather_code[i]);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <p className="text-white font-medium w-28">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                      <div className="flex items-center gap-2"><span className="text-2xl">{info.icon}</span><span className="text-sm text-gray-300">{info.desc}</span></div>
                      <div className="flex gap-3 text-sm">
                        <span className="text-blue-400">{Math.round(daily.temperature_2m_min[i])}°</span>
                        <span className="text-white font-bold">{Math.round(daily.temperature_2m_max[i])}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sunrise/Sunset */}
          {daily?.sunrise && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <StatBlock label="🌅 Sunrise" value={new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
              <StatBlock label="🌇 Sunset" value={new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
