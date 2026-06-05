import React from 'react';
import { Copy, ExternalLink, Plus, RefreshCw, Loader2 } from 'lucide-react';

interface ApiCardProps {
  icon: React.ReactNode;
  title: string;
  loading?: boolean;
  btnText?: string;
  onBtn?: () => void;
  color?: string;
  children: React.ReactNode;
}

export const ApiCard: React.FC<ApiCardProps> = ({ icon, title, loading, btnText, onBtn, color = 'blue', children }) => {
  const colors: Record<string, string> = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    cyan: 'border-cyan-500/20 bg-cyan-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    yellow: 'border-yellow-500/20 bg-yellow-500/5',
    pink: 'border-pink-500/20 bg-pink-500/5',
    purple: 'border-purple-500/20 bg-purple-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
  };

  return (
    <div className={`rounded-2xl border ${colors[color] || colors.blue} p-5 hover:border-white/20 transition-colors`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold text-white">{icon}{title}</div>
        {btnText && onBtn && (
          <button
            onClick={onBtn}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {btnText}
          </button>
        )}
      </div>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
};

interface PreviewCardProps {
  img?: string;
  title: string;
  subtitle?: string;
  onCopy?: () => void;
  onAdd?: () => void;
  link?: string;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ img, title, subtitle, onCopy, onAdd, link }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-white/20 transition-colors">
    {img && <img src={img} alt={title} className="w-full h-40 object-cover" loading="lazy" />}
    <div className="p-4">
      <p className="text-sm font-semibold text-white truncate">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      <div className="flex gap-2 mt-3">
        {onCopy && <button onClick={onCopy} className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-1"><Copy className="w-3 h-3" />Copy</button>}
        {link && <a href={link} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-1"><ExternalLink className="w-3 h-3" />Open</a>}
        {onAdd && <button onClick={onAdd} className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Add</button>}
      </div>
    </div>
  </div>
);
