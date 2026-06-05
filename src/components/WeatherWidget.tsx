import React, { useEffect, useState } from 'react';
import { CloudSun, MapPin, Droplets, Wind, RefreshCw, Loader2 } from 'lucide-react';
import { WeatherData, IpData, getWeatherByCoords, getIpAndWeather, getUserLocation } from '../utils/apiService';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeather = async () => {
    setLoading(true);
    setError('');
    try {
      // Try browser geolocation first
      try {
        const loc = await getUserLocation();
        const w = await getWeatherByCoords(loc.latitude, loc.longitude);
        w.city = 'Your Location';
        w.source = 'location';
        setWeather(w);
        setLoading(false);
        return;
      } catch {
        // Location denied, fallback to IP
      }

      // Fallback: IP-based location + weather
      const result = await getIpAndWeather();
      setWeather(result.weather);
      setIpData(result.ip);
    } catch (err: any) {
      setError('Weather unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="text-sm text-gray-300">Detecting location & weather...</span>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">⚠️ {error}</p>
        <button onClick={loadWeather} className="mt-2 text-xs text-blue-400 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">Live Weather</span>
        </div>
        <button onClick={loadWeather} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{weather.icon}</div>
        <div>
          <div className="text-3xl font-bold text-white">{weather.temp}°C</div>
          <div className="text-sm text-gray-300">{weather.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Droplets className="w-4 h-4 text-blue-400" />
          <span>Humidity: {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span>Wind: {weather.wind} km/h</span>
        </div>
      </div>

      {ipData && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>{ipData.city}, {ipData.region}, {ipData.country}</span>
          <span className="ml-auto bg-gray-700/50 px-2 py-0.5 rounded-full">via IP: {ipData.ip}</span>
        </div>
      )}

      {weather.source === 'location' && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>📍 Using browser GPS location</span>
        </div>
      )}
    </div>
  );
};
