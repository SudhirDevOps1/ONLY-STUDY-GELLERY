import React, { useEffect, useState } from 'react';
import { SectionHeader, ApiToolCard, ImagePreview, ActionButton } from './SectionBase';
import * as api from '../../utils/apis';
import { MediaItem } from '../../types';

interface Props {
  onAddMedia: (item: MediaItem) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}

export const ToolsSection: React.FC<Props> = ({ onAddMedia, showToast }) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const load = async (key: string, fn: () => Promise<any>) => {
    setLoading((p: any) => ({ ...p, [key]: true }));
    const result = await fn();
    if (result.success !== false) {
      setData((p: any) => ({ ...p, [key]: result.data || result }));
    } else {
      showToast('error', `${key} failed: ${result.error}`);
    }
    setLoading((p: any) => ({ ...p, [key]: false }));
  };

  useEffect(() => {
    load('ip', api.getIpLocation);
    load('users', () => api.getRandomUsers(3));
    load('dict', () => api.getDictionary('hello'));
    load('nasa', api.getNasaApod);
    load('dogs', () => api.getDogPhotos(6));
    load('cat', api.getCatImage);
    load('fox', api.getFoxImage);
    load('duck', api.getDuckImage);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <SectionHeader icon="🛠️" title="Free Tools Dashboard" description="12+ tools powered by free APIs. No API keys needed." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* IP Location */}
        <ApiToolCard icon="🌐" title="IP Location" loading={loading.ip} onRefresh={() => load('ip', api.getIpLocation)} color="cyan">
          {data.ip ? (
            <div className="space-y-1.5">
              <p><span className="text-gray-400">📍</span> {data.ip.city}, {data.ip.region}, {data.ip.country_name}</p>
              <p className="font-mono text-xs text-blue-300">IP: {data.ip.ip}</p>
              <p className="text-xs text-gray-500">{data.ip.org}</p>
            </div>
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Dictionary */}
        <ApiToolCard icon="📖" title="Dictionary: hello" loading={loading.dict} onRefresh={() => load('dict', () => api.getDictionary('hello'))} color="purple">
          {data.dict?.[0] ? (
            <div className="space-y-2">
              <p className="text-base font-bold text-white">{data.dict[0].word}</p>
              <p className="text-xs text-blue-300 italic">{data.dict[0].phonetic}</p>
              {data.dict[0].meanings?.slice(0, 2).map((m: any, i: number) => (
                <div key={i}>
                  <p className="text-xs text-purple-300 font-semibold">{m.partOfSpeech}</p>
                  <p className="text-xs text-gray-300">• {m.definitions?.[0]?.definition}</p>
                </div>
              ))}
            </div>
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Random Users */}
        <ApiToolCard icon="👥" title="Random Users" loading={loading.users} onRefresh={() => load('users', () => api.getRandomUsers(3))} color="emerald">
          {data.users?.results?.map((u: any, i: number) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <img src={u.picture.thumbnail} alt="" className="w-10 h-10 rounded-full" />
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{u.name.first} {u.name.last}</p>
                <p className="text-xs text-gray-400 truncate">{u.location.city}, {u.location.country}</p>
              </div>
            </div>
          ))}
        </ApiToolCard>

        {/* NASA APOD */}
        <ApiToolCard icon="🚀" title="NASA Picture of the Day" loading={loading.nasa} onRefresh={() => load('nasa', api.getNasaApod)} color="blue">
          {data.nasa?.url ? (
            <div>
              <img src={data.nasa.url} alt={data.nasa.title} className="w-full h-32 object-cover rounded-lg mb-2" />
              <p className="text-xs font-semibold text-white">{data.nasa.title}</p>
              <p className="text-xs text-gray-400 mt-1">{data.nasa.date}</p>
              <ActionButton onClick={() => onAddMedia({ id: `nasa-${Date.now()}`, title: data.nasa.title, type: 'image', src: data.nasa.url, category: 'nasa', description: data.nasa.explanation })} variant="success" fullWidth>
                Add to Gallery
              </ActionButton>
            </div>
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Cat Image */}
        <ApiToolCard icon="🐱" title="Random Cat" loading={loading.cat} onRefresh={() => load('cat', api.getCatImage)} color="pink">
          {data.cat?.[0]?.url ? (
            <ImagePreview
              src={data.cat[0].url}
              title="Random Cat"
              onAdd={() => onAddMedia({ id: `cat-${Date.now()}`, title: 'Random Cat', type: 'image', src: data.cat[0].url, category: 'animals', description: 'Random cat photo' })}
            />
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Fox */}
        <ApiToolCard icon="🦊" title="Random Fox" loading={loading.fox} onRefresh={() => load('fox', api.getFoxImage)} color="orange">
          {data.fox?.image ? (
            <ImagePreview
              src={data.fox.image}
              title="Random Fox"
              onAdd={() => onAddMedia({ id: `fox-${Date.now()}`, title: 'Random Fox', type: 'image', src: data.fox.image, category: 'animals', description: 'Random fox photo' })}
            />
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Duck */}
        <ApiToolCard icon="🦆" title="Random Duck" loading={loading.duck} onRefresh={() => load('duck', api.getDuckImage)} color="yellow">
          {data.duck?.url ? (
            <ImagePreview
              src={data.duck.url}
              title="Random Duck"
              onAdd={() => onAddMedia({ id: `duck-${Date.now()}`, title: 'Random Duck', type: 'image', src: data.duck.url, category: 'animals', description: 'Random duck photo' })}
            />
          ) : 'Loading...'}
        </ApiToolCard>

        {/* Dogs Grid */}
        <ApiToolCard icon="🐕" title="Random Dogs (6)" loading={loading.dogs} onRefresh={() => load('dogs', () => api.getDogPhotos(6))} color="green">
          <div className="grid grid-cols-3 gap-2">
            {data.dogs?.message?.map((url: string, i: number) => (
              <img
                key={i}
                src={url}
                alt={`Dog ${i + 1}`}
                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onAddMedia({ id: `dog-${Date.now()}-${i}`, title: `Random Dog ${i + 1}`, type: 'image', src: url, category: 'animals', description: 'Random dog photo' })}
              />
            ))}
          </div>
        </ApiToolCard>
      </div>
    </div>
  );
};
