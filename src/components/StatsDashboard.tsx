import React from 'react';
import { Image, Film, Music, Folder, Heart, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { storage, formatNumber } from '../utils/storage';

interface StatsDashboardProps {
  items: MediaItem[];
  onClose: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ items, onClose }) => {
  const stats = React.useMemo(() => {
    const totalItems = items.length;
    const images = items.filter(i => i.type === 'image').length;
    const videos = items.filter(i => i.type === 'video').length;
    const audios = items.filter(i => i.type === 'audio').length;
    
    const categories = new Map<string, number>();
    items.forEach(item => {
      const cat = item.category || 'uncategorized';
      categories.set(cat, (categories.get(cat) || 0) + 1);
    });

    const favorites = storage.getFavorites().length;
    
    let totalViews = 0;
    items.forEach(item => {
      totalViews += storage.getViewCount(item.id);
    });

    return {
      totalItems,
      images,
      videos,
      audios,
      categories: Array.from(categories.entries()).sort((a, b) => b[1] - a[1]),
      favorites,
      totalViews
    };
  }, [items]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">📊 Gallery Statistics</h2>
            <p className="text-blue-100 text-sm mt-1">Overview of your media collection</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Folder className="w-6 h-6" />}
              label="Total Items"
              value={stats.totalItems}
              color="blue"
            />
            <StatCard
              icon={<Heart className="w-6 h-6" />}
              label="Favorites"
              value={stats.favorites}
              color="pink"
            />
            <StatCard
              icon={<Eye className="w-6 h-6" />}
              label="Total Views"
              value={stats.totalViews}
              color="green"
              format
            />
            <StatCard
              icon={<Folder className="w-6 h-6" />}
              label="Categories"
              value={stats.categories.length}
              color="purple"
            />
          </div>

          {/* Media Type Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Media Type Breakdown</h3>
            <div className="space-y-3">
              <ProgressBar
                icon={<Image className="w-5 h-5" />}
                label="Images"
                value={stats.images}
                total={stats.totalItems}
                color="bg-blue-500"
              />
              <ProgressBar
                icon={<Film className="w-5 h-5" />}
                label="Videos"
                value={stats.videos}
                total={stats.totalItems}
                color="bg-purple-500"
              />
              <ProgressBar
                icon={<Music className="w-5 h-5" />}
                label="Audio"
                value={stats.audios}
                total={stats.totalItems}
                color="bg-green-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.categories.map(([cat, count]) => (
                <div
                  key={cat}
                  className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-300 capitalize font-medium">{cat}</span>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'pink' | 'green' | 'purple';
  format?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, format }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-pink-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} mb-3`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {format ? formatNumber(value) : value}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
};

interface ProgressBarProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ icon, label, value, total, color }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-gray-300">
          {icon}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-gray-400 text-sm">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
