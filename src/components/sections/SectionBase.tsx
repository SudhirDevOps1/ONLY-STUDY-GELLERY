import React from 'react';
import { Loader2, RefreshCw, ExternalLink, Copy, Plus, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/storage';

export const SectionHeader: React.FC<{ icon?: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="mb-6 pb-4 border-b border-white/10">
    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
      {icon && <span className="text-3xl">{icon}</span>}
      {title}
    </h1>
    <p className="text-sm text-gray-400 mt-2">{description}</p>
  </div>
);

export const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

export const ErrorBox: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
    <p className="text-red-300 mb-3">⚠️ {message}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
        Retry
      </button>
    )}
  </div>
);

interface ApiToolCardProps {
  icon: string;
  title: string;
  loading?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'cyan' | 'red' | 'orange' | 'emerald';
}

export const ApiToolCard: React.FC<ApiToolCardProps> = ({ icon, title, loading, onRefresh, children, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-blue-500/30 hover:border-blue-500/60 from-blue-500/10 to-cyan-500/10',
    green: 'border-green-500/30 hover:border-green-500/60 from-green-500/10 to-emerald-500/10',
    purple: 'border-purple-500/30 hover:border-purple-500/60 from-purple-500/10 to-violet-500/10',
    pink: 'border-pink-500/30 hover:border-pink-500/60 from-pink-500/10 to-rose-500/10',
    yellow: 'border-yellow-500/30 hover:border-yellow-500/60 from-yellow-500/10 to-orange-500/10',
    cyan: 'border-cyan-500/30 hover:border-cyan-500/60 from-cyan-500/10 to-teal-500/10',
    red: 'border-red-500/30 hover:border-red-500/60 from-red-500/10 to-pink-500/10',
    orange: 'border-orange-500/30 hover:border-orange-500/60 from-orange-500/10 to-yellow-500/10',
    emerald: 'border-emerald-500/30 hover:border-emerald-500/60 from-emerald-500/10 to-green-500/10',
  };

  return (
    <div className={`rounded-2xl border ${colorClasses[color]} bg-gradient-to-br backdrop-blur-sm transition-all duration-300 overflow-hidden`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="text-xl">{icon}</span> {title}
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          )}
        </div>
        <div className="text-sm text-gray-200">{children}</div>
      </div>
    </div>
  );
};

export const StatBlock: React.FC<{ label: string; value: string | number; icon?: string }> = ({ label, value, icon }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <div className="flex items-center gap-2 mb-1">
      {icon && <span className="text-lg">{icon}</span>}
      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-lg font-bold text-white truncate">{value || '--'}</p>
  </div>
);

export const ImagePreview: React.FC<{
  src: string;
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  onCopy?: () => void;
  externalLink?: string;
}> = ({ src, title, subtitle, onAdd, onCopy, externalLink }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    if (onCopy) { onCopy(); return; }
    await copyToClipboard(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden hover:border-blue-500/50 transition-colors">
      <div className="relative aspect-video bg-gray-900">
        <img src={src} alt={title} loading="lazy" className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        <div className="flex gap-1 mt-3">
          <button onClick={handleCopy} className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-1">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {externalLink && (
            <a href={externalLink} target="_blank" rel="noopener noreferrer" className="flex-1 text-xs bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" />Open
            </a>
          )}
          {onAdd && (
            <button onClick={onAdd} className="flex-1 text-xs bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
              <Plus className="w-3 h-3" />Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const TextResultBox: React.FC<{ text: string; label?: string }> = ({ text, label }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    {label && <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{label}</p>}
    <p className="text-white leading-relaxed">{text}</p>
  </div>
);

export const ActionButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ onClick, loading, variant = 'primary', children, fullWidth }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500',
    secondary: 'bg-gray-700 hover:bg-gray-600',
    success: 'bg-green-600 hover:bg-green-500',
    danger: 'bg-red-600 hover:bg-red-500',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${variants[variant]} ${fullWidth ? 'w-full' : ''} text-white px-4 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
