import React, { useEffect, useState } from 'react';
import { CloudSun, MapPin, Droplets, Wind, RefreshCw, Loader2 } from 'lucide-react';
import * as api from '../utils/apis';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [ipData, setIpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWeather = async () => {
    setLoading(true);
    setError('');
    
    // Try GPS first
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const w = await api.getWeather(pos.coords.latitude, pos.coords.longitude);
        if (w.success) {
          setWeather(w.data);
          setIpData(null);
          setLoading(false);
          return;
        }
      } catch {}
    }

    // Fallback: IP-based
    try {
      const ipResult = await api.getIpLocation();
      if (ipResult.success) {
        setIpData(ipResult.data);
        const w = await api.getWeather(ipResult.data.latitude, ipResult.data.longitude);
        if (w.success) setWeather(w.data);
      }
    } catch (e: any) {
      setError('Weather unavailable');
    }
    setLoading(false);
  };

  useEffect(() => { loadWeather(); }, []);

  if (loading) return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-5">
      <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /><span className="text-sm text-gray-300">Loading weather...</span></div>
    </div>
  );

  if (error || !weather) return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
      <p className="text-sm text-red-300">⚠️ {error || 'Weather unavailable'}</p>
      <button onClick={loadWeather} className="mt-2 text-xs text-blue-400 hover:underline">Retry</button>
    </div>
  );

  const current = weather.current;
  const winfo = api.getWeatherInfo(current?.weather_code || 0);

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><CloudSun className="w-5 h-5 text-blue-400" /><span className="font-semibold text-white">Live Weather</span></div>
        <button onClick={loadWeather} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"><RefreshCw className="w-4 h-4" /></button>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{winfo.icon}</div>
        <div>
          <div className="text-3xl font-bold text-white">{Math.round(current?.temperature_2m || 0)}°C</div>
          <div className="text-sm text-gray-300">{winfo.desc}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300"><Droplets className="w-4 h-4 text-blue-400" /><span>{current?.relative_humidity_2m || 0}%</span></div>
        <div className="flex items-center gap-2 text-gray-300"><Wind className="w-4 h-4 text-cyan-400" /><span>{current?.wind_speed_10m || 0} km/h</span></div>
      </div>
      {ipData && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{ipData.city}, {ipData.country_name}</span>
          <span className="ml-auto bg-gray-700/50 px-2 py-0.5 rounded-full text-[10px]">via IP</span>
        </div>
      )}
      {!ipData && (
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span>📍 GPS Location</span>
        </div>
      )}
    </div>
  );
};
