const STORAGE_KEYS = {
  FAVORITES: 'mediacloud_favorites',
  VIEW_COUNTS: 'mediacloud_view_counts',
  SETTINGS: 'mediacloud_settings',
  RECENT_VIEWS: 'mediacloud_recent_views',
};

export const storage = {
  getFavorites: (): (string | number)[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setFavorites: (favorites: (string | number)[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  },

  toggleFavorite: (id: string | number) => {
    const favorites = storage.getFavorites();
    const exists = favorites.includes(id);
    if (exists) {
      storage.setFavorites(favorites.filter(f => f !== id));
    } else {
      storage.setFavorites([...favorites, id]);
    }
    return !exists;
  },

  isFavorite: (id: string | number): boolean => {
    return storage.getFavorites().includes(id);
  },

  getViewCount: (id: string | number): number => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIEW_COUNTS);
      const counts = data ? JSON.parse(data) : {};
      return counts[id] || 0;
    } catch {
      return 0;
    }
  },

  incrementViewCount: (id: string | number) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VIEW_COUNTS);
      const counts = data ? JSON.parse(data) : {};
      counts[id] = (counts[id] || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.VIEW_COUNTS, JSON.stringify(counts));
    } catch (e) {
      console.error('Failed to increment view count', e);
    }
  },

  getSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSettings: (settings: any) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getRecentViews: (): (string | number)[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_VIEWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToRecentViews: (id: string | number) => {
    try {
      const recent = storage.getRecentViews().filter(r => r !== id);
      recent.unshift(id);
      const limited = recent.slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.RECENT_VIEWS, JSON.stringify(limited));
    } catch (e) {
      console.error('Failed to update recent views', e);
    }
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (e) {
        document.body.removeChild(textarea);
        return false;
      }
    }
  } catch {
    return false;
  }
};

export const shareMedia = async (title: string, url: string): Promise<void> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
    } catch (e) {
      console.log('Share cancelled');
    }
  } else {
    await copyToClipboard(`${title}\n${url}`);
  }
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
  return (num / 1000000).toFixed(1) + 'M';
};
